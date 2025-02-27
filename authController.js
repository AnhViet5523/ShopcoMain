import User from '../models/User'; 

// Đăng ký người dùng
export const registerUser = async (req, res) => {
    const { username, password, email } = req.body;

    try {
        // Kiểm tra xem người dùng đã tồn tại chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Người dùng đã tồn tại' });
        }

        // Tạo người dùng mới
        const newUser = new User({ username, password, email });
        await newUser.save();

        return res.status(201).json({ message: 'Đăng ký thành công' });
    } catch (error) {
        return res.status(500).json({ message: 'Đã xảy ra lỗi', error });
    }
};

// Đăng nhập người dùng
export const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Tìm người dùng trong cơ sở dữ liệu
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        // Kiểm tra mật khẩu (giả sử bạn đã mã hóa mật khẩu)
        const isMatch = user.password === password; // Thay thế bằng phương thức mã hóa thực tế
        if (!isMatch) {
            return res.status(401).json({ message: 'Mật khẩu không đúng' });
        }

        return res.status(200).json({ message: 'Đăng nhập thành công', user });
    } catch (error) {
        return res.status(500).json({ message: 'Đã xảy ra lỗi', error });
    }
}; 