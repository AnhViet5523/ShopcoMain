import React, { useMemo, useState } from 'react';
import { Box, Grid, Paper, Typography, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, FormControl, Select, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { formatCurrency } from '../../utils/formatCurrency';
import { Line } from 'react-chartjs-2';

const Revenue = () => {
  const navigate = useNavigate();
  const [activeItem, setActiveItem] = useState('revenue');
  const { totalRevenue, averageMonthlyRevenue, totalCustomers, filteredMonthlyData } = useSelector(state => state.revenue);
  const { selectedYear, monthDisplay } = useSelector(state => state.dashboard);
  const { isLoading, hasChartData, chartData, chartOptions } = useSelector(state => state.chart);

  const sidebarItems = [
    { id: 'revenue', name: 'Doanh thu', icon: '📊' },
    { id: 'staff', name: 'Nhân viên', icon: '👤' },
    { id: 'viewOrder', name: 'Đơn hàng', icon: '📋' },
    { id: 'product', name: 'Sản phẩm', icon: '📦' },
    { id: 'viewCustomer', name: 'Hồ sơ khách hàng', icon: '📝' },
    { id: 'viewSupport', name: 'Đơn hỗ trợ', icon: '📫' },
    { id: 'voucher', name: 'Vouchers', icon: '🎫' },
    { id: 'feedback', name: 'Feedback', icon: '📢' },
    { id: 'blogManager', name: 'Blog', icon: '📰' },
    { id: 'routine', name: 'Quy trình chăm sóc da', icon: '🧖‍♂️' }
  ];

  const handleYearChange = (event) => {
    // Giả định là có action cập nhật selectedYear trong Redux
    // dispatch(setSelectedYear(event.target.value));
  };

  const handleMonthDisplayChange = (event) => {
    // Giả định là có action cập nhật monthDisplay trong Redux
    // dispatch(setMonthDisplay(Number(event.target.value)));
  };

  // Revenue Table - Không hiển thị bảng chi tiết với năm 2025
  const shouldShowDetailTable = useMemo(() => {
    return selectedYear !== 2025;
  }, [selectedYear]);

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
        
        {/* Revenue Table - Chỉ hiển thị khi không phải năm 2025 */}
        {shouldShowDetailTable && (
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
        )}
      </div>
    </div>
    </Box>
  );
};

export default Revenue; 