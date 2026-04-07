# Fractal Explorer - Tổng hợp hệ thống phát sinh Fractal

Tiểu luận môn **CS105 - Đồ hoạ máy tính**.

1. **Bông tuyết Von Koch** (Nguyễn Công Hậu - 23520453)
2. **Tam giác & Hình vuông Sierpinski** (Nguyễn Minh Hoàng - 23520530)
3. **Đảo Minkowski** (Nguyễn Việt Hùng - 23530571)
4. **Tập Mandelbrot & Julia Set** (Trần Anh Quốc - 23521313)

---

## Hướng dẫn khởi chạy (How to run)

### Cách 1: Sử dụng VS Code + Live Server (Khuyến nghị)
1. Mở thư mục code bằng **Visual Studio Code**.
2. Cài đặt extension **Live Server** trong phần Extensions của VS Code (nếu chưa cài đặt).
3. Mở file `index.html`.
4. Nhấn chuột phải vào vùng code và chọn **"Open with Live Server"** (hoặc nhấn nút `Go Live` ở thanh trạng thái góc dưới bên phải).
5. Trình duyệt mặc định sẽ tự động mở trang web.

### Cách 2: Sử dụng Python (Nếu máy đã cài sẵn Python)
1. Mở Terminal (Command Prompt / PowerShell) và trỏ đường dẫn tới thư mục `Combined_Fractals`.
   ```bash
   cd F:\do_hoa_may_tinh\tieu_luan\Combined_Fractals
   ```
2. Chạy 1 trong 2 lệnh sau tuỳ vào phiên bản Python của bạn:
   - Với Python 3.x: `python -m http.server 8000`
   - Với Python 2.x: `python -m SimpleHTTPServer 8000`
3. Mở trình duyệt web và truy cập: [http://localhost:8000](http://localhost:8000)

---

## Các chức năng
- Chuyển đổi trực tiếp giữa 4 loại thuật toán fractal trên cùng một Canvas.
- Thanh Slider kéo tuỳ chỉnh mức độ đệ quy (Iterations) và các hằng số toạ độ (với Julia set).
- Hỗ trợ cuộn chuột (Zoom), giữ chuột (Pan) trên bài toán Mandelbrot.
