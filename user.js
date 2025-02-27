import axiosClient from './axiosClient';
import User from '../models/User';

// userService
const userService = {
    // Đăng ký người dùng
    register: async (username, email, password) => {
        try {
            const response = await axiosClient.post('/api/Users/register', {
                username,
                email,
                password
            });
            return response; 
        } catch (error) {
            console.error('Error:', error);
            throw error; 
        }
    }
};

// userController
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

export default userService; 