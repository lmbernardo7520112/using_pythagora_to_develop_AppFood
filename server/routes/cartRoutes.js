const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product"); // Importar modelo de produtos
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

// 📌 Adicionar item
router.post("/items", authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, size, quantity } = req.body;

    // Buscar produto real no banco
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Produto não encontrado" });
    }

    let cart = await getOrCreateCart(userId, null);

    cart.addItem({
      productId: product._id,
      sizeName: size,
      quantity,
      unitPrice: product.price,
      productName: product.name,
      productImage: product.image,
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
    const { quantity } = req.body;

    const cart = await getOrCreateCart(userId, null);
    cart.updateItemQuantity(itemId, quantity);
    await cart.save();

    res.status(200).json({ success: true, message: "Quantidade atualizada", cart });
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

