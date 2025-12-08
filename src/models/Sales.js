const mongoose = require('mongoose');

const SalesSchema = new mongoose.Schema({
  Age: Number,
  Brand: String,
  "Customer ID": String,
  "Customer Name": String,
  "Customer Region": String,
  "Customer Type": String,
  Date: String,
  "Delivery Type": String,
  "Discount Percentage": Number,
  "Employee Name": String,
  "Final Amount": mongoose.Schema.Types.Decimal128,
  Gender: String,
  "Order Status": String,
  "Payment Method": String,
  "Phone Number": Number,
  "Price per Unit": Number,
  "Product Category": String,
  "Product ID": String,
  "Product Name": String,
  Quantity: Number,
  "Salesperson ID": String,
  "Store ID": String,
  "Store Location": String,
  Tags: String,
  "Total Amount": Number,
  "Transaction ID": Number
}, {
  timestamps: false,
  strict: false
});

// Single field indexes for filtering
SalesSchema.index({ "Transaction ID": 1 });
SalesSchema.index({ "Date": 1 });
SalesSchema.index({ "Customer Region": 1 });
SalesSchema.index({ "Product Category": 1 });
SalesSchema.index({ "Gender": 1 });
SalesSchema.index({ "Age": 1 });
SalesSchema.index({ "Payment Method": 1 });
SalesSchema.index({ "Tags": 1 });
SalesSchema.index({ "Customer Name": "text" }); // Text index for search
SalesSchema.index({ "Phone Number": 1 });
SalesSchema.index({ "Customer ID": 1 });
SalesSchema.index({ "Product ID": 1 });
SalesSchema.index({ "Order Status": 1 });
SalesSchema.index({ "Store Location": 1 });

// Compound indexes for common query patterns
SalesSchema.index({ 
  "Customer Region": 1, 
  "Gender": 1, 
  "Product Category": 1 
});

SalesSchema.index({ 
  "Date": 1, 
  "Customer Region": 1 
});

SalesSchema.index({ 
  "Date": 1, 
  "Product Category": 1 
});

SalesSchema.index({ 
  "Customer Region": 1,
  "Payment Method": 1 
});

SalesSchema.index({ 
  "Product Category": 1,
  "Gender": 1 
});

// Index for age range queries
SalesSchema.index({ 
  "Age": 1,
  "Gender": 1 
});

// Index for filter combinations
SalesSchema.index({ 
  "Customer Region": 1,
  "Gender": 1,
  "Age": 1,
  "Product Category": 1
});

// Index for search queries
SalesSchema.index({ 
  "Customer Name": 1,
  "Phone Number": 1,
  "Customer ID": 1
});

// Index for date range with filters
SalesSchema.index({ 
  "Date": 1,
  "Customer Region": 1,
  "Product Category": 1,
  "Payment Method": 1
});

module.exports = mongoose.model('sales_data', SalesSchema, 'sales_data'); 