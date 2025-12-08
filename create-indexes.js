const mongoose = require('mongoose');
require('dotenv').config();

async function createIndexes() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI;
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    
    console.log('Connected to MongoDB');
    
    // Get the sales_data collection
    const collection = mongoose.connection.db.collection('sales_data');
    
    console.log('Creating indexes... This may take a few minutes for 700k+ records');
    
    // Drop existing indexes (optional - be careful in production)
    // await collection.dropIndexes();
    // console.log('Dropped existing indexes');
    
    // Single field indexes
    await collection.createIndex({ "Transaction ID": 1 }, { background: true, name: "transaction_id_idx" });
    console.log('Created index: Transaction ID');
    
    await collection.createIndex({ "Date": 1 }, { background: true, name: "date_idx" });
    console.log('Created index: Date');
    
    await collection.createIndex({ "Customer Region": 1 }, { background: true, name: "customer_region_idx" });
    console.log('Created index: Customer Region');
    
    await collection.createIndex({ "Product Category": 1 }, { background: true, name: "product_category_idx" });
    console.log('Created index: Product Category');
    
    await collection.createIndex({ "Gender": 1 }, { background: true, name: "gender_idx" });
    console.log('Created index: Gender');
    
    await collection.createIndex({ "Age": 1 }, { background: true, name: "age_idx" });
    console.log('Created index: Age');
    
    await collection.createIndex({ "Payment Method": 1 }, { background: true, name: "payment_method_idx" });
    console.log('Created index: Payment Method');
    
    await collection.createIndex({ "Tags": 1 }, { background: true, name: "tags_idx" });
    console.log('Created index: Tags');
    
    await collection.createIndex({ "Customer Name": 1 }, { background: true, name: "customer_name_idx" });
    console.log('Created index: Customer Name');
    
    await collection.createIndex({ "Phone Number": 1 }, { background: true, name: "phone_number_idx" });
    console.log('Created index: Phone Number');
    
    // Text index for search (only one text index per collection)
    await collection.createIndex(
      { 
        "Customer Name": "text",
        "Customer ID": "text",
        "Product ID": "text"
      },
      { 
        background: true, 
        name: "text_search_idx",
        weights: {
          "Customer Name": 3,
          "Customer ID": 2,
          "Product ID": 1
        }
      }
    );
    console.log('Created text index for search');
    
    // Compound indexes for common queries
    await collection.createIndex(
      { "Customer Region": 1, "Gender": 1, "Product Category": 1 },
      { background: true, name: "region_gender_category_idx" }
    );
    console.log('Created index: Customer Region + Gender + Product Category');
    
    await collection.createIndex(
      { "Date": 1, "Customer Region": 1 },
      { background: true, name: "date_region_idx" }
    );
    console.log('Created index: Date + Customer Region');
    
    await collection.createIndex(
      { "Date": 1, "Product Category": 1 },
      { background: true, name: "date_category_idx" }
    );
    console.log('Created index: Date + Product Category');
    
    await collection.createIndex(
      { "Customer Region": 1, "Payment Method": 1 },
      { background: true, name: "region_payment_idx" }
    );
    console.log('Created index: Customer Region + Payment Method');
    
    // Index for age range with gender
    await collection.createIndex(
      { "Age": 1, "Gender": 1 },
      { background: true, name: "age_gender_idx" }
    );
    console.log('Created index: Age + Gender');
    
    // Comprehensive filter index
    await collection.createIndex(
      { 
        "Customer Region": 1,
        "Gender": 1,
        "Age": 1,
        "Product Category": 1,
        "Payment Method": 1
      },
      { background: true, name: "comprehensive_filter_idx" }
    );
    console.log('Created comprehensive filter index');
    
    // Index for date range with multiple filters
    await collection.createIndex(
      { 
        "Date": 1,
        "Customer Region": 1,
        "Product Category": 1,
        "Payment Method": 1
      },
      { background: true, name: "date_range_filters_idx" }
    );
    console.log('Created date range filters index');
    
    console.log('\n✅ All indexes created successfully!');
    console.log('\nCurrent indexes:');
    
    // List all indexes
    const indexes = await collection.indexes();
    console.log(`Total indexes: ${indexes.length}`);
    indexes.forEach((idx, i) => {
      console.log(`${i + 1}. ${idx.name}: ${JSON.stringify(idx.key)}`);
    });
    
    // Get index statistics
    console.log('\n📊 Index statistics:');
    const stats = await collection.stats();
    console.log(`Collection size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Document count: ${stats.count}`);
    console.log(`Index size: ${(stats.totalIndexSize / 1024 / 1024).toFixed(2)} MB`);
    
  } catch (error) {
    console.error('Error creating indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
}

// Check if running directly
if (require.main === module) {
  createIndexes();
}

module.exports = createIndexes;