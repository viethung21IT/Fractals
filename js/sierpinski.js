function initSierpinski(canvas, uiContainer) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return () => {};

    uiContainer.innerHTML = `
        <div class="control-group">
            <label>Loại Fractal:</label>
            <select id="sierpinski-type">
                <option value="triangle">Tam giác Sierpinski</option>
                <option value="carpet">Hình vuông Sierpinski</option>
            </select>
        </div>

        <div class="control-group">
            <label>Độ sâu đệ quy: <span id="s-depth-val">0</span></label>
            <input type="range" id="sierpinski-depth" min="0" max="6" value="0" step="1">
        </div>
        
        <div class="stats-panel">
            <p>Số phần tử: <strong id="s-statElements" class="highlight">1</strong></p>
        </div>
        <div class="instructions">
            <p>💡 Thử thay đổi các mức độ sâu để xem hệ thống Fractal phát sinh chi tiết hơn trên mỗi lần lặp đệ quy.</p>
        </div>
    `;

    let fractalType = 'triangle';
    let depth = 0;
    let fillColor = '#6C63FF';
    let strokeColor = '#A29BFE';
    let bgColor = '#050505';

    function resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const w = window.innerWidth;
        const h = window.innerHeight;
        
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        draw();
    }

    function draw() {
        const w = parseInt(canvas.style.width);
        const h = parseInt(canvas.style.height);

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, w, h);

        let elementCount = 0;
        if (fractalType === 'triangle') elementCount = drawSierpinskiTriangle(w, h);
        else elementCount = drawSierpinskiCarpet(w, h);

        document.getElementById('s-statElements').textContent = elementCount.toLocaleString('vi-VN');
    }

    function drawSierpinskiTriangle(canvasW, canvasH) {
        const padding = 0.85;
        const side = Math.min(canvasW, canvasH) * padding;
        const triHeight = (Math.sqrt(3) / 2) * side;
        
        // Căn ra giữa 
        const centerX = canvasW / 2;
        const centerY = canvasH / 2;

        const A = { x: centerX, y: centerY - triHeight / 2 };
        const B = { x: centerX - side / 2, y: centerY + triHeight / 2 };
        const C = { x: centerX + side / 2, y: centerY + triHeight / 2 };

        let count = 0;

        function recurse(p1, p2, p3, d) {
            if (d === 0) {
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(p3.x, p3.y); ctx.closePath();
                ctx.fillStyle = fillColor; ctx.strokeStyle = strokeColor; ctx.lineWidth = 0.5;
                ctx.fill(); ctx.stroke();
                count++; return;
            }
            const mid12 = { x: (p1.x+p2.x)/2, y: (p1.y+p2.y)/2 };
            const mid23 = { x: (p2.x+p3.x)/2, y: (p2.y+p3.y)/2 };
            const mid31 = { x: (p3.x+p1.x)/2, y: (p3.y+p1.y)/2 };
            recurse(p1, mid12, mid31, d - 1);
            recurse(mid12, p2, mid23, d - 1);
            recurse(mid31, mid23, p3, d - 1);
        }
        recurse(A, B, C, depth);
        return count;
    }

    function drawSierpinskiCarpet(canvasW, canvasH) {
        const padding = 0.8;
        const side = Math.min(canvasW, canvasH) * padding;
        const startX = (canvasW - side) / 2;
        const startY = (canvasH - side) / 2;
        let count = 0;

        function recurse(x, y, size, d) {
            if (d === 0) {
                ctx.fillStyle = fillColor; ctx.strokeStyle = strokeColor; ctx.lineWidth = 0.3;
                ctx.fillRect(x, y, size, size); ctx.strokeRect(x, y, size, size);
                count++; return;
            }
            const sub = size / 3;
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    if (row === 1 && col === 1) continue;
                    recurse(x + col * sub, y + row * sub, sub, d - 1);
                }
            }
        }
        recurse(startX, startY, side, depth);
        return count;
    }

    const tSelect = document.getElementById("sierpinski-type");
    const dSlider = document.getElementById("sierpinski-depth");

    tSelect.addEventListener("change", (e) => { fractalType = e.target.value; draw(); });
    dSlider.addEventListener("input", (e) => { 
        depth = parseInt(e.target.value); 
        document.getElementById("s-depth-val").innerText = depth; 
        draw(); 
    });

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return () => {
        window.removeEventListener('resize', resizeCanvas);
    };
}