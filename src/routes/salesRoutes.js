const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');

router.get('/test', (req, res) => {
  res.json({ message: 'Sales API is working!' });
});
router.get('/range', async (req, res) => {
  try {
    const {
      lastId,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'desc',
      customerRegion,
      gender,
      minAge,
      maxAge,
      productCategory
    } = req.query;

    const filters = {
      customerRegion: customerRegion ? customerRegion.split(',').filter(Boolean) : [],
      gender: gender ? gender.split(',').filter(Boolean) : [],
      minAge: minAge ? parseInt(minAge) : null,
      maxAge: maxAge ? parseInt(maxAge) : null,
      productCategory: productCategory ? productCategory.split(',').filter(Boolean) : []
    };

    const result = await salesService.getSalesDataByRange({
      lastId: lastId ? parseInt(lastId) : null,
      limit: parseInt(limit),
      sortBy,
      sortOrder,
      filters
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get('/optimized', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'id',
      sortOrder = 'asc',
      customerRegion,
      gender,
      minAge,
      maxAge,
      productCategory,
      tags,
      paymentMethod,
      startDate,
      endDate
    } = req.query;

    const filters = {
      customerRegion: customerRegion ? customerRegion.split(',').filter(Boolean) : [],
      gender: gender ? gender.split(',').filter(Boolean) : [],
      minAge: minAge ? parseInt(minAge) : null,
      maxAge: maxAge ? parseInt(maxAge) : null,
      productCategory: productCategory ? productCategory.split(',').filter(Boolean) : [],
      tags: tags ? tags.split(',').filter(Boolean) : [],
      paymentMethod: paymentMethod ? paymentMethod.split(',').filter(Boolean) : [],
      startDate: startDate || null,
      endDate: endDate || null
    };

    const result = await salesService.getSalesDataOptimized({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      sortBy,
      sortOrder,
      filters
    });

    res.json(result);
  } catch (error) {
    console.error('Error in optimized route:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

router.get('/simple', async (req, res) => {
  try {
    const Sales = require('../models/Sales');
    const data = await Sales.find({})
      .limit(10)
      .maxTimeMS(30000)
      .lean();
    
    res.json({
      message: 'Simple data fetch',
      count: data.length,
      data: data.map(item => ({
        id: item["Transaction ID"],
        name: item["Customer Name"],
        amount: item["Total Amount"]
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/filters', salesController.getFilterOptions);
router.get('/', salesController.getSales);

module.exports = router;