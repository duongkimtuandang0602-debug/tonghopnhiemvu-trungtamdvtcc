# Hệ thống Điều hành · Trung tâm Dịch vụ tài chính công Hà Tĩnh

Web tĩnh (1 file `index.html` + `config.js`), không cần build.

## Tài khoản admin mặc định

Khi hệ thống chưa có tài khoản nào, admin được tạo sẵn từ `config.js` (không còn màn hình "Thiết lập quản trị lần đầu"):

- Tên đăng nhập: `admin`
- Mật khẩu: `12345678`

**Đăng nhập xong hãy đổi mật khẩu ngay** (nút "Đổi mật khẩu" trên thanh trên cùng).

Muốn đổi mật khẩu mặc định trong `config.js`, sinh salt + hash mới:

```bash
node -e "const c=require('crypto'),s=c.randomBytes(20).toString('hex');console.log(s, c.pbkdf2Sync(process.argv[1],Buffer.from(s),130000,32,'sha256').toString('hex'))" 'MAT_KHAU_MOI'
```

## Vai trò

| Vai trò | Ghi chú |
|---|---|
| Admin · Lãnh đạo Trung tâm | Toàn quyền, quản lý người dùng |
| Lãnh đạo các phòng | Xem / duyệt toàn bộ |
| Chuyên viên HCTH | Nhiệm vụ phòng HCTH |
| Chuyên viên DVC | Cùng bộ quyền với Chuyên viên DVTH |
| Chuyên viên DVTH | Cùng bộ quyền với Chuyên viên DVC |
| Kế toán HCTH | Hồ sơ, nguồn thu |

Tài khoản cũ có vai trò `technical_staff` tự chuyển thành Chuyên viên DVC.

## Dữ liệu dùng chung (không dùng CSDL)

- `SYNC_URL` trong `config.js` **để trống**: dữ liệu chỉ lưu trên trình duyệt (localStorage), mỗi máy một bộ riêng.
- `SYNC_URL` **có giá trị**: mọi máy dùng chung 1 file JSON trên Google Drive, thông qua Google Apps Script (`apps-script/Code.gs`).
  - Trình duyệt tự đồng bộ 15 giây/lần và ngay sau mỗi thao tác lưu.
  - Hai người sửa cùng lúc: hệ thống tự gộp theo từng nhiệm vụ / hồ sơ / tài khoản. Nếu cả hai sửa **cùng một** bản ghi thì bản lưu sau thắng.
  - Mỗi giờ tự sao lưu 1 bản vào thư mục `TT_HT_BACKUP` trên Drive (giữ 200 bản).

### Cài máy chủ Apps Script (khoảng 5 phút)

1. Vào <https://script.google.com> → **New project** (Dự án mới). Đặt tên, ví dụ `TT_HT_SYNC`.
2. Xóa nội dung `Code.gs`, dán toàn bộ nội dung file `apps-script/Code.gs` của repo này → **Save**.
3. Chọn hàm `setup` trên thanh công cụ → **Run** → cấp quyền truy cập Google Drive khi được hỏi.
4. **Deploy → New deployment** → loại **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
   → **Deploy**, sao chép **Web app URL** (dạng `https://script.google.com/macros/s/.../exec`).
5. Dán URL vào `SYNC_URL` trong `config.js`, commit và push.

Khi sửa `Code.gs` về sau: **Deploy → Manage deployments → Edit → Version: New version** (giữ nguyên URL).

### Lưu ý bảo mật (bản thử nghiệm)

Web app Apps Script ở chế độ "Anyone" và mã nguồn web công khai, nên ai biết `SYNC_URL` đều đọc/ghi được dữ liệu (kể cả bản băm mật khẩu). Phù hợp để chạy thử. Khi đưa vào sử dụng chính thức cần máy chủ có xác thực thật (API + CSDL).

## Đăng web bằng GitHub Pages

Repo → **Settings → Pages** → Source: **Deploy from a branch** → Branch `main`, thư mục `/ (root)` → **Save**.
Sau 1–2 phút web chạy tại `https://<tên-tài-khoản>.github.io/tonghopnhiemvu-trungtamdvtcc/`.
