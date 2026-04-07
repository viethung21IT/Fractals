function initMandelbrot(canvas, uiContainer) {
    const gl = canvas.getContext('webgl');
    if (!gl) return () => {};

    uiContainer.innerHTML = `
        <div class="control-group">
            <label>Loại Fractal:</label>
            <select id="mandel-type">
                <option value="mandelbrot">Tập Mandelbrot</option>
                <option value="julia">Tập Julia</option>
            </select>
        </div>

        <div id="mandel-julia-controls" style="display: none;">
            <div class="control-group">
                <label>Julia Constant C (Real): <span id="mandel-cx-val">-0.4</span></label>
                <input type="range" id="mandel-julia-cx" min="-2.0" max="2.0" step="0.01" value="-0.4">
            </div>
            <div class="control-group">
                <label>Julia Constant C (Imag): <span id="mandel-cy-val">0.6</span></label>
                <input type="range" id="mandel-julia-cy" min="-2.0" max="2.0" step="0.01" value="0.6">
            </div>
        </div>

        <div class="control-group">
            <label>Số vòng lặp (Max Iter): <span id="mandel-iter-val">200</span></label>
            <input type="range" id="mandel-max-iter" min="50" max="1000" step="10" value="200">
        </div>

        <button id="mandel-reset-btn">Reset Góc Nhìn</button>
        
        <div class="instructions">
            <p>🖱️ <b>Kéo chuột:</b> Di chuyển (Pan)</p>
            <p>⚙️ <b>Cuộn chuột/Zoom:</b> Phóng to/Thu nhỏ</p>
        </div>
    `;

    const vertexShaderSource = `
        attribute vec2 a_position;
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;

    const mandelbrotFragmentShaderSource = `
        precision highp float;
        uniform vec2 u_resolution; uniform vec2 u_offset; uniform float u_zoom; uniform int u_maxIterations;
        vec3 getSmoothColor(float n) {
            float t = n / float(u_maxIterations);
            return 0.5 + 0.5 * cos(6.28318 * (t * vec3(1.0, 1.0, 1.0) + vec3(0.0, 0.10, 0.20)));
        }
        void main() {
            vec2 uv = (gl_FragCoord.xy - u_resolution.xy / 2.0) / u_resolution.y;
            vec2 c = uv / u_zoom + u_offset; vec2 z = vec2(0.0); float iter = 0.0;
            for(int i = 0; i < 1000; i++) {
                if(i >= u_maxIterations) break;
                float x = (z.x * z.x - z.y * z.y) + c.x;
                float y = (2.0 * z.x * z.y) + c.y; z = vec2(x, y);
                if(dot(z, z) > 4.0) break; iter++;
            }
            if(iter >= float(u_maxIterations)) {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            } else {
                float smoothIter = iter - log2(log2(dot(z, z))) + 4.0;
                gl_FragColor = vec4(getSmoothColor(smoothIter), 1.0);
            }
        }
    `;

    const juliaFragmentShaderSource = `
        precision highp float;
        uniform vec2 u_resolution; uniform vec2 u_offset; uniform float u_zoom; 
        uniform int u_maxIterations; uniform vec2 u_juliaConstant;
        vec3 getSmoothColor(float n) {
            float t = n / float(u_maxIterations);
            return 0.5 + 0.5 * cos(6.28318 * (t * vec3(1.0, 0.5, 0.0) + vec3(0.5, 0.20, 0.25)));
        }
        void main() {
            vec2 uv = (gl_FragCoord.xy - u_resolution.xy / 2.0) / u_resolution.y;
            vec2 z = uv / u_zoom + u_offset; vec2 c = u_juliaConstant; float iter = 0.0;
            for(int i = 0; i < 1000; i++) {
                if(i >= u_maxIterations) break;
                float x = (z.x * z.x - z.y * z.y) + c.x; float y = (2.0 * z.x * z.y) + c.y; z = vec2(x, y);
                if(dot(z, z) > 4.0) break; iter++;
            }
            if(iter >= float(u_maxIterations)) {
                gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            } else {
                float smoothIter = iter - log2(log2(dot(z, z))) + 4.0;
                gl_FragColor = vec4(getSmoothColor(smoothIter), 1.0);
            }
        }
    `;

    function compileShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
    }

    function createProgram(gl, vertexSource, fragmentSource) {
        const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader); gl.attachShader(program, fragmentShader); gl.linkProgram(program);
        return program;
    }

    const mandelbrotProgram = createProgram(gl, vertexShaderSource, mandelbrotFragmentShaderSource);
    const juliaProgram = createProgram(gl, vertexShaderSource, juliaFragmentShaderSource);

    function initBuffer(gl, program) {
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        const positions = new Float32Array([-1.0,-1.0, 1.0,-1.0, -1.0,1.0, -1.0,1.0, 1.0,-1.0, 1.0,1.0]);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        const positionLocation = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    }

    let state = {
        zoom: 0.5, offsetX: -0.5, offsetY: 0.0, maxIterations: 200,
        juliaC: { x: -0.4, y: 0.6 }, type: 'mandelbrot'
    };

    let pProgram = mandelbrotProgram;
    initBuffer(gl, pProgram);

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    function switchFractal() {
        state.type = document.getElementById("mandel-type").value;
        const juliaControls = document.getElementById("mandel-julia-controls");
        if (state.type === 'mandelbrot') {
            pProgram = mandelbrotProgram; juliaControls.style.display = "none";
            state.offsetX = -0.5; state.offsetY = 0.0; state.zoom = 0.5;
        } else {
            pProgram = juliaProgram; juliaControls.style.display = "block";
            state.offsetX = 0.0; state.offsetY = 0.0; state.zoom = 0.8;
        }
        initBuffer(gl, pProgram);
    }

    let isRequestingRun = true;
    function render() {
        if(!isRequestingRun) return;
        gl.useProgram(pProgram);
        gl.uniform2f(gl.getUniformLocation(pProgram, "u_resolution"), canvas.width, canvas.height);
        gl.uniform2f(gl.getUniformLocation(pProgram, "u_offset"), state.offsetX, state.offsetY);
        gl.uniform1f(gl.getUniformLocation(pProgram, "u_zoom"), state.zoom);
        gl.uniform1i(gl.getUniformLocation(pProgram, "u_maxIterations"), state.maxIterations);
        if (state.type === 'julia') {
            gl.uniform2f(gl.getUniformLocation(pProgram, "u_juliaConstant"), state.juliaC.x, state.juliaC.y);
        }
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(render);
    }

    document.getElementById("mandel-type").addEventListener("change", switchFractal);
    const updateVal = (id, stateKey, displayId) => {
        document.getElementById(id).addEventListener("input", (e) => {
            const val = parseFloat(e.target.value);
            if(typeof stateKey === 'string') state[stateKey] = val;
            else { state.juliaC[stateKey[1]] = val; }
            document.getElementById(displayId).innerText = val;
        });
    };
    updateVal("mandel-max-iter", "maxIterations", "mandel-iter-val");
    updateVal("mandel-julia-cx", ["juliaC", "x"], "mandel-cx-val");
    updateVal("mandel-julia-cy", ["juliaC", "y"], "mandel-cy-val");
    document.getElementById("mandel-reset-btn").addEventListener("click", switchFractal);

    let isDragging = false, lastMouse = { x: 0, y: 0 };
    const wheelCb = (e) => {
        const zoomFactor = 1.1;
        if (e.deltaY < 0) state.zoom *= zoomFactor; else state.zoom /= zoomFactor;
    };
    const mDownCb = (e) => { isDragging = true; lastMouse = { x: e.clientX, y: e.clientY }; };
    const mUpCb = () => isDragging = false;
    const mMoveCb = (e) => {
        if (!isDragging) return;
        state.offsetX -= (e.clientX - lastMouse.x) / (canvas.width * state.zoom);
        state.offsetY += (e.clientY - lastMouse.y) / (canvas.height * state.zoom); 
        lastMouse = { x: e.clientX, y: e.clientY };
    };

    canvas.addEventListener('wheel', wheelCb);
    canvas.addEventListener('mousedown', mDownCb);
    window.addEventListener('mouseup', mUpCb);
    window.addEventListener('mousemove', mMoveCb);

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    requestAnimationFrame(render);

    return () => {
        isRequestingRun = false;
        canvas.removeEventListener('wheel', wheelCb);
        canvas.removeEventListener('mousedown', mDownCb);
        window.removeEventListener('mouseup', mUpCb);
        window.removeEventListener('mousemove', mMoveCb);
        window.removeEventListener('resize', resizeCanvas);
    };
}