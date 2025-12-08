require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  console.log('🔗 Testing your MongoDB connection...');
  
  // Check if .env is loaded
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env');
    return;
  }
  
  console.log('✅ .env file loaded');
  console.log('📝 URI length:', process.env.MONGODB_URI.length, 'characters');
  
  try {
    // Connect with timeout
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    
    console.log('✅ Connected to MongoDB!');
    console.log('📊 Host:', mongoose.connection.host);
    console.log('📊 Database:', mongoose.connection.name);
    
    // Check if we can access the database
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\n📦 Collections found:');
    if (collections.length === 0) {
      console.log('  (No collections found)');
    } else {
      collections.forEach(col => {
        console.log(`  - ${col.name}`);
      });
    }
    
    // Check for sales_data
    const salesDataExists = collections.some(c => c.name === 'sales_data');
    if (salesDataExists) {
      console.log('\n✅ Found sales_data collection!');
      const count = await db.collection('sales_data').countDocuments();
      console.log(`📊 Total documents: ${count}`);
    } else {
      console.log('\n❌ sales_data collection not found');
      console.log('💡 You may need to import your CSV data');
    }
    
    await mongoose.disconnect();
    console.log('\n🎉 Connection test successful!');
    
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    
    if (error.message.includes('bad auth')) {
      console.log('\n🔑 Authentication issue:');
      console.log('1. Double-check username/password');
      console.log('2. Go to MongoDB Atlas → Database Access');
      console.log('3. Verify user exists with correct password');
    }
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('\n🌐 Network issue:');
      console.log('1. Check internet connection');
      console.log('2. Verify cluster URL is correct');
    }
  }
}

testConnection();