/**
 * MinimixPaint - Hệ thống quản lý người dùng (Auth System)
 * Sử dụng LocalStorage để lưu trữ dữ liệu giả lập Database
 */

const Auth = {
    // 1. CHỨC NĂNG ĐĂNG KÝ
    register: (username, password) => {
        // Lấy danh sách người dùng đã có, nếu chưa có thì tạo mảng rỗng
        let users = JSON.parse(localStorage.getItem('users') || '[]');

        // Kiểm tra xem tên đăng nhập đã tồn tại chưa
        const isExisted = users.some(user => user.u === username);
        if (isExisted) {
            alert("❌ Tên đăng nhập này đã tồn tại!");
            return false;
        }

        // Thêm người dùng mới vào danh sách
        users.push({ 
            u: username, 
            p: password 
        });

        // Lưu lại vào LocalStorage
        localStorage.setItem('users', JSON.stringify(users));
        
        alert("✅ Đăng ký thành công! Hãy đăng nhập để bắt đầu vẽ.");
        window.location.href = 'login.html';
        return true;
    },

    // 2. CHỨC NĂNG ĐĂNG NHẬP
    login: (username, password) => {
        let users = JSON.parse(localStorage.getItem('users') || '[]');

        // Tìm người dùng khớp cả tên và mật khẩu
        const user = users.find(user => user.u === username && user.p === password);

        if (user) {
            // Lưu tên người dùng vào phiên làm việc hiện tại (session)
            localStorage.setItem('currentUser', username);
            
            // Chuyển hướng sang trang vẽ
            window.location.href = 'paint.html';
            return true;
        } else {
            alert("❌ Sai tài khoản hoặc mật khẩu!");
            return false;
        }
    },

    // 3. CHỨC NĂNG ĐĂNG XUẤT
    logout: () => {
        if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
            // Xóa người dùng hiện tại khỏi phiên làm việc
            localStorage.removeItem('currentUser');
            
            // Quay về trang chủ
            window.location.href = 'index.html';
        }
    },

    // 4. KIỂM TRA QUYỀN TRUY CẬP (Bảo mật cho trang paint và gallery)
    checkAuth: () => {
        const currentUser = localStorage.getItem('currentUser');
        if (!currentUser) {
            alert("Bạn cần đăng nhập để sử dụng tính năng này!");
            window.location.href = 'login.html';
        }
        return currentUser;
    }
};

/**
 * Tự động cập nhật giao diện dựa trên trạng thái đăng nhập
 * Thường dùng cho trang index.html
 */
function updateUI() {
    const user = localStorage.getItem('currentUser');
    const ctaArea = document.getElementById('cta-group'); // ID này trong trang index.html

    if (ctaArea) {
        if (user) {
            ctaArea.innerHTML = `
                <div style="margin-bottom: 25px; font-weight: 600; color: #555;">
                    Chào mừng họa sĩ tài năng, <span style="color: #7d2ae8;">${user}</span>!
                </div>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <a href="paint.html" class="btn-pro" style="width: auto; padding: 15px 40px;">Bắt đầu vẽ ngay</a>
                    <button onclick="Auth.logout()" class="btn-pro" style="width: auto; padding: 15px 40px; background: white; color: #ff4757; border: 1px solid #ddd; box-shadow: none;">Đăng xuất</button>
                </div>
            `;
        }
    }
}

// Chạy cập nhật giao diện nếu đang ở trang chủ
if (document.getElementById('cta-group')) {
    updateUI();
}