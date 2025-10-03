// server/moveCartItems.js
const mongoose = require('mongoose');
const Cart = require('./models/Cart'); // Ajuste o path se necessário
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

// Script principal para mover itens
async function moveCartItems() {
  try {
    await connectDB();

    const targetUserId = new mongoose.Types.ObjectId('68cc4cba811aed2b2890b09f'); // UserId válido dos logs

    // Encontrar carts órfãos (userId: null)
    const orphanCarts = await Cart.find({ userId: null });
    console.log('Orphan carts found:', orphanCarts.length); // LOG: Número de carts órfãos
    orphanCarts.forEach((cart, index) => {
      console.log(`Orphan cart ${index + 1} ID: ${cart._id}, Items count: ${cart.items.length}`); // LOG: Detalhes de cada cart
    });

    if (orphanCarts.length === 0) {
      console.log('✅ No orphan carts found.');
      process.exit(0);
    }

    // Encontrar ou criar cart alvo
    let targetCart = await Cart.findOne({ userId: targetUserId });
    if (!targetCart) {
      targetCart = new Cart({ userId: targetUserId, items: [] });
    }

    // Mover itens de cada órfão
    let movedItemsCount = 0;
    for (const orphan of orphanCarts) {
      for (const item of orphan.items) {
        console.log('Inspecting item:', item); // LOG: Inspeciona cada item antes de adicionar
        try {
          if (!item.productId) {
            console.warn(`Skipping invalid item in orphan cart ${orphan._id}: missing productId`); // LOG: Pula inválido
            continue;
          }
          // Garantir que sizeId seja tratado corretamente se undefined
          const itemData = {
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage,
            sizeId: item.sizeId || null, // Força null se undefined
            sizeName: item.sizeName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice
          };
          targetCart.addItem(itemData); // Usa método do model para adicionar
          movedItemsCount++;
        } catch (error) {
          console.error(`Error adding item from orphan cart ${orphan._id}:`, error); // LOG: Erro por item
        }
      }
      await orphan.deleteOne(); // Deleta órfão após processar (corrigido de remove())
    }

    await targetCart.save();

    console.log(`✅ Moved ${movedItemsCount} items to target cart for userId: ${targetUserId}`);
    console.log('✅ Orphan carts deleted.');

    // Verificação final
    const finalTargetCart = await Cart.findOne({ userId: targetUserId });
    console.log('\n=== FINAL TARGET CART ===');
    console.log(finalTargetCart);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error moving cart items:', error);
    process.exit(1);
  }
}

moveCartItems();