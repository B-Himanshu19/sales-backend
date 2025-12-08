const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const salesRoutes = require('./routes/salesRoutes');
app.use('/api/sales', salesRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Retail Sales Management System API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      filters: '/api/sales/filters',
      sales: '/api/sales?page=1&limit=10'
    }
  });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message
  });
});

const startServer = async () => {
  try {
    await connectDB();
    console.log('MongoDB connected successfully');
    
    // Warm up filter options cache
    const salesService = require('./services/salesService');
    try {
      await salesService.getFilterOptions();
      console.log('Filter options cache warmed up');
    } catch (error) {
      console.warn('Failed to warm up filter cache:', error.message);
    }
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`http://localhost:${PORT}`);
      console.log(`Health: http://localhost:${PORT}/health`);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error.message);
    
    app.listen(PORT, () => {
      console.log(`Server running WITHOUT database on port ${PORT}`);
      console.log(`http://localhost:${PORT}`);
    });
  }
};

startServer();

module.exports = app;