function initMinkowski(canvas, uiContainer) {
    const gl = canvas.getContext('webgl');
    if (!gl) return () => {};

    uiContainer.innerHTML = `
        <div class="control-group">
            <label>Mức đệ quy (Level): <span id="m-iter">3</span></label>
            <input type="range" id="minkowski-iteration" min="0" max="6" value="3">
        </div>
        <div class="stats-panel">
            <p>Số đỉnh: <strong id="m-vertexCount" class="highlight">0</strong></p>
            <p>Số đoạn thẳng: <strong id="m-segmentCount" class="highlight">0</strong></p>
            <p>Độ phức tạp tính toán: <strong class="highlight">O(8^n)</strong></p>
            <p>Chiều không gian Fractal: <strong class="highlight">1.5</strong></p>
        </div>
        <div class="instructions">
            <p>💡 Đảo Minkowski liên quan đến việc thay thế mỗi đoạn thẳng bằng 8 đoạn nhỏ hơn (mỗi đoạn bằng 1/4 độ dài gốc) theo một quy luật cố định.</p>
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
            gl_FragColor = vec4(0.0, 1.0, 0.5, 1.0);
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

    function normalizePoints(points) {
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        for (let i = 0; i < points.length; i += 2) {
            if (points[i] < minX) minX = points[i];
            if (points[i] > maxX) maxX = points[i];
            if (points[i + 1] < minY) minY = points[i + 1];
            if (points[i + 1] > maxY) maxY = points[i + 1];
        }
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const width = maxX - minX;
        const height = maxY - minY;
        const scale = 1.3 / Math.max(width, height); 
        const normalizedPoints = new Float32Array(points.length);
        for (let i = 0; i < points.length; i += 2) {
            normalizedPoints[i] = (points[i] - centerX) * scale;
            normalizedPoints[i + 1] = (points[i + 1] - centerY) * scale;
        }
        return normalizedPoints;
    }

    function generateMinkowski(iterations) {
        let points = [];
        const corners = [[-0.5, 0.5], [0.5, 0.5], [0.5, -0.5], [-0.5, -0.5]];

        function addMinkowskiCurve(x1, y1, x2, y2, level) {
            if (level === 0) {
                points.push(x1, y1);
                return;
            }
            const dx = (x2 - x1) / 4, dy = (y2 - y1) / 4;
            const left_dx = -dy, left_dy = dx;
            const right_dx = dy, right_dy = -dx;

            let px = x1, py = y1;
            const steps = [
                [dx, dy], [left_dx, left_dy], [dx, dy], [right_dx, right_dy],
                [right_dx, right_dy], [dx, dy], [left_dx, left_dy], [dx, dy]
            ];

            for (let i = 0; i < 8; i++) {
                const nextX = px + steps[i][0];
                const nextY = py + steps[i][1];
                addMinkowskiCurve(px, py, nextX, nextY, level - 1);
                px = nextX; py = nextY;
            }
        }

        for (let i = 0; i < corners.length; i++) {
            const start = corners[i], end = corners[(i + 1) % corners.length];
            addMinkowskiCurve(start[0], start[1], end[0], end[1], iterations);
        }
        return normalizePoints(points);
    }

    function draw() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        
        let iter = parseInt(document.getElementById("minkowski-iteration").value);
        const vertices = generateMinkowski(iter);

        const vCount = vertices.length / 2;
        document.getElementById('m-vertexCount').textContent = vCount.toLocaleString('vi-VN');
        document.getElementById('m-segmentCount').textContent = vCount.toLocaleString('vi-VN');

        gl.clearColor(0.02, 0.02, 0.02, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);

        gl.uniform2f(gl.getUniformLocation(program, "u_resolution"), canvas.width, canvas.height);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.LINE_LOOP, 0, vertices.length / 2);
    }

    const iterInput = document.getElementById('minkowski-iteration');
    const iterVal = document.getElementById('m-iter');

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