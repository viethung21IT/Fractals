// FRACTAL MAIN COORDINATOR

const container = document.getElementById("canvas-container");
const fractalSelector = document.getElementById("fractal-type");
const dynamicControls = document.getElementById("dynamic-controls");
const authorName = document.getElementById("author-name");

// Lưu giữ trạng thái hủy của fractal trước
let cleanupCurrentFractal = null;

function resetCanvas(type) {
    if (cleanupCurrentFractal) {
        cleanupCurrentFractal();
        cleanupCurrentFractal = null;
    }
    
    // Xóa canvas cũ
    container.innerHTML = "";
    
    // Tạo canvas mới
    const canvas = document.createElement("canvas");
    canvas.id = "glcanvas";
    container.appendChild(canvas);
    
    // Set class draggable if type is mandelbrot
    if (type === 'mandelbrot') {
        canvas.classList.add('draggable');
    }
    return canvas;
}

function loadFractal() {
    const type = fractalSelector.value;
    dynamicControls.innerHTML = "";
    
    const canvas = resetCanvas(type);
    
    if (type === "koch") {
        authorName.textContent = "Nguyễn Công Hậu - 23520453";
        cleanupCurrentFractal = initKoch(canvas, dynamicControls);
    } else if (type === "minkowski") {
        authorName.textContent = "Nguyễn Việt Hùng - 23530571";
        cleanupCurrentFractal = initMinkowski(canvas, dynamicControls);
    } else if (type === "sierpinski") {
        authorName.textContent = "Nguyễn Minh Hoàng - 23520530";
        cleanupCurrentFractal = initSierpinski(canvas, dynamicControls);
    } else if (type === "mandelbrot") {
        authorName.textContent = "Trần Anh Quốc - 23521313";
        cleanupCurrentFractal = initMandelbrot(canvas, dynamicControls);
    }
}

// Bắt sự kiện chuyển fractal
fractalSelector.addEventListener("change", loadFractal);

// Chạy lần đầu
loadFractal();