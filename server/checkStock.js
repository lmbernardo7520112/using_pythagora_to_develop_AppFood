// scripts/checkStock.js
const mongoose = require('mongoose');
require('dotenv').config();

const Stock = require('../models/Stock');
const Product = require('../models/Product');

async function checkStock() {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    
    const stocks = await Stock.find({}).populate('productId', 'name');
    
    console.log('=== CURRENT STOCK STATUS ===');
    stocks.forEach(stock => {
      console.log(`Product: ${stock.productId?.name || 'Unknown'}`);
      console.log(`Size ID: ${stock.sizeId || 'No size'}`);
      console.log(`Available: ${stock.availableQuantity}`);
      console.log(`Reserved: ${stock.reservedQuantity}`);
      console.log(`Total: ${stock.totalQuantity}`);
      console.log('---');
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error checking stock:', error);
    process.exit(1);
  }
}

checkStock();