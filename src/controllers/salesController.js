const salesService = require('../services/salesService');

const getSales = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'date',
      sortOrder = 'desc',
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

    const result = await salesService.getSalesData({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      sortBy,
      sortOrder,
      filters
    });

    res.json(result);
  } catch (error) {
    console.error('Error in getSales:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

const getFilterOptions = async (req, res) => {
  try {
    const options = await salesService.getFilterOptions();
    res.json(options);
  } catch (error) {
    console.error('Error in getFilterOptions:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

module.exports = {
  getSales,
  getFilterOptions
};