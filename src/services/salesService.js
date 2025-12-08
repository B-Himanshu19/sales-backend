const Sales = require('../models/Sales');

let filterOptionsCache = null;
let lastCacheUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000;

const buildFilterQuery = (filters) => {
  const query = {};
  
  if (filters.customerRegion?.length) {
    query["Customer Region"] = { $in: filters.customerRegion };
  }
  
  if (filters.gender?.length) {
    query.Gender = { $in: filters.gender };
  }
  
  if (filters.minAge || filters.maxAge) {
    query.Age = {};
    if (filters.minAge) query.Age.$gte = parseInt(filters.minAge);
    if (filters.maxAge) query.Age.$lte = parseInt(filters.maxAge);
  }
  
  if (filters.productCategory?.length) {
    query["Product Category"] = { $in: filters.productCategory };
  }
  
  if (filters.tags?.length) {
    query.Tags = { $regex: filters.tags.join('|'), $options: 'i' };
  }
  
  if (filters.paymentMethod?.length) {
    query["Payment Method"] = { $in: filters.paymentMethod };
  }
  
  if (filters.startDate || filters.endDate) {
    query.Date = {};
    if (filters.startDate) query.Date.$gte = filters.startDate;
    if (filters.endDate) query.Date.$lte = filters.endDate;
  }
  
  return query;
};

const buildSearchQuery = (search) => {
  if (!search) return {};
  
  
  const numSearch = parseInt(search.replace(/\D/g, ''));
  const isNumberSearch = !isNaN(numSearch) && search.trim().length > 0;
  
  
  const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  
  const query = {
    $or: []
  };
  
  
  query.$or.push(
    { "Customer Name": searchRegex },
    { "Customer ID": searchRegex },
    { "Product ID": searchRegex },
    { "Employee Name": searchRegex },
    { "Product Name": searchRegex },
    { "Brand": searchRegex }
  );
  
  
  if (isNumberSearch) {
    query.$or.push(
      { "Transaction ID": numSearch },
      { "Age": numSearch },
      { "Quantity": numSearch },
      { "Total Amount": numSearch },
      { "Phone Number": numSearch }
    );
  }
  
  
  query.$or = query.$or.filter(condition => Object.keys(condition).length > 0);
  
  return query.$or.length > 0 ? query : {};
};

const getSalesData = async ({ page, limit, search, sortBy, sortOrder, filters }) => {
  try {
    console.log(`Fetching page ${page}, limit ${limit}, sortBy ${sortBy}, sortOrder ${sortOrder}`);
    
    const skip = (page - 1) * limit;
    
    const filterQuery = buildFilterQuery(filters);
    const searchQuery = buildSearchQuery(search);
    
    const queryConditions = [];
    if (Object.keys(filterQuery).length > 0) queryConditions.push(filterQuery);
    if (Object.keys(searchQuery).length > 0) queryConditions.push(searchQuery);
    
    const query = queryConditions.length > 0 ? { $and: queryConditions } : {};
    
    console.log(`Query conditions: ${JSON.stringify(query).substring(0, 200)}...`);
    
    const sortFieldMap = {
      id: 'Transaction ID',
      date: 'Date',
      quantity: 'Quantity',
      customerName: 'Customer Name',
      customerId: 'Customer ID',
      totalAmount: 'Total Amount',
      age: 'Age',
      gender: 'Gender',
      productCategory: 'Product Category',
      customerRegion: 'Customer Region',
      productId: 'Product ID',
      employeeName: 'Employee Name'
    };
    
    const sortField = sortFieldMap[sortBy] || 'Transaction ID'; // Default to Transaction ID
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    
    // Always use indexed field for pagination - Transaction ID is indexed
    const effectiveSortField = sortBy === 'id' || sortBy === 'date' ? sortFieldMap[sortBy] : 'Transaction ID';
    const effectiveSortDirection = sortOrder === 'desc' ? -1 : 1;
    
    console.log(`Using sort field: ${effectiveSortField}, direction: ${effectiveSortDirection}`);
    
    // OPTIMIZATION: For very large page numbers, use range-based query
    let data = [];
    
    if (skip > 500000) { // For skips larger than 500k
      console.log(`Large skip detected (${skip}), using range-based query`);
      
      // Get the last known ID for the skip position
      const anchorDoc = await Sales.findOne({}, { "Transaction ID": 1 })
        .sort({ "Transaction ID": effectiveSortDirection })
        .skip(skip)
        .maxTimeMS(30000)
        .allowDiskUse(true)
        .lean();
      
      if (anchorDoc) {
        const lastId = anchorDoc["Transaction ID"];
        
        // Create range query
        let rangeQuery = { ...query };
        if (effectiveSortDirection === -1) {
          rangeQuery["Transaction ID"] = { $lt: lastId };
        } else {
          rangeQuery["Transaction ID"] = { $gt: lastId };
        }
        
        data = await Sales.find(rangeQuery)
          .sort({ [effectiveSortField]: effectiveSortDirection })
          .limit(parseInt(limit))
          .maxTimeMS(60000)
          .allowDiskUse(true)
          .lean();
      }
    } else {
      // Use normal pagination for reasonable skips
      data = await Sales.find(query)
        .sort({ [effectiveSortField]: effectiveSortDirection })
        .skip(skip)
        .limit(parseInt(limit))
        .maxTimeMS(60000)
        .allowDiskUse(true)
        .lean();
    }
    
    console.log(`Fetched ${data.length} records`);
    
    // Get total count - ALWAYS use estimated count for performance
    let totalRecords;
    
    if (Object.keys(query).length === 0) {
      totalRecords = await Sales.estimatedDocumentCount();
    } else {
      // For filtered queries, try to get count but with timeout
      try {
        totalRecords = await Sales.countDocuments(query)
          .maxTimeMS(15000)
          .allowDiskUse(true);
      } catch (countError) {
        console.warn('Count query timed out, using estimated count');
        totalRecords = await Sales.estimatedDocumentCount();
      }
    }
    
    const totalPages = Math.max(1, Math.ceil(totalRecords / limit));
    const validPage = Math.min(Math.max(1, page), totalPages);
    
    console.log(`Total records: ${totalRecords}, Total pages: ${totalPages}, Valid page: ${validPage}`);
    
    // If requested page is beyond total pages, adjust it
    if (page > totalPages) {
      console.log(`Requested page ${page} is beyond total pages ${totalPages}, adjusting to last page`);
      return {
        data: [],
        pagination: {
          currentPage: totalPages,
          totalPages,
          totalRecords,
          pageSize: limit,
          hasNextPage: false,
          hasPreviousPage: totalPages > 1
        }
      };
    }
    
    // If no data but page is valid, try one more time with adjusted parameters
    if (data.length === 0 && validPage > 1 && validPage <= totalPages) {
      console.log(`No data found for page ${validPage}, trying with Transaction ID sort`);
      
      // Try with Transaction ID sorting as fallback
      data = await Sales.find(query)
        .sort({ "Transaction ID": 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .maxTimeMS(60000)
        .allowDiskUse(true)
        .lean();
    }
    
    const result = {
      data: data.map(item => ({
        id: item["Transaction ID"],
        date: item.Date,
        customerId: item["Customer ID"],
        customerName: item["Customer Name"],
        phoneNumber: item["Phone Number"],
        gender: item.Gender,
        age: item.Age,
        customerRegion: item["Customer Region"],
        productCategory: item["Product Category"],
        quantity: item.Quantity,
        totalAmount: item["Total Amount"],
        productId: item["Product ID"],
        employeeName: item["Employee Name"],
        paymentMethod: item["Payment Method"],
        tags: item.Tags
      })),
      pagination: {
        currentPage: validPage,
        totalPages,
        totalRecords,
        pageSize: limit,
        hasNextPage: validPage < totalPages,
        hasPreviousPage: validPage > 1
      }
    };
    
    console.log(`Returning ${result.data.length} records for page ${validPage}`);
    return result;
    
  } catch (error) {
    console.error('Error in getSalesData:', error.message);
    console.error('Error stack:', error.stack);
    
    // Return error information
    return {
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalRecords: 0,
        pageSize: limit,
        hasNextPage: false,
        hasPreviousPage: false
      },
      error: error.message
    };
  }
};
const getSalesDataOptimized = async ({ page, limit, search, sortBy, sortOrder, filters }) => {
  try {
    console.log(`Optimized fetch for page ${page}`);
    
    const skip = (page - 1) * limit;
    const filterQuery = buildFilterQuery(filters);
    const searchQuery = buildSearchQuery(search);
    
    const queryConditions = [];
    if (Object.keys(filterQuery).length > 0) queryConditions.push(filterQuery);
    if (Object.keys(searchQuery).length > 0) queryConditions.push(searchQuery);
    
    const query = queryConditions.length > 0 ? { $and: queryConditions } : {};
    
    // ALWAYS use Transaction ID for sorting in optimized query
    const sortField = 'Transaction ID';
    const sortDirection = 1; // Always ascending for consistent pagination
    
    // Use a two-step approach for large skips
    let data = [];
    
    if (skip > 100000) {
      // For very large skips, use aggregation with $facet for better performance
      const aggregationPipeline = [];
      
      // Add match stage if query exists
      if (Object.keys(query).length > 0) {
        aggregationPipeline.push({ $match: query });
      }
      
      // Add sort and pagination
      aggregationPipeline.push(
        { $sort: { [sortField]: sortDirection } },
        { $skip: skip },
        { $limit: parseInt(limit) },
        {
          $project: {
            id: "$Transaction ID",
            date: "$Date",
            customerId: "$Customer ID",
            customerName: "$Customer Name",
            phoneNumber: "$Phone Number",
            gender: "$Gender",
            age: "$Age",
            customerRegion: "$Customer Region",
            productCategory: "$Product Category",
            quantity: "$Quantity",
            totalAmount: "$Total Amount",
            productId: "$Product ID",
            employeeName: "$Employee Name",
            paymentMethod: "$Payment Method",
            tags: "$Tags"
          }
        }
      );
      
      data = await Sales.aggregate(aggregationPipeline)
        .maxTimeMS(90000) // 90 second timeout
        .allowDiskUse(true)
        .exec();
    } else {
      // For smaller skips, use normal find
      data = await Sales.find(query)
        .sort({ [sortField]: sortDirection })
        .skip(skip)
        .limit(parseInt(limit))
        .maxTimeMS(60000)
        .allowDiskUse(true)
        .lean();
      
      // Map to response format
      data = data.map(item => ({
        id: item["Transaction ID"],
        date: item.Date,
        customerId: item["Customer ID"],
        customerName: item["Customer Name"],
        phoneNumber: item["Phone Number"],
        gender: item.Gender,
        age: item.Age,
        customerRegion: item["Customer Region"],
        productCategory: item["Product Category"],
        quantity: item.Quantity,
        totalAmount: item["Total Amount"],
        productId: item["Product ID"],
        employeeName: item["Employee Name"],
        paymentMethod: item["Payment Method"],
        tags: item.Tags
      }));
    }
    
    // Get estimated count
    let totalRecords;
    try {
      if (Object.keys(query).length === 0) {
        totalRecords = await Sales.estimatedDocumentCount();
      } else {
        totalRecords = await Sales.countDocuments(query)
          .maxTimeMS(30000)
          .allowDiskUse(true);
      }
    } catch (countError) {
      console.warn('Count query failed, using default');
      totalRecords = 700000; // Default estimate
    }
    
    const totalPages = Math.max(1, Math.ceil(totalRecords / limit));
    const validPage = Math.min(Math.max(1, page), totalPages);
    
    return {
      data,
      pagination: {
        currentPage: validPage,
        totalPages,
        totalRecords,
        pageSize: limit,
        hasNextPage: validPage < totalPages,
        hasPreviousPage: validPage > 1
      }
    };
    
  } catch (error) {
    console.error('Error in getSalesDataOptimized:', error.message);
    throw error;
  }
};
const getSalesDataByRange = async ({ lastId, limit, sortBy, sortOrder, filters }) => {
  try {
    const sortFieldMap = {
      id: 'Transaction ID',
      date: 'Date',
      quantity: 'Quantity',
      customerName: 'Customer Name',
      totalAmount: 'Total Amount',
      age: 'Age'
    };
    
    const sortField = sortFieldMap[sortBy] || 'Transaction ID';
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    
    let query = {};
    
    // Apply filters if any
    const filterQuery = buildFilterQuery(filters);
    if (Object.keys(filterQuery).length > 0) {
      query = { ...filterQuery };
    }
    
    // Add range condition if lastId is provided
    if (lastId) {
      if (sortDirection === 1) {
        query[sortField] = { $gt: lastId };
      } else {
        query[sortField] = { $lt: lastId };
      }
    }
    
    const data = await Sales.find(query)
      .sort({ [sortField]: sortDirection })
      .limit(parseInt(limit))
      .maxTimeMS(30000)
      .allowDiskUse(true)
      .lean();
    
    // Get total count (estimated for performance)
    const totalRecords = await Sales.estimatedDocumentCount();
    
    return {
      data: data.map(item => ({
        id: item["Transaction ID"],
        date: item.Date,
        customerId: item["Customer ID"],
        customerName: item["Customer Name"],
        phoneNumber: item["Phone Number"],
        gender: item.Gender,
        age: item.Age,
        customerRegion: item["Customer Region"],
        productCategory: item["Product Category"],
        quantity: item.Quantity,
        totalAmount: item["Total Amount"],
        productId: item["Product ID"],
        employeeName: item["Employee Name"]
      })),
      totalRecords,
      lastId: data.length > 0 ? data[data.length - 1][sortField] : null
    };
    
  } catch (error) {
    console.error('Error in getSalesDataByRange:', error.message);
    throw error;
  }
};

const getFilterOptions = async () => {
  try {
    const now = Date.now();
    if (filterOptionsCache && (now - lastCacheUpdate) < CACHE_DURATION) {
      return filterOptionsCache;
    }
    
    console.log('Fetching filter options...');
    
    // Instead of using $sample which can be slow on large datasets,
    // use distinct queries or aggregation with grouping
    
    // Use parallel execution for better performance
    const [
      customerRegions,
      genders,
      productCategories,
      paymentMethods
    ] = await Promise.all([
      // Get distinct customer regions with limit
      Sales.distinct("Customer Region").maxTimeMS(30000),
      
      // Get distinct genders
      Sales.distinct("Gender").maxTimeMS(30000),
      
      // Get distinct product categories
      Sales.distinct("Product Category").maxTimeMS(30000),
      
      // Get distinct payment methods
      Sales.distinct("Payment Method").maxTimeMS(30000)
    ]);
    
    // Get age range using aggregation
    const ageRangeResult = await Sales.aggregate([
      {
        $group: {
          _id: null,
          minAge: { $min: "$Age" },
          maxAge: { $max: "$Age" }
        }
      }
    ], { maxTimeMS: 30000 });
    
    // Get tags from a sample (since tags might be too many)
    const tagsResult = await Sales.aggregate([
      { $match: { Tags: { $exists: true, $ne: null, $ne: "" } } },
      { $sample: { size: 10000 } },
      { $project: { Tags: 1 } }
    ], { maxTimeMS: 30000 });
    
    // Process tags
    const tagsSet = new Set();
    tagsResult.forEach(item => {
      if (item.Tags && typeof item.Tags === 'string') {
        const tags = item.Tags.split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);
        tags.forEach(tag => tagsSet.add(tag));
      }
    });
    
    // Sort and limit tags
    const tags = Array.from(tagsSet)
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 100); // Increased to 100 tags
    
    // Prepare age range
    const ageRange = ageRangeResult.length > 0 ? {
      min: ageRangeResult[0].minAge || 0,
      max: ageRangeResult[0].maxAge || 100
    } : { min: 0, max: 100 };
    
    filterOptionsCache = {
      customerRegions: customerRegions.filter(Boolean).sort(),
      genders: genders.filter(Boolean).sort(),
      productCategories: productCategories.filter(Boolean).sort(),
      paymentMethods: paymentMethods.filter(Boolean).sort(),
      tags,
      ageRange
    };
    
    lastCacheUpdate = now;
    
    console.log('Filter options loaded successfully');
    console.log(`Regions: ${filterOptionsCache.customerRegions.length}`);
    console.log(`Genders: ${filterOptionsCache.genders}`);
    console.log(`Categories: ${filterOptionsCache.productCategories.length}`);
    console.log(`Tags: ${filterOptionsCache.tags.length}`);
    console.log(`Age range: ${ageRange.min}-${ageRange.max}`);
    
    return filterOptionsCache;
    
  } catch (error) {
    console.error('Error in getFilterOptions:', error.message);
    console.error('Error stack:', error.stack);
    
    // Return default empty arrays instead of throwing
    return {
      customerRegions: [],
      genders: [],
      productCategories: [],
      paymentMethods: [],
      tags: [],
      ageRange: { min: 0, max: 100 }
    };
  }
};

module.exports = {
  getSalesData,
  getFilterOptions,
  getSalesDataOptimized 
};
