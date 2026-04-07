function initKoch(canvas, uiContainer) {
    const gl = canvas.getContext('webgl');
    if (!gl) return () => {};

    // Giao diện điều khiển
    uiContainer.innerHTML = `
        <div class="control-group">
            <label>Mức đệ quy (Iterations): <span id="k-iter">4</span></label>
            <input type="range" id="koch-iteration" min="0" max="7" value="4">
        </div>
        <div class="instructions">
            <p>💡 Bông tuyết Von Koch là một đường gấp khúc được tạo ra bằng cách chia một đoạn thẳng thành ba đoạn bằng nhau và thay thế đoạn giữa bằng hai đoạn tạo thành một tam giác đều.</p>
        </div>
    `;

    const vertexShaderSource = `
        attribute vec2 a_position;
        uniform vec2 u_resolution;
        void main() {
            float aspect = u_resolution.x / u_resolution.y;
            vec2 pos = a_position;
            if (aspect > 1.0) pos.x /= aspect;
            else pos.y *= aspect;
            gl_Position = vec4(pos, 0.0, 1.0);
        }
    `;

    const fragmentShaderSource = `
        precision mediump float;
        void main() {
            gl_FragColor = vec4(0.5, 0.8, 1.0, 1.0);
        }
    `;

    function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
    }

    const program = gl.createProgram();
    gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vertexShaderSource));
    gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource));
    gl.linkProgram(program);

    const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    const positionBuffer = gl.createBuffer();

    function generateKochSnowflake(iterations) {
        let points = [];
        function addKochCurve(p0, p1, depth) {
            if (depth === 0) {
                points.push(p0.x, p0.y);
            } else {
                const dx = p1.x - p0.x, dy = p1.y - p0.y;
                const pA = p0;
                const pB = { x: p0.x + dx / 3, y: p0.y + dy / 3 };
                const vX = dx / 3, vY = dy / 3;
                const cos60 = 0.5, sin60 = Math.sqrt(3) / 2;
                const pC = { x: pB.x + (vX * cos60 - vY * sin60), y: pB.y + (vX * sin60 + vY * cos60) };
                const pD = { x: p0.x + 2 * dx / 3, y: p0.y + 2 * dy / 3 };
                const pE = p1;
                addKochCurve(pA, pB, depth - 1);
                addKochCurve(pB, pC, depth - 1);
                addKochCurve(pC, pD, depth - 1);
                addKochCurve(pD, pE, depth - 1);
            }
        }
        
        // Fit scaling
        const size = 0.7;
        const h = size * Math.sqrt(3) / 2;
        const p1 = { x: 0, y: size - 0.2 };
        const p2 = { x: h, y: -size/2 - 0.2 };
        const p3 = { x: -h, y: -size/2 - 0.2 };

        addKochCurve(p3, p1, iterations);
        addKochCurve(p1, p2, iterations);
        addKochCurve(p2, p3, iterations);
        points.push(p3.x, p3.y);

        return new Float32Array(points);
    }

    function draw() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        
        let iter = parseInt(document.getElementById("koch-iteration").value);
        const vertices = generateKochSnowflake(iter);

        gl.clearColor(0.02, 0.02, 0.02, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);
        
        gl.uniform2f(gl.getUniformLocation(program, "u_resolution"), canvas.width, canvas.height);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.LINE_STRIP, 0, vertices.length / 2);
    }

    const iterInput = document.getElementById('koch-iteration');
    const iterVal = document.getElementById('k-iter');

    const onChangeFn = (e) => {
        iterVal.innerText = e.target.value;
        draw();
    };

    iterInput.addEventListener('input', onChangeFn);
    window.addEventListener('resize', draw);
    draw();

    return () => {
        window.removeEventListener('resize', draw);
    };
}