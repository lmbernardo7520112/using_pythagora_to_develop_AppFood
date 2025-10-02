// server/routes/cartRoutes.js
const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { authenticate } = require("./middlewares/auth");

const router = express.Router();

// 🔌 Obter ou criar cart (apenas por userId)
async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [] });
    await cart.save();
  }
  return cart;
}

// ✅ FUNÇÃO AUXILIAR: Buscar dados do tamanho específico
async function getSizeData(productId, sizeId, sizeName) {
  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Produto não encontrado");
  }

  let sizeData = null;

  if (sizeId && product.sizes) {
    sizeData = product.sizes.find(size => size._id.toString() === sizeId);
  }

  if (!sizeData && sizeName && product.sizes) {
    sizeData = product.sizes.find(size => size.name === sizeName);
  }

  if (!sizeData && product.sizes && product.sizes.length > 0) {
    sizeData = product.sizes.find(size => size.isDefault) || product.sizes[0];
  }

  return { product, sizeData: sizeData || null };
}

// 🔌 Adicionar item ao carrinho
router.post("/items", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    let {
      productId,
      sizeId,
      sizeName,
      quantity,
      unitPrice,
      productName,
      productImage,
      totalPrice,
    } = req.body;

    console.log("📥 Received cart payload:", req.body);

    if (!productId) {
      return res.status(400).json({ success: false, message: "ID do produto é obrigatório" });
    }

    if (!sizeName) {
      return res.status(400).json({ success: false, message: "Tamanho é obrigatório" });
    }

    if (!quantity || quantity < 1) {
      quantity = 1;
    }

    let product, sizeData;
    try {
      const result = await getSizeData(productId, sizeId, sizeName);
      product = result.product;
      sizeData = result.sizeData;
    } catch (error) {
      console.error("Error fetching product data:", error);
      return res.status(404).json({ success: false, message: error.message });
    }

    if (!product.isActive) {
      return res.status(400).json({ success: false, message: "Produto não está disponível" });
    }

    productName = productName || product.name;
    productImage = productImage || (product.images && product.images[0]) || "https://via.placeholder.com/400?text=No+Image";

    if (sizeData) {
      unitPrice = unitPrice || sizeData.price;
      sizeId = sizeId || sizeData._id;

      if (sizeData.stock !== undefined && sizeData.stock < quantity) {
        return res.status(400).json({ success: false, message: `Estoque insuficiente. Disponível: ${sizeData.stock}` });
      }
    } else {
      unitPrice = unitPrice || product.price;
    }

    if (!unitPrice || unitPrice < 0) {
      return res.status(400).json({ success: false, message: "Preço do produto não encontrado" });
    }

    if (!totalPrice) {
      totalPrice = unitPrice * quantity;
    }

    console.log("✅ Processed data:", {
      productId, productName, sizeId, sizeName, unitPrice, quantity, totalPrice
    });

    let cart = await getOrCreateCart(userId);

    cart.addItem({
      productId,
      sizeId,
      sizeName,
      quantity,
      unitPrice,
      productName,
      productImage,
      totalPrice,
    });

    await cart.save();

    console.log("🎉 Item added successfully to cart");
    res.status(200).json({ success: true, message: "Item adicionado ao carrinho", cart });
  } catch (error) {
    console.error("❌ Error adding item to cart:", error);
    res.status(500).json({ success: false, message: `Erro interno: ${error.message}` });
  }
});

// 🔌 Remover item
router.delete("/items/:itemId", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    if (!itemId) {
      return res.status(400).json({ success: false, message: "ID do item é obrigatório" });
    }

    const cart = await getOrCreateCart(userId);

    const itemExists = cart.items.find(item => item._id.toString() === itemId);
    if (!itemExists) {
      return res.status(404).json({ success: false, message: "Item não encontrado no carrinho" });
    }

    cart.removeItem(itemId);
    await cart.save();

    console.log(`🗑️ Item ${itemId} removed from cart`);
    res.status(200).json({ success: true, message: "Item removido do carrinho", cart });
  } catch (error) {
    console.error("❌ Error removing item:", error);
    res.status(500).json({ success: false, message: `Erro ao remover item: ${error.message}` });
  }
});

// 🔌 Atualizar quantidade
router.put("/items/:itemId", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    let { quantity } = req.body;

    if (!itemId) {
      return res.status(400).json({ success: false, message: "ID do item é obrigatório" });
    }

    if (!quantity || quantity < 1) {
      return res.status(400).json({ success: false, message: "Quantidade deve ser pelo menos 1" });
    }

    const cart = await getOrCreateCart(userId);

    const item = cart.items.find(item => item._id.toString() === itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item não encontrado no carrinho" });
    }

    if (item.sizeId) {
      try {
        const { sizeData } = await getSizeData(item.productId, item.sizeId, item.sizeName);
        if (sizeData && sizeData.stock !== undefined && sizeData.stock < quantity) {
          return res.status(400).json({ success: false, message: `Estoque insuficiente. Disponível: ${sizeData.stock}` });
        }
      } catch (error) {
        console.warn("Could not verify stock:", error.message);
      }
    }

    cart.updateItemQuantity(itemId, quantity);
    await cart.save();

    console.log(`🔄 Item ${itemId} quantity updated to ${quantity}`);
    res.status(200).json({ success: true, message: "Quantidade atualizada", cart });
  } catch (error) {
    console.error("❌ Error updating item:", error);
    res.status(500).json({ success: false, message: `Erro ao atualizar quantidade: ${error.message}` });
  }
});

// 🔌 Limpar carrinho
router.delete("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await getOrCreateCart(userId);
    cart.clearCart();
    await cart.save();

    console.log("🧹 Cart cleared successfully");
    res.status(200).json({ success: true, message: "Carrinho limpo", cart });
  } catch (error) {
    console.error("❌ Error clearing cart:", error);
    res.status(500).json({ success: false, message: `Erro ao limpar carrinho: ${error.message}` });
  }
});

// 🔌 Obter carrinho atual
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await getOrCreateCart(userId);

    console.log(`📋 Cart retrieved for user ${userId}`);
    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error("❌ Error fetching cart:", error);
    res.status(500).json({ success: false, message: `Erro ao buscar carrinho: ${error.message}` });
  }
});

module.exports = router;
