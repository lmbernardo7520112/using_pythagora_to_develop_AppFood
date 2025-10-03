// server/updateStockQuantities.js
const mongoose = require('mongoose');
require('dotenv').config();

// Conectar ao MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Script principal
async function updateStockQuantities() {
  try {
    await connectDB();
    
    // Obter referência direta à coleção stocks
    const db = mongoose.connection.db;
    const stocksCollection = db.collection('stocks');
    
    // ATUALIZAR TODOS OS REGISTROS PARA TER 100 UNIDADES
    const result = await stocksCollection.updateMany(
      {}, // Todos os documentos
      { 
        $set: { 
          quantity: 100,
          availableQuantity: 100,
          reservedQuantity: 0,
          totalQuantity: 100
        } 
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} stock records`);
    console.log('✅ All stocks now have 100 units available!');

    // Verificar a atualização
    const updatedStocks = await stocksCollection.find({}).toArray();
    console.log('\n=== UPDATED STOCK STATUS ===');
    updatedStocks.forEach(stock => {
      console.log(`Stock ID: ${stock._id}`);
      console.log(`Product ID: ${stock.productId}`);
      console.log(`Size ID: ${stock.sizeId || 'No size'}`);
      console.log(`Quantity: ${stock.quantity}`);
      console.log(`Available: ${stock.availableQuantity}`);
      console.log(`Reserved: ${stock.reservedQuantity}`);
      console.log('---');
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating stock quantities:', error);
    process.exit(1);
  }
}

updateStockQuantities();