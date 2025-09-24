const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { authenticate } = require("./middlewares/auth");

const router = express.Router();

// 📌 Obter ou criar cart
async function getOrCreateCart(userId, sessionId) {
  let cart = await Cart.findCart(sessionId, userId);
  if (!cart) {
    cart = new Cart({ userId, sessionId, items: [] });
    await cart.save();
  }
  return cart;
}

// 📌 Adicionar item ao carrinho
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
      totalPrice, // ✅ agora aceitamos também
    } = req.body;

    // 🔒 Validações básicas
    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "ID do produto é obrigatório" });
    }
    if (!sizeName) {
      return res
        .status(400)
        .json({ success: false, message: "Tamanho é obrigatório" });
    }
    if (!quantity || quantity < 1) {
      quantity = 1;
    }

    // 🔎 Se frontend não mandou infos completas, busca no banco
    if (!productName || !unitPrice || !productImage) {
      const product = await Product.findById(productId);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Produto não encontrado" });
      }
      productName = productName || product.name;
      unitPrice = unitPrice || product.price;
      productImage = productImage || product.image;
    }

    // 🔢 Calcula preço total se não veio do frontend
    if (!totalPrice) {
      totalPrice = unitPrice * quantity;
    }

    // 📦 Obter carrinho ou criar
    let cart = await getOrCreateCart(userId, null);

    // ➕ Adicionar item
    cart.addItem({
      productId,
      sizeId,
      sizeName,
      quantity,
      unitPrice,
      productName,
      productImage,
      totalPrice, // ✅ enviado para o schema
    });

    await cart.save();
    res.status(200).json({ success: true, message: "Item adicionado", cart });
  } catch (error) {
    console.error("Error adding item:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 📌 Remover item
router.delete("/items/:itemId", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const cart = await getOrCreateCart(userId, null);
    cart.removeItem(itemId);
    await cart.save();

    res.status(200).json({ success: true, message: "Item removido", cart });
  } catch (error) {
    console.error("Error removing item:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 📌 Atualizar quantidade
router.put("/items/:itemId", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    let { quantity } = req.body;

    if (!quantity || quantity < 1) {
      quantity = 1;
    }

    const cart = await getOrCreateCart(userId, null);
    cart.updateItemQuantity(itemId, quantity);
    await cart.save();

    res
      .status(200)
      .json({ success: true, message: "Quantidade atualizada", cart });
  } catch (error) {
    console.error("Error updating item:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 📌 Limpar carrinho
router.delete("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await getOrCreateCart(userId, null);
    cart.clearCart();
    await cart.save();

    res.status(200).json({ success: true, message: "Carrinho limpo", cart });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 📌 Obter carrinho atual
router.get("/", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await getOrCreateCart(userId, null);
    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
