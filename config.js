/*
 * CẤU HÌNH HỆ THỐNG
 *
 * DEFAULT_ADMIN: tài khoản admin được tạo sẵn khi hệ thống chưa có tài khoản nào
 *   (thay cho màn hình "Thiết lập quản trị lần đầu").
 *   Mật khẩu mặc định: 12345678 — lưu dưới dạng PBKDF2-SHA256 (130000 vòng), không lưu bản rõ.
 *   Hãy đổi mật khẩu ngay sau lần đăng nhập đầu tiên (nút "Đổi mật khẩu").
 *   Muốn đổi mật khẩu mặc định: chạy lệnh trong README để sinh salt/passwordHash mới.
 *
 * SYNC_URL: địa chỉ Web App Google Apps Script (xem file apps-script/Code.gs và README).
 *   Để trống  -> chỉ lưu trên trình duyệt (localStorage), mỗi máy một dữ liệu riêng.
 *   Có giá trị -> mọi máy dùng chung một bộ dữ liệu, tự đồng bộ.
 */
window.APP_CONFIG = {
  DEFAULT_ADMIN: {
    id: 'ADMIN-DEFAULT',
    username: 'admin',
    fullname: 'Quản trị hệ thống',
    salt: 'd4b5d8f7b5c64d7c3868de5a16ab1b0f07885262',
    passwordHash: '3542a022b5bfc2268a64d2f85879225b652dc945a0097a3675969588ae6647ec'
  },
  SYNC_URL: '',
  SYNC_INTERVAL_MS: 15000
};
