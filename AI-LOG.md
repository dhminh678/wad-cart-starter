## 2026-10-22 — Remediation: Bug fixes, Zero-Dependency migration & Test Suite refactor
Tool: Gemini / Antigravity
Asked for: Sửa toàn diện bài nộp IA#1 dựa trên phản hồi của giảng viên (44/100):
1. Sửa lỗi nghiệp vụ 1: Ngưỡng miễn phí vận chuyển (`freeShipFrom`) phải so sánh với `subtotal` (trước VAT), không được so sánh với tổng sau VAT (`subtotal + VAT`). Với subtotal = 480.000đ, VAT 8% (38.400đ), ngưỡng 500.000đ, phí ship 30.000đ -> Kết quả đúng phải là 548.400đ (không phải 518.400đ).
2. Sửa lỗi nghiệp vụ 2: Bắt lỗi số lượng không phải số nguyên dương (`qty <= 0` như 0, -1, hoặc số thực 1.5) phải throw `RangeError`.
3. Loại bỏ Jest (do đề bài cấm dependency bên ngoài), chuyển toàn bộ test suite sang Node.js built-in `node:test` và `node:assert/strict`.
4. Làm rõ và cập nhật `brief.md` để không còn mập mờ về điều kiện miễn phí ship và ràng buộc số nguyên dương.
5. Cập nhật `CLAUDE.md`, `package.json`, cấu hình CI `.github/workflows/ci.yml` và tạo các Git commit thực tế cho repo.

Kept:
- Logic tính toán chuẩn xác và thứ tự rõ ràng:
  - `subtotal` tính từ `sum(price * qty)`.
  - `vat = subtotal * vatRate`.
  - `shipping = subtotal >= freeShipFrom ? 0 : shipFee`.
  - `total = subtotal + vat + shipping`, làm tròn bằng `Math.round(total)`.
- Trả về `0` cho giỏ hàng rỗng.
- Bộ 12 unit tests toàn diện chạy bằng `node:test` kiểm tra chi tiết: ví dụ mẫu, giỏ hàng rỗng, subtotal 480k cận ngưỡng, subtotal bằng ngưỡng 500k, subtotal trên ngưỡng 600k, các trường hợp lỗi qty (0, -1, 1.5, chuỗi), giá âm, giá 0đ (quà tặng kèm), và làm tròn số.

Changed/Rejected:
- **Bác bỏ Jest:** Xóa bỏ hoàn toàn `jest` và `node_modules` khỏi dự án. Đề bài yêu cầu không dependency nên việc cài Jest là vi phạm.
- **Bác bỏ so sánh ngưỡng ship sau thuế:** Ở phiên bản trước, AI viết `if (total < options.freeShipFrom)` với `total = subtotal + vat`. Điều này dẫn đến ca 480.000đ bị tính sai thành 518.400đ. Đã sửa lại thành `subtotal >= freeShipFrom ? 0 : shipFee`.
- **Bác bỏ kiểm tra số lượng thiếu chặt chẽ:** Phiên bản trước AI chỉ viết `!Number.isInteger(item.qty)`, bỏ sót trường hợp `qty === 0` và `qty === -1` (vì chúng vẫn là số nguyên). Đã sửa thành `!Number.isInteger(item.qty) || item.qty <= 0`.
- **Bác bỏ các giải pháp linter bên ngoài (như Prettier/ESLint cần npm install):** Dùng `node --check` có sẵn trong Node.js để kiểm tra cú pháp, đảm bảo zero-dependency 100%.

By hand:
- Tự tay xóa `package-lock.json` và thư mục `node_modules`.
- Cấu hình lại `package.json` với các scripts chuẩn: `"test": "node --test"`, `"lint": "node --check src/cart.js test/cart.test.js"`, `"gate": "npm run lint && npm test"`.
- Cấu hình GitHub Actions CI (`.github/workflows/ci.yml`) chạy `npm run gate` trực tiếp trên Node 20 mà không cần chạy `npm ci`.
- Kiểm tra chạy cục bộ `npm run gate` đạt 12/12 test cases PASS xanh 100%.
- Thực hiện chuỗi Git commits mô tả rõ từng bước sửa đổi để khắc phục việc repo không có lịch sử commit.

---

## 2026-09-27 — Initial cartTotal implementation & tests (Archived for history)
Tool: Gemini
Asked for: Hỗ trợ viết test cases và triển khai logic cho hàm `cartTotal` trong `src/cart.js` dựa theo yêu cầu của `brief.md`.
Kept: Cấu trúc cơ bản tính tổng phụ và vòng lặp qua danh sách `items`, làm tròn bằng `Math.round(total)`.
Changed/Rejected: Loại trừ phương án dùng `.toFixed(0)` vì trả về String.
By hand: (Sai lầm đã ghi nhận) Tự ý cài đặt thư viện `jest` và cấu hình script chạy Jest trong khi đề bài yêu cầu không dùng external dependency; để sót điều kiện so sánh subtotal trước VAT và điều kiện số lượng `<= 0`.
