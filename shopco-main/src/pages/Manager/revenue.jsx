import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFilter, FaFileExport, FaPlus } from 'react-icons/fa';
import { Box, Typography, Grid, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Select, MenuItem, FormControl } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import axiosClient from '../../apis/axiosClient';
import adminService from '../../apis/adminService';
import './Manager.css';

// Đăng ký các thành phần chart
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Lấy API URL từ environment
const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7175';
console.log('API URL sử dụng trong trang Revenue:', API_URL);

const months = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

const Revenue = () => {
  const [activeItem, setActiveItem] = useState('revenue');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthDisplay, setMonthDisplay] = useState(12); // Mặc định hiển thị 12 tháng
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [averageMonthlyRevenue, setAverageMonthlyRevenue] = useState(0);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasChartData, setHasChartData] = useState(false);
  const navigate = useNavigate();

  const sidebarItems = [
    { id: 'revenue', name: 'Doanh thu', icon: '📊' },
    { id: 'staff', name: 'Nhân viên', icon: '👤' },
    { id: 'viewOrder', name: 'Đơn hàng', icon: '📋' },
    { id: 'product', name: 'Sản phẩm', icon: '📦' },
    { id: 'viewCustomer', name: 'Hồ sơ khách hàng', icon: '📝' },
    { id: 'viewSupport', name: 'Đơn hỗ trợ', icon: '📫' },
    { id: 'voucher', name: 'Vouchers', icon: '🎫' },
    { id: 'feedback', name: 'Đánh giá sản phẩm', icon: '📢' },
    { id: 'blogManager', name: 'Blog', icon: '📰' },
    { id: 'skincareRoutineManager', name: 'Quy trình chăm sóc da', icon: '💆‍♀️' }
  ];

  useEffect(() => {
    fetchRevenueData();
  }, [selectedYear, monthDisplay]);

  const fetchRevenueData = async () => {
    try {
      setIsLoading(true);
      
      // Lấy dữ liệu từ API summary
      const payments = await adminService.getPaymentSummary();
      console.log('Raw API Response:', payments);

      // Đảm bảo payments là một mảng
      if (!Array.isArray(payments)) {
        console.error('Dữ liệu không phải là mảng:', payments);
        setError('Định dạng dữ liệu không hợp lệ');
        return;
      }

      // Khởi tạo mảng dữ liệu theo tháng
      const monthlyData = Array(12).fill(0);
      let totalAmount = 0;
      
      // Xử lý từng payment
      payments.forEach(payment => {
        try {
          if (payment && payment.paymentDate && payment.amount) {
            const date = new Date(payment.paymentDate);
            const year = date.getFullYear();
            const month = date.getMonth();
            
            // Chỉ xử lý các payment trong năm được chọn và trong khoảng tháng đã chọn
            if (year === selectedYear && month < monthDisplay) {
              const amount = Number(payment.amount);
              if (!isNaN(amount)) {
                monthlyData[month] += amount;
                totalAmount += amount;
              }
            }
          }
        } catch (error) {
          console.error('Lỗi xử lý payment:', error, payment);
        }
      });

      console.log('Months to display:', monthDisplay);
      console.log('Monthly Data:', monthlyData);
      console.log('Total Amount:', totalAmount);

      // Cập nhật state
      setTotalRevenue(totalAmount);
      
      // Chỉ lấy số tháng được chọn để hiển thị
      const displayData = monthlyData.slice(0, monthDisplay);
      setMonthlyData(displayData);

      // Tính doanh thu trung bình chỉ cho các tháng được chọn
      const monthsWithRevenue = displayData.filter(amount => amount > 0).length;
      setAverageMonthlyRevenue(monthsWithRevenue > 0 ? totalAmount / monthsWithRevenue : 0);

      // Cập nhật trạng thái có dữ liệu
      setHasChartData(displayData.some(amount => amount > 0));

    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  const handleMonthDisplayChange = (event) => {
    setMonthDisplay(Number(event.target.value));
  };

  // Lọc dữ liệu theo số tháng được chọn
  const filteredMonthlyData = useMemo(() => {
    if (!monthlyData || !Array.isArray(monthlyData)) return [];
    
    // Trả về mảng doanh thu theo tháng cho năm được chọn
    return monthlyData;
  }, [monthlyData]);

  // Dữ liệu cho biểu đồ
  const chartData = {
    labels: months,
    datasets: [
      {
        label: `Doanh thu năm ${selectedYear}`,
        data: filteredMonthlyData,
        borderColor: selectedYear === 2025 ? 'rgb(255, 99, 132)' : 'rgb(53, 162, 235)',
        backgroundColor: selectedYear === 2025 ? 'rgba(255, 99, 132, 0.5)' : 'rgba(53, 162, 235, 0.5)',
        tension: 0.4,
        spanGaps: true
      }
    ]
  };

  // Cấu hình biểu đồ
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 10,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
                maximumFractionDigits: 0,
              }).format(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(200, 200, 200, 0.3)',
        },
        ticks: {
          font: {
            size: 12
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(200, 200, 200, 0.3)',
        },
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              notation: 'compact',
              maximumFractionDigits: 0
            }).format(value);
          },
          font: {
            size: 12
          }
        }
      }
    }
  };

  // Format tiền tệ Việt Nam
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0 
    }).format(amount);
  };

  // Kiểm tra xem có dữ liệu tổng quát không
  const hasDashboardData = useMemo(() => {
    return totalRevenue > 0 || averageMonthlyRevenue > 0 || totalCustomers > 0;
  }, [totalRevenue, averageMonthlyRevenue, totalCustomers]);

  return (
    <Box sx={{ bgcolor: "#f0f0f0", minHeight: "100vh", width:'99vw' }}>
    <div className="manager-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="logo-container">
          <div className="logo" style={{ marginRight: '15px', cursor: 'pointer' }} onClick={() => navigate("/")}>
            <img 
              src="/images/logo.png" 
              alt="Beauty Cosmetics"
              style={{
                width: 60, 
                height: 60, 
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
          </div>
          <div className="brand" style={{ cursor: 'pointer' }} onClick={() => navigate("/")}>
            <div>BEAUTY</div>
            <div>COSMETICS</div>
          </div>
        </div>
        
        <div className="sidebar-title">MANAGER</div>
        
        <div className="sidebar-menu">
          {sidebarItems.map((item) => (
            <div key={item.id} className={`sidebar-item ${activeItem === item.id ? 'active' : ''}`} onClick={() => { setActiveItem(item.id); navigate(`/${item.id}`); }} style={{ cursor: 'pointer' }}>
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-text">{item.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="dashboard-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <Typography variant="h5" fontWeight="bold">Báo Cáo Doanh Thu</Typography>
            <div style={{ display: 'flex', gap: '10px' }}>
              <FormControl variant="outlined" size="small" sx={{ minWidth: 90 }}>
                <Select
                  value={monthDisplay}
                  onChange={handleMonthDisplayChange}
                  displayEmpty
                  inputProps={{ 'aria-label': 'month-range' }}
                >
                  <MenuItem value={3}>3 tháng</MenuItem>
                  <MenuItem value={6}>6 tháng</MenuItem>
                  <MenuItem value={12}>12 tháng</MenuItem>
                </Select>
              </FormControl>
              <FormControl variant="outlined" size="small" sx={{ minWidth: 90 }}>
                <Select
                  value={selectedYear}
                  onChange={handleYearChange}
                  displayEmpty
                  inputProps={{ 'aria-label': 'year' }}
                >
                 
                  <MenuItem value={2024}>2024</MenuItem>
                  <MenuItem value={2025}>2025</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
        </div>
        
        {/* Dashboard Metrics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={6}>
            <Paper sx={{ p: 2, borderRadius: 2, textAlign: 'center', boxShadow: 2 }}>
              <Typography color="textSecondary" variant="subtitle2">
                Tổng Doanh Thu
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {totalRevenue > 0 ? formatCurrency(totalRevenue) : "Không có dữ liệu"}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <Paper sx={{ p: 2, borderRadius: 2, textAlign: 'center', boxShadow: 2 }}>
              <Typography color="textSecondary" variant="subtitle2">
                Doanh Thu TB/Tháng
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {averageMonthlyRevenue > 0 ? formatCurrency(averageMonthlyRevenue) : "Không có dữ liệu"}
              </Typography>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Revenue Chart */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Biểu Đồ Doanh Thu {monthDisplay === 12 ? 'Hàng Tháng' : `${monthDisplay} Tháng`} {selectedYear}
          </Typography>
          <div style={{ height: '300px' }}>
            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography>Đang tải dữ liệu...</Typography>
              </Box>
            )}
            
            {!isLoading && hasChartData && <Line data={chartData} options={chartOptions} />}
            
            {!isLoading && !hasChartData && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Typography>
                  {selectedYear === 2025 
                    ? "Chưa có dữ liệu doanh thu cho năm 2025" 
                    : `Không có dữ liệu doanh thu cho năm ${selectedYear}`}
                </Typography>
              </Box>
            )}
          </div>
        </Paper>
        
        {/* Revenue Table - Chỉ hiển thị khi không phải năm 2025 */}
        {/*  */}
      </div>
    </div>
    </Box>
  );
};

export default Revenue;
