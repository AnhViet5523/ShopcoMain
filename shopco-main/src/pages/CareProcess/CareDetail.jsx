import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Grid, Typography, Button } from '@mui/material';
import Header from '../../components/Header';
import Footer from '../../components/Footer/Footer';
import skincareRoutineService from '../../apis/skincareRoutineService';
import orderService from '../../apis/orderService';
import './CareDetail.css';

const CareDetail = () => {
    const { id, skinType: skinTypeParam } = useParams(); // Lấy ID và skinType từ URL params
    const location = useLocation(); // Lấy state từ navigation
    const locationSkinType = location.state?.skinType; // Lấy skinType từ state (nếu có)
    
    // Ưu tiên lấy skinType từ params, nếu không có thì lấy từ state
    const skinType = skinTypeParam || locationSkinType;
    
    const [routine, setRoutine] = useState(null);
    const [products, setProducts] = useState([]);
    const [routineCategories, setRoutineCategories] = useState([]);
    const [showRoutine, setShowRoutine] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRoutineDetail = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Chuyển đổi skin type từ URL sang định dạng chuẩn
                let normalizedSkinType = skinType;
                if (skinType) {
                    // Kiểm tra nếu tham số là URL format (với dấu gạch ngang)
                    if (skinType.includes('-')) {
                        // Xử lý các định dạng URL khác nhau
                        if (skinType === 'da-dau') normalizedSkinType = 'Da dầu';
                        else if (skinType === 'da-kho') normalizedSkinType = 'Da khô';
                        else if (skinType === 'da-thuong') normalizedSkinType = 'Da thường';
                        else if (skinType === 'da-hon-hop') normalizedSkinType = 'Da hỗn hợp';
                        else if (skinType === 'da-nhay-cam') normalizedSkinType = 'Da nhạy cảm';
                        // Nếu không khớp với các format trên, thử chuyển đổi chung
                        else {
                            // Chuyển đổi từ dạng URL 'da-xxx' sang dạng 'Da xxx'
                            const parts = skinType.split('-');
                            if (parts.length >= 2) {
                                // Chuyển đầu mỗi từ thành chữ hoa
                                normalizedSkinType = parts.map(part => 
                                    part.charAt(0).toUpperCase() + part.slice(1)
                                ).join(' ');
                            }
                        }
                    }
                    
                    console.log('Normalized skin type:', normalizedSkinType);
                }
                
                // Nếu có ID cụ thể, lấy quy trình theo ID
                if (id) {
                    try {
                        const response = await skincareRoutineService.getRoutineById(id);
                        if (response) {
                            setRoutine(response);
                        } else {
                            setError('Không tìm thấy quy trình chăm sóc da');
                        }
                    } catch (err) {
                        console.error('Lỗi khi lấy quy trình theo ID:', err);
                        setError(`Không tìm thấy quy trình chăm sóc da cho ID: ${id}`);
                    }
                } 
                // Nếu có loại da, lấy quy trình theo loại da
                else if (normalizedSkinType) {
                    try {
                        const routines = await skincareRoutineService.getRoutinesBySkinType(normalizedSkinType);
                        
                        // Chuyển đổi thành mảng nếu cần
                        const routinesArray = Array.isArray(routines) ? routines : [routines];
                        
                        if (routinesArray.length > 0) {
                            setRoutine(routinesArray[0]); // Lấy quy trình đầu tiên trong danh sách
                        } else {
                            setError(`Không tìm thấy quy trình chăm sóc da cho loại da ${normalizedSkinType}. Vui lòng thử lại sau.`);
                        }
                    } catch (err) {
                        console.error(`Lỗi khi lấy quy trình cho loại da ${normalizedSkinType}:`, err);
                        setError(`Không thể tải dữ liệu quy trình chăm sóc cho loại da ${normalizedSkinType}. Vui lòng thử lại sau.`);
                    }
                } else {
                    setError('Không đủ thông tin để tìm quy trình chăm sóc da');
                }
                
                // Kiểm tra nếu đã có trong session storage
                const showProductsStored = sessionStorage.getItem('showProducts');
                if (showProductsStored === 'true') {
                    handleFindProducts();
                }
            } catch (err) {
                console.error('Lỗi khi lấy chi tiết quy trình:', err);
                setError('Đã xảy ra lỗi khi tải thông tin quy trình chăm sóc da');
            } finally {
                setLoading(false);
            }
        };

        fetchRoutineDetail();
        
        // Xóa trạng thái khi component unmount
        return () => {
            sessionStorage.removeItem('showProducts');
        };
    }, [id, skinType]);

    const handleFindProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Lấy danh mục quy trình theo loại da từ API
            if (routine && routine.skinType) {
                try {
                    console.log(`Đang lấy danh mục sản phẩm cho loại da: ${routine.skinType}`);
                    const categories = await skincareRoutineService.getRoutineCategoriesBySkinType(routine.skinType);
                    console.log('Kết quả API trả về categories:', categories);
                    
                    // Chuyển đổi thành mảng nếu cần
                    const categoriesArray = Array.isArray(categories) ? categories : [categories];
                    
                    if (categoriesArray.length > 0) {
                        console.log(`Tìm thấy ${categoriesArray.length} danh mục sản phẩm cho loại da ${routine.skinType}`);
                        setRoutineCategories(categoriesArray);
                        
                        // Tạo danh sách sản phẩm từ danh mục
                        const productItems = categoriesArray.map(category => ({
                            id: category.productId,
                            title: `${category.routineCategory || "Danh mục"}:`,
                            name: category.product ? category.product.productName : 'Sản phẩm không xác định',
                            product: category.product // Lưu thông tin đầy đủ của sản phẩm
                        }));
                        
                        setProducts(productItems);
                        setShowRoutine(false);
                        sessionStorage.setItem('showProducts', 'true');
                    } else {
                        console.log(`API trả về mảng rỗng cho loại da ${routine.skinType}`);
                        setError(`Không tìm thấy sản phẩm phù hợp cho loại da ${routine.skinType}. Vui lòng thử lại sau.`);
                        setProducts([]);
                        setShowRoutine(false);
                        sessionStorage.setItem('showProducts', 'true');
                    }
                } catch (err) {
                    console.error(`Lỗi khi lấy danh mục sản phẩm từ API cho loại da ${routine.skinType}:`, err);
                    setError(`Không thể tải dữ liệu sản phẩm cho loại da ${routine.skinType}. Vui lòng thử lại sau.`);
                    setProducts([]);
                    setShowRoutine(false);
                    sessionStorage.setItem('showProducts', 'true');
                }
            } else {
                setError('Không có thông tin về loại da để tìm sản phẩm phù hợp.');
                setProducts([]);
                setShowRoutine(false);
                sessionStorage.setItem('showProducts', 'true');
            }
        } catch (err) {
            console.error('Lỗi không xác định khi tìm sản phẩm:', err);
            setError('Có lỗi xảy ra khi tải sản phẩm. Vui lòng thử lại sau.');
            setProducts([]);
            setShowRoutine(false);
            sessionStorage.setItem('showProducts', 'true');
        } finally {
            setLoading(false);
        }
    };

    const handleShowRoutine = () => {
        setShowRoutine(true); // Hiển thị lại quy trình
        setProducts([]); // Xóa danh sách sản phẩm
        sessionStorage.removeItem('showProducts'); // Xóa trạng thái
    };

    const handleProductClick = (productId) => {
        navigate(`/product/${productId}`); // Chuyển hướng đến trang chi tiết sản phẩm
    };

    const handleBuyCombo = async () => {
        try {
            // Lấy thông tin người dùng từ localStorage
            const user = JSON.parse(localStorage.getItem('user'));
            
            if (!user || !user.userId) {
                // Nếu chưa đăng nhập, chuyển đến trang đăng nhập
                alert('Vui lòng đăng nhập để mua sản phẩm');
                navigate('/login');
                return;
            }
            
            // Thêm các sản phẩm vào giỏ hàng
            const productIds = products.map(product => product.id);
            
            // Giữ track các sản phẩm đã thêm thành công
            const successItems = [];
            
            // Gọi API để thêm từng sản phẩm vào giỏ hàng
            for (const productId of productIds) {
                try {
                    console.log(`Đang thêm sản phẩm ID: ${productId} vào giỏ hàng`);
                    const result = await orderService.addtocard(user.userId, productId, 1);
                    console.log(`Kết quả thêm sản phẩm ID ${productId}:`, result);
                    
                    if (result) {
                        successItems.push(productId);
                    }
                } catch (itemError) {
                    console.error(`Lỗi khi thêm sản phẩm ID ${productId}:`, itemError);
                }
            }
            
            // Hiển thị thông báo kết quả sau khi hoàn thành
            alert(`Đã thêm ${successItems.length}/${productIds.length} sản phẩm vào giỏ hàng`);
            
            // Kích hoạt sự kiện để báo cho các component khác biết giỏ hàng đã được cập nhật
            window.dispatchEvent(new CustomEvent('cartUpdated'));
            
            // Chuyển đến trang giỏ hàng
            navigate('/cart');
            
        } catch (error) {
            console.error('Lỗi khi thêm sản phẩm vào giỏ hàng:', error);
            alert('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng. Vui lòng thử lại sau.');
        }
    };

    // Lấy emoji và tiêu đề tương ứng với loại da
    const getSkinTypeTitle = () => {
        if (!routine || !routine.skinType) return '🌿 Quy trình chăm sóc da 🌿';
        
        // Chuyển đổi chuỗi để xử lý cả trường hợp có dấu và không dấu
        const skinType = routine.skinType.toLowerCase();
        
        if (skinType.includes('hỗn hợp') || skinType.includes('hon hop')) {
            return '🌿 Da hỗn hợp - Cân bằng và điều tiết 🌿';
        } else if (skinType.includes('dầu') || skinType.includes('dau')) {
            return '🌿 Da dầu - Kiềm dầu, ngăn ngừa mụn 🌿';
        } else if (skinType.includes('khô') || skinType.includes('kho')) {
            return '🌿 Da khô - Cấp ẩm và phục hồi 🌿';
        } else if (skinType.includes('nhạy cảm') || skinType.includes('nhay cam')) {
            return '🌿 Da nhạy cảm - Làm dịu và bảo vệ 🌿';
        } else if (skinType.includes('thường') || skinType.includes('thuong')) {
            return '🌿 Da thường - Duy trì sự cân bằng 🌿';
        } else {
            return `🌿 ${routine.skinType} 🌿`;
        }
    };

    // Lấy đường dẫn hình ảnh tương ứng với loại da
    const getSkinTypeImage = () => {
        if (!routine || !routine.skinType) return '/images/skincare-default.jpg';
        
        // Chuyển đổi chuỗi để xử lý cả trường hợp có dấu và không dấu
        const skinType = routine.skinType.toLowerCase();
        
        if (skinType.includes('hỗn hợp') || skinType.includes('hon hop')) {
            return '/images/dahonhop.jpg';
        } else if (skinType.includes('dầu') || skinType.includes('dau')) {
            return '/images/dadau.jpg';
        } else if (skinType.includes('khô') || skinType.includes('kho')) {
            return '/images/dakho.jpg';
        } else if (skinType.includes('nhạy cảm') || skinType.includes('nhay cam')) {
            return '/images/danhaycam.jpg';
        } else if (skinType.includes('thường') || skinType.includes('thuong')) {
            return '/images/dathuong.jpg';
        } else {
            return '/images/skincare-default.jpg';
        }
    };

    // Thêm hàm xử lý định dạng nội dung
    const formatRoutineContent = (content) => {
        if (!content) return null;
        
        try {
            // Kiểm tra xem content đã là object chưa
            if (typeof content === 'object' && !Array.isArray(content)) {
                // Kiểm tra nếu có đủ cấu trúc dữ liệu như trong service
                if ((content.features || (content.morning && content.morning.steps) || (content.evening && content.evening.steps))) {
                    return (
                        <div className="routine-formatted-content">
                            {content.features && content.features.length > 0 && (
                                <>
                                    <span className="dac-diem">Đặc điểm:</span>
                                    <ul className="feature-list">
                                        {content.features.map((feature, index) => (
                                            <li key={`feature-${index}`}>{feature}</li>
                                        ))}
                                    </ul>
                                </>
                            )}
                            
                            {content.morning && content.morning.steps && content.morning.steps.length > 0 && (
                                <>
                                    <span className="buoi-sang">Buổi sáng: {content.morning.title || 'Tươi tắn, không bóng dầu'}</span>
                                    <ol className="step-list">
                                        {content.morning.steps.map((step, index) => (
                                            <li key={`morning-${index}`}>{step}</li>
                                        ))}
                                    </ol>
                                </>
                            )}
                            
                            {content.evening && content.evening.steps && content.evening.steps.length > 0 && (
                                <>
                                    <span className="buoi-toi">Buổi tối: {content.evening.title || 'Làm sạch sâu, phục hồi da'}</span>
                                    <ol className="step-list">
                                        {content.evening.steps.map((step, index) => (
                                            <li key={`evening-${index}`}>{step}</li>
                                        ))}
                                    </ol>
                                </>
                            )}
                            
                           
                        </div>
                    );
                }
            }
            
            // Nếu là string, thử phân tích
            let formattedContent = typeof content === 'string' ? content : JSON.stringify(content);
            
            try {
                // Thử phân tích JSON
                if (typeof content === 'string' && (content.startsWith('{') || content.startsWith('['))) {
                    const parsedContent = JSON.parse(content);
                    if (parsedContent && typeof parsedContent === 'object') {
                        return formatRoutineContent(parsedContent); // Gọi đệ quy để xử lý đối tượng đã phân tích
                    }
                }
            } catch (e) {
                console.error('Lỗi khi phân tích JSON:', e);
                // Nếu không phải JSON hợp lệ, tiếp tục với định dạng text
            }
            
            // Nếu không phải JSON hoặc không có cấu trúc đúng, sử dụng hàm phân tích text
            return formatTextContent(formattedContent);
        } catch (error) {
            console.error('Lỗi khi định dạng nội dung:', error);
            
            // Trả về nội dung gốc nếu có lỗi
            if (typeof content === 'string') {
                return (
                    <Typography variant="body1" paragraph>
                        {content}
                    </Typography>
                );
            } else {
                return null;
            }
        }
    };
    
    // Định dạng nội dung dạng text
    const formatTextContent = (content) => {
        if (!content) return null;
        
        // Kiểm tra nếu là đối tượng từ formatRoutineContent trong service
        if (typeof content === 'object' && !Array.isArray(content)) {
            return (
                <div className="routine-formatted-content">
                    {content.features && content.features.length > 0 && (
                        <>
                            <span className="dac-diem">Đặc điểm:</span>
                            <ul className="feature-list">
                                {content.features.map((feature, index) => (
                                    <li key={`feature-${index}`}>{feature}</li>
                                ))}
                            </ul>
                        </>
                    )}
                    
                    {content.morning && content.morning.steps && content.morning.steps.length > 0 && (
                        <>
                            <span className="buoi-sang">Buổi sáng: {content.morning.title || 'Tươi tắn, không bóng dầu'}</span>
                            <ol className="step-list">
                                {content.morning.steps.map((step, index) => (
                                    <li key={`morning-${index}`}>{step}</li>
                                ))}
                            </ol>
                        </>
                    )}
                    
                    {content.evening && content.evening.steps && content.evening.steps.length > 0 && (
                        <>
                            <span className="buoi-toi">Buổi tối: {content.evening.title || 'Làm sạch sâu, phục hồi da'}</span>
                            <ol className="step-list">
                                {content.evening.steps.map((step, index) => (
                                    <li key={`evening-${index}`}>{step}</li>
                                ))}
                            </ol>
                        </>
                    )}
                    
                    {/* <div className="find-products-button" onClick={handleFindProducts}>
                        Tìm Sản Phẩm Phù Hợp
                    </div>   */}
                </div>
            );
        }
        
        // Từ đây là xử lý nội dung dạng text
        const features = [];
        const morningSteps = [];
        const eveningSteps = [];
        
        // Logic phân tích văn bản đơn giản
        const lines = content.split('\n');
        let currentSection = 'none';
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;
            
            // Xác định section dựa vào từ khóa
            if (trimmedLine.toLowerCase().includes('đặc điểm') || 
                trimmedLine.toLowerCase().includes('đặc tính') ||
                trimmedLine.toLowerCase().includes('dac diem') ||
                trimmedLine.toLowerCase().includes('đặc trưng')) {
                currentSection = 'features';
                continue;
            } else if (trimmedLine.toLowerCase().includes('buổi sáng') || 
                       trimmedLine.toLowerCase().includes('buoi sang') ||
                       trimmedLine.toLowerCase().includes('quy trình sáng') ||
                       trimmedLine.toLowerCase().includes('sáng:')) {
                currentSection = 'morning';
                continue;
            } else if (trimmedLine.toLowerCase().includes('buổi tối') || 
                       trimmedLine.toLowerCase().includes('buoi toi') ||
                       trimmedLine.toLowerCase().includes('quy trình tối') ||
                       trimmedLine.toLowerCase().includes('tối:')) {
                currentSection = 'evening';
                continue;
            }
            
            // Thêm nội dung vào section tương ứng (hỗ trợ nhiều định dạng danh sách)
            if (currentSection === 'features' && (
                trimmedLine.startsWith('-') || 
                trimmedLine.startsWith('•') || 
                trimmedLine.startsWith('*') ||
                /^\d+[\.)]/.test(trimmedLine) || // Số + dấu chấm hoặc dấu đóng ngoặc
                /^[a-z][\)\.)]/.test(trimmedLine) // Chữ cái + dấu chấm hoặc dấu đóng ngoặc
            )) {
                // Loại bỏ dấu đầu dòng
                const cleanLine = trimmedLine.replace(/^[-•*\d]+[\.)]|^[a-z][\).)]/, '').trim();
                features.push(cleanLine);
            } else if (currentSection === 'morning' && (
                trimmedLine.startsWith('-') || 
                trimmedLine.startsWith('•') || 
                trimmedLine.startsWith('*') ||
                /^\d+[\.)]/.test(trimmedLine) ||
                /^[a-z][\)\.)]/.test(trimmedLine)
            )) {
                const cleanLine = trimmedLine.replace(/^[-•*\d]+[\.)]|^[a-z][\).)]/, '').trim();
                morningSteps.push(cleanLine);
            } else if (currentSection === 'evening' && (
                trimmedLine.startsWith('-') || 
                trimmedLine.startsWith('•') || 
                trimmedLine.startsWith('*') ||
                /^\d+[\.)]/.test(trimmedLine) ||
                /^[a-z][\)\.)]/.test(trimmedLine)
            )) {
                const cleanLine = trimmedLine.replace(/^[-•*\d]+[\.)]|^[a-z][\).)]/, '').trim();
                eveningSteps.push(cleanLine);
            } else if (currentSection !== 'none') {
                // Nếu dòng không bắt đầu bằng ký hiệu danh sách nhưng trong một phần,
                // thêm vào mục cuối cùng của phần đó (nếu có)
                if (currentSection === 'features' && features.length > 0) {
                    features[features.length - 1] += ' ' + trimmedLine;
                } else if (currentSection === 'morning' && morningSteps.length > 0) {
                    morningSteps[morningSteps.length - 1] += ' ' + trimmedLine;
                } else if (currentSection === 'evening' && eveningSteps.length > 0) {
                    eveningSteps[eveningSteps.length - 1] += ' ' + trimmedLine;
                }
            }
        }
        
        // Nếu không phân tích được, hiển thị nguyên text
        if (features.length === 0 && morningSteps.length === 0 && eveningSteps.length === 0) {
            return (
                <Typography variant="body1" paragraph>
                    {content}
                </Typography>
            );
        }
        
        // Tạo nội dung định dạng tương tự như JSON
        return (
            <div className="routine-formatted-content">
                {features.length > 0 && (
                    <>
                        <span className="dac-diem">Đặc điểm:</span>
                        <ul className="feature-list">
                            {features.map((feature, index) => (
                                <li key={`feature-${index}`}>{feature}</li>
                            ))}
                        </ul>
                    </>
                )}
                
                {morningSteps.length > 0 && (
                    <>
                        <span className="buoi-sang">Buổi sáng: Tươi tắn, không bóng dầu</span>
                        <ol className="step-list">
                            {morningSteps.map((step, index) => (
                                <li key={`morning-${index}`}>{step}</li>
                            ))}
                        </ol>
                    </>
                )}
                
                {eveningSteps.length > 0 && (
                    <>
                        <span className="buoi-toi">Buổi tối: Làm sạch sâu, phục hồi da</span>
                        <ol className="step-list">
                            {eveningSteps.map((step, index) => (
                                <li key={`evening-${index}`}>{step}</li>
                            ))}
                        </ol>
                    </>
                )}
                
                {/* <div className="find-products-button" onClick={handleFindProducts}>
                    Tìm Sản Phẩm Phù Hợp
                </div> */}
            </div>
        );
    };

   

    if (loading) {
        return (
            <>
                <Header />
                <Box sx={{ flexGrow: 1, py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <Typography variant="h5">Đang tải thông tin quy trình chăm sóc da...</Typography>
                </Box>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <Box sx={{ flexGrow: 1, py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <Typography variant="h5" color="error">{error}</Typography>
                </Box>
                <Footer />
            </>
        );
    }

    if (!routine) {
        return (
            <>
                <Header />
                <Box sx={{ flexGrow: 1, py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                    <Typography variant="h5">Không tìm thấy quy trình chăm sóc da</Typography>
                </Box>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <Box sx={{ flexGrow: 1, py: 4, bgcolor: '#f5f5f5', width: "99vw", overflowX: "hidden" }}>
                <Grid container spacing={2}>
                    {/* Grid cho hình ảnh */}
                    <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                        <Box className="image-container">
                            <img 
                                src={routine.imageUrl || getSkinTypeImage()} 
                                alt={routine.skinType} 
                                className="skin-image"
                                style={{
                                    width: '100%',
                                    maxWidth: '500px',
                                    borderRadius: '10px',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                                }}
                            />
                        </Box>
                    </Grid>
                    
                    {/* Grid cho nội dung */}
                    <Grid item xs={12} md={6}>
                        <Box sx={{ pl: { md: 4 }, pr: { md: 2 }, py: 2 }} className="content-container">
                            <Typography variant="h4" gutterBottom className="routine-title">
                                {routine.title || getSkinTypeTitle()}
                            </Typography>
                        
                            {showRoutine ? (
                                <Box className="routine-container">
                                    {routine.content ? (
                                        // Thử hiển thị nội dung định dạng từ API
                                        formatRoutineContent(routine.content)
                                    ) : (
                                        // Nếu không có nội dung từ API, sử dụng dữ liệu mẫu cho loại da
                                        routine.skinType ? (
                                            formatRoutineContent(getDefaultSkinTypeContent(routine.skinType))
                                        ) : (
                                            <Typography variant="body1" paragraph>
                                                Không có thông tin quy trình chăm sóc da.
                                            </Typography>
                                        )
                                    )}
                                </Box>
                            ) : (
                                <Box className="products-container">
                                    <Typography variant="h6" sx={{ mb: 2, color: '#4a4a4a', fontWeight: 'bold' }}>
                                        Các sản phẩm phù hợp cho {routine.skinType}:
                                    </Typography>
                                    <div className="product-list">
                                        {products.map((product) => (
                                            <div key={product.id} className="product-item" onClick={() => handleProductClick(product.id)}>
                                                <span className="product-title">{product.title}</span> <span className="product-name">{product.name}</span>
                                                {product.product && (
                                                    <div className="product-details">
                                                        <div className="product-brand">{product.product.brand ? `Thương hiệu: ${product.product.brand}` : ''}</div>
                                                        <div className="product-price">{product.product.price ? `Giá: ${product.product.price.toLocaleString()} VNĐ` : ''}</div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </Box>
                            )}
                            
                            <Box sx={{ display: 'flex', gap: 2, mt: 2, justifyContent: 'center' }}>
                                <Button 
                                    variant="contained" 
                                    sx={{ bgcolor: '#ffbb02', color: 'white' }}
                                    onClick={showRoutine ? handleFindProducts : handleShowRoutine}
                                >
                                    {showRoutine ? "Tìm Sản Phẩm Phù Hợp" : "Xem Quy Trình"}
                                </Button>

                                {!showRoutine && (
                                    <Button 
                                        variant="contained" 
                                        sx={{ bgcolor: '#ff7b02', color: 'white' }}
                                        onClick={handleBuyCombo}
                                    >
                                        Mua cả combo
                                    </Button>
                                )}
                            </Box>
                            
                            {/* Thêm section cho các loại da khác */}
                            <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>Xem quy trình cho các loại da khác</Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                                    {['Da dầu', 'Da khô', 'Da thường', 'Da hỗn hợp', 'Da nhạy cảm'].map((type) => {
                                        // Kiểm tra xem loại da hiện tại có trùng với loại da trong mảng không
                                        const isCurrentType = routine?.skinType?.toLowerCase() === type.toLowerCase();
                                        if (!isCurrentType) {
                                            // Chuyển đổi tên loại da thành định dạng URL đúng
                                            let urlParam = '';
                                            if (type === 'Da dầu') urlParam = 'da-dau';
                                            else if (type === 'Da khô') urlParam = 'da-kho';
                                            else if (type === 'Da thường') urlParam = 'da-thuong';
                                            else if (type === 'Da hỗn hợp') urlParam = 'da-hon-hop';
                                            else if (type === 'Da nhạy cảm') urlParam = 'da-nhay-cam';
                                            else urlParam = type.toLowerCase().replace(/\s+/g, '-');
                                            
                                            return (
                                                <Button 
                                                    key={type} 
                                                    variant="outlined" 
                                                    size="small"
                                                    onClick={() => {
                                                        navigate(`/quy-trinh-cham-soc/${urlParam}`, {
                                                            state: { skinType: type }
                                                        });
                                                    }}
                                                    sx={{ 
                                                        borderColor: '#ffbb02', 
                                                        color: '#333',
                                                        '&:hover': {
                                                            backgroundColor: '#fff8e1',
                                                            borderColor: '#ffab00',
                                                        }
                                                    }}
                                                >
                                                    {type}
                                                </Button>
                                            );
                                        }
                                        return null;
                                    })}
                                </Box>
                                
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
            <Footer />
        </>
    );
};

export default CareDetail;
