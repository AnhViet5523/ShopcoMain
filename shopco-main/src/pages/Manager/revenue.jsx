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
  const navigate = useNavigate();

  const sidebarItems = [
    { id: 'revenue', name: 'Doanh thu', icon: '📊' },
    { id: 'staff', name: 'Nhân viên', icon: '👤' },
    { id: 'viewOrder', name: 'Đơn hàng', icon: '📋' },
    { id: 'product', name: 'Sản phẩm', icon: '📦' },
    { id: 'viewCustomer', name: 'Hồ sơ khách hàng', icon: '📝' },
    { id: 'viewSupport', name: 'Đơn hỗ trợ', icon: '📫' },
    { id: 'voucher', name: 'Vouchers', icon: '🎫' },
    { id: 'feedback', name: 'Feedback', icon: '📢' },
    { id: 'blogManager', name: 'Blog', icon: '📰' }
  ];

  useEffect(() => {
    fetchRevenueData();
  }, [selectedYear, monthDisplay]);

  const fetchRevenueData = async () => {
    setIsLoading(true);
    try {
      // Gọi API lấy tổng doanh thu
      console.log('Đang gọi API tổng doanh thu...');
      console.log('API URL tổng doanh thu:', `${API_URL}/api/Admin/revenue/total`);
      try {
        const totalRevenue = await adminService.getTotalRevenue();
        console.log('Dữ liệu tổng doanh thu:', totalRevenue);
        setTotalRevenue(totalRevenue || 0);
      } catch (revenueError) {
        console.error('Lỗi khi lấy tổng doanh thu:', revenueError);
        setTotalRevenue(0);
      }

      // Gọi API lấy tất cả đơn hàng
      console.log('Đang gọi API lấy tất cả đơn hàng...');
      console.log('API URL tất cả đơn hàng:', `${API_URL}/api/Admin/all`);
      try {
        const orders = await adminService.getAllOrders();
        console.log('Dữ liệu đơn hàng nhận được:', orders);
        
        // Đảm bảo orders là một mảng trước khi filter
        const ordersArray = Array.isArray(orders) ? orders : [];
        console.log('Độ dài mảng orders:', ordersArray.length);
        
        // Lọc đơn hàng trong năm được chọn
        const ordersInSelectedYear = ordersArray.filter(order => {
          if (!order || !order.orderDate) return false;
          const orderDate = new Date(order.orderDate);
          return orderDate.getFullYear() === selectedYear;
        });
        console.log(`Số đơn hàng trong năm ${selectedYear}:`, ordersInSelectedYear.length);
        
        // Đếm tổng số đơn hàng hoàn thành
        const completedOrders = ordersInSelectedYear.filter(order => 
          order.orderStatus === "Completed"
        );
        console.log('Số đơn hàng hoàn thành:', completedOrders.length);
        setTotalOrders(completedOrders.length);
        
        // Tính tổng số khách hàng duy nhất
        const uniqueCustomers = [...new Set(ordersInSelectedYear.map(order => order.userId))];
        console.log('Số khách hàng duy nhất:', uniqueCustomers.length);
        setTotalCustomers(uniqueCustomers.length);
        
        // Tạo dữ liệu theo tháng
        const monthlyDataTemp = [];
        let totalRevenueInYear = 0;
        
        // Đếm số tháng có dữ liệu thực tế
        let monthsWithData = 0;
        
        for (let month = 1; month <= 12; month++) {
          try {
            // Gọi API lấy doanh thu theo tháng
            console.log(`Đang gọi API doanh thu tháng ${month}/${selectedYear}...`);
            console.log('API URL doanh thu theo tháng:', `${API_URL}/api/Admin/revenue/monthly?year=${selectedYear}&month=${month}`);
            const monthlyRevenue = await adminService.getMonthlyRevenue(selectedYear, month);
            console.log(`Doanh thu tháng ${month}/${selectedYear}:`, monthlyRevenue);
            
            // Chỉ cộng vào tổng và đếm số tháng nếu có doanh thu thực tế
            if (monthlyRevenue > 0) {
              totalRevenueInYear += monthlyRevenue;
              monthsWithData++;
            }
            
            // Lọc số đơn hàng và khách hàng trong tháng
            const ordersInMonth = ordersInSelectedYear.filter(order => {
              if (!order || !order.orderDate) return false;
              const orderDate = new Date(order.orderDate);
              return orderDate.getMonth() + 1 === month;
            });
            
            const customersInMonth = [...new Set(ordersInMonth.map(order => order.userId))].length;
            
            monthlyDataTemp.push({
              month: month,
              monthName: `Tháng ${month}`,
              revenue: monthlyRevenue || 0,
              orders: ordersInMonth.length,
              customers: customersInMonth,
              averagePerCustomer: customersInMonth > 0 ? Math.round((monthlyRevenue || 0) / customersInMonth) : 0
            });
          } catch (monthError) {
            console.error(`Lỗi khi lấy dữ liệu tháng ${month}:`, monthError);
            monthlyDataTemp.push({
              month: month,
              monthName: `Tháng ${month}`,
              revenue: 0,
              orders: 0,
              customers: 0,
              averagePerCustomer: 0
            });
          }
        }
        
        console.log('Dữ liệu hàng tháng đã tạo:', monthlyDataTemp);
        setMonthlyData(monthlyDataTemp);
        
        // Tính doanh thu trung bình theo tháng (chỉ tính các tháng có dữ liệu)
        if (monthsWithData > 0) {
          setAverageMonthlyRevenue(Math.round(totalRevenueInYear / monthsWithData));
        } else {
          setAverageMonthlyRevenue(0);
        }
      } catch (ordersError) {
        console.error('Lỗi khi lấy dữ liệu đơn hàng:', ordersError);
        // Tạo dữ liệu trống nếu không lấy được đơn hàng
        const emptyMonthlyData = Array.from({length: 12}, (_, i) => ({
          month: i + 1,
          monthName: `Tháng ${i + 1}`,
          revenue: 0,
          orders: 0,
          customers: 0,
          averagePerCustomer: 0
        }));
        setMonthlyData(emptyMonthlyData);
        setTotalOrders(0);
        setTotalCustomers(0);
        setAverageMonthlyRevenue(0);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu doanh thu:', error);
      setIsLoading(false);
      // Thiết lập giá trị mặc định nếu có lỗi
      setTotalRevenue(0);
      setTotalOrders(0);
      setTotalCustomers(0);
      setAverageMonthlyRevenue(0);
      setMonthlyData(Array.from({length: 12}, (_, i) => ({
        month: i + 1,
        monthName: `Tháng ${i + 1}`,
        revenue: 0,
        orders: 0,
        customers: 0,
        averagePerCustomer: 0
      })));
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
    // Đảm bảo monthlyData là mảng trước khi xử lý
    if (!Array.isArray(monthlyData) || monthlyData.length === 0) {
      return [];
    }
    
    // Nếu hiển thị tất cả 12 tháng
    if (monthDisplay === 12) {
      return monthlyData;
    }
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Lấy tháng hiện tại (1-12)
    const currentYear = currentDate.getFullYear();
    
    // Đối với năm hiện tại
    if (selectedYear === currentYear) {
      // Hiển thị các tháng gần đây nhất
      return monthlyData
        .filter(item => {
          // Chỉ hiển thị các tháng đã qua trong năm hiện tại
          return item.month <= currentMonth && item.month > currentMonth - monthDisplay;
        })
        .sort((a, b) => a.month - b.month);
    } 
    // Đối với năm trong quá khứ
    else if (selectedYear < currentYear) {
      // Hiển thị tháng cuối năm nếu chọn hiển thị 3 hoặc 6 tháng
      if (monthDisplay === 3) {
        return monthlyData.slice(-3); // 3 tháng cuối năm
      } else if (monthDisplay === 6) {
        return monthlyData.slice(-6); // 6 tháng cuối năm
      }
      return monthlyData;
    } 
    // Đối với năm trong tương lai
    else {
      // Hiển thị các tháng đầu năm nếu là năm tương lai
      if (monthDisplay === 3) {
        return monthlyData.slice(0, 3); // 3 tháng đầu năm
      } else if (monthDisplay === 6) {
        return monthlyData.slice(0, 6); // 6 tháng đầu năm
      }
      return monthlyData;
    }
  }, [monthlyData, monthDisplay, selectedYear]);

  // Dữ liệu cho biểu đồ - sử dụng dữ liệu đã lọc
  const chartData = {
    labels: filteredMonthlyData.map(item => item.monthName),
    datasets: [
      {
        label: 'Doanh Thu',
        data: filteredMonthlyData.map(item => item.revenue / 1000000), // Đơn vị triệu đồng
        borderColor: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        borderWidth: 2,
        pointBackgroundColor: '#059669',
        tension: 0.4,
      },
    ],
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
              }).format(context.parsed.y * 1000000);
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
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(200, 200, 200, 0.3)',
        },
        ticks: {
          callback: function(value) {
            return value + 'tr';
          }
        }
      }
    },
  };

  // Format tiền tệ Việt Nam
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'decimal',
      maximumFractionDigits: 0 
    }).format(amount) + ' đ';
  };

  // Kiểm tra xem có dữ liệu cho biểu đồ không
  const hasChartData = useMemo(() => {
    return filteredMonthlyData && filteredMonthlyData.some(item => item.revenue > 0);
  }, [filteredMonthlyData]);

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
                  <MenuItem value={2022}>2022</MenuItem>
                  <MenuItem value={2023}>2023</MenuItem>
                  <MenuItem value={2024}>2024</MenuItem>
                  <MenuItem value={2025}>2025</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
        </div>
        
        {/* Dashboard Metrics */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, borderRadius: 2, textAlign: 'center', boxShadow: 2 }}>
              <Typography color="textSecondary" variant="subtitle2">
                Tổng Doanh Thu
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {totalRevenue > 0 ? formatCurrency(totalRevenue) : "Không có dữ liệu"}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, borderRadius: 2, textAlign: 'center', boxShadow: 2 }}>
              <Typography color="textSecondary" variant="subtitle2">
                Doanh Thu TB/Tháng
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {averageMonthlyRevenue > 0 ? formatCurrency(averageMonthlyRevenue) : "Không có dữ liệu"}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, borderRadius: 2, textAlign: 'center', boxShadow: 2 }}>
              <Typography color="textSecondary" variant="subtitle2">
                Tổng Khách Hàng
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {totalCustomers > 0 ? totalCustomers : "Không có dữ liệu"}
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
                <Typography>Không có dữ liệu doanh thu cho {selectedYear}</Typography>
              </Box>
            )}
          </div>
        </Paper>
        
        {/* Revenue Table */}
        <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Chi Tiết Doanh Thu {monthDisplay === 12 ? 'Hàng Tháng' : `${monthDisplay} Tháng`} {selectedYear}
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Tháng</TableCell>
                  <TableCell align="right">Doanh Thu</TableCell>
                  <TableCell align="right">Số Đơn Hàng</TableCell>
                  <TableCell align="right">Số Khách Hàng</TableCell>
                  <TableCell align="right">TB/Khách</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">Đang tải dữ liệu...</TableCell>
                  </TableRow>
                ) : filteredMonthlyData.length > 0 ? (
                  filteredMonthlyData.map((row) => (
                    <TableRow key={row.month}>
                      <TableCell component="th" scope="row">{row.monthName}</TableCell>
                      <TableCell align="right">{row.revenue > 0 ? formatCurrency(row.revenue) : "Không có dữ liệu"}</TableCell>
                      <TableCell align="right">{row.orders > 0 ? row.orders : "-"}</TableCell>
                      <TableCell align="right">{row.customers > 0 ? row.customers : "-"}</TableCell>
                      <TableCell align="right">{row.averagePerCustomer > 0 ? formatCurrency(row.averagePerCustomer) : "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">Không có dữ liệu cho năm {selectedYear}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </div>
    </div>
    </Box>
  );
};

export default Revenue;
