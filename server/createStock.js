// scripts/createStock.js
const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');
const Stock = require('./models/Stock');

async function createStockRecords() {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB');

    // Buscar todos os produtos
    const products = await Product.find({ isActive: true });
    console.log(`Found ${products.length} products`);

    for (const product of products) {
      // Para produtos com tamanhos
      if (product.sizes && product.sizes.length > 0) {
        for (const size of product.sizes) {
          const existingStock = await Stock.findOne({
            productId: product._id,
            sizeId: size._id
          });

          if (!existingStock) {
            const stock = new Stock({
              productId: product._id,
              sizeId: size._id,
              availableQuantity: 100, // Quantidade inicial
              reservedQuantity: 0,
              isActive: true
            });

            await stock.save();
            console.log(`Created stock for ${product.name} - ${size.name}`);
          }
        }
      } else {
        // Para produtos sem tamanhos
        const existingStock = await Stock.findOne({
          productId: product._id,
          sizeId: { $exists: false }
        });

        if (!existingStock) {
          const stock = new Stock({
            productId: product._id,
            availableQuantity: 100, // Quantidade inicial
            reservedQuantity: 0,
            isActive: true
          });

          await stock.save();
          console.log(`Created stock for ${product.name} (no size)`);
        }
      }
    }

    console.log('Stock records created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating stock records:', error);
    process.exit(1);
  }
}

createStockRecords();