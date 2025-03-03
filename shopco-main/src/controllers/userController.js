import User from '../models/User';
import { poolPromise } from '../config/db';

// controller có nhiệm vụ xử lý các yêu cầu từ client

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

// Hàm đăng nhập
export const loginUser = async (req, res) => {
    const { Name, Password } = req.body;

    try {
        // Tìm người dùng theo Name
        const user = await User.findOne({ Name });
        if (!user) {
            return res.status(400).json({ message: 'Người dùng không tồn tại' });
        }

        // Kiểm tra mật khẩu
        const isMatch = user.Password === Password;
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu không chính xác' });
        }

        // Trả về thông tin người dùng (có thể thêm token nếu cần)
        return res.status(200).json({ message: 'Đăng nhập thành công', user });
    } catch (error) {
        return res.status(500).json({ message: 'Đã xảy ra lỗi', error });
    }
};

export const saveSkinType = async (req, res) => {
    const { userId, skinType } = req.body;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('UserId', sql.Int, userId)
            .input('SkinType', sql.NVarChar, skinType)
            .query('INSERT INTO UserSkinTypeResults (UserId, SkinType) VALUES (@UserId, @SkinType)');

        res.status(200).json({ message: 'SkinType saved successfully' });
    } catch (error) {
        console.error('Error saving SkinType:', error);
        res.status(500).json({ message: 'Error saving SkinType' });
    }
};