// server/services/cartService.js
const Cart = require("../models/Cart");
const Product = require("../models/Product");

/**
 * Recupera o carrinho do usuário logado ou do sessionId anônimo
 */
async function getCart(req, res) {
  try {
    const userId = req.user?.id;
    const sessionId = req.headers["x-session-id"];

    let cart;
    if (userId) {
      cart = await Cart.findOne({ userId }).populate("items.productId");
      if (!cart) {
        cart = await Cart.create({ userId, items: [] });
      }
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId }).populate("items.productId");
      if (!cart) {
        cart = await Cart.create({ sessionId, items: [] });
      }
    } else {
      return res.status(400).json({ message: "No user or sessionId provided" });
    }

    return res.json(cart);
  } catch (error) {
    console.error("getCart error:", error);
    return res.status(500).json({ message: "Failed to fetch cart" });
  }
}

/**
 * Adiciona item ao carrinho
 */
async function addToCart(req, res) {
  try {
    const { productId, size, quantity } = req.body;
    const userId = req.user?.id;
    const sessionId = req.headers["x-session-id"];

    if (!productId || !quantity || !size) {
      return res.status(400).json({ message: "Invalid payload: productId, size, and quantity are required" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const productImage = product.images[0] || "https://via.placeholder.com/400?text=No+Image";
    const productName = product.name || "Unnamed Product";

    let cart;
    if (userId) {
      cart = await Cart.findOne({ userId });
      if (!cart) cart = await Cart.create({ userId, items: [] });
    } else if (sessionId) {
      cart = await Cart.findOne({ sessionId });
      if (!cart) cart = await Cart.create({ sessionId, items: [] });
    } else {
      return res.status(400).json({ message: "No user or sessionId provided" });
    }

    // Verifica se o mesmo produto + tamanho já existe
    const existingItem = cart.items.find(
      item => item.productId.toString() === productId && item.size === size
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId,
        size,
        quantity,
        productName,
        productImage
      });
    }

    await cart.save();
    const populatedCart = await cart.populate("items.productId");
    return res.json(populatedCart);
  } catch (error) {
    console.error("addToCart error:", error);
    return res.status(500).json({ message: "Failed to add item to cart" });
  }
}

/**
 * Remove item do carrinho
 */
async function removeFromCart(req, res) {
  try {
    const { productId, size } = req.params; // espera produto + tamanho
    const userId = req.user?.id;
    const sessionId = req.headers["x-session-id"];

    if (!productId || !size) {
      return res.status(400).json({ message: "productId and size are required to remove item" });
    }

    let cart;
    if (userId) cart = await Cart.findOne({ userId });
    else if (sessionId) cart = await Cart.findOne({ sessionId });
    else return res.status(400).json({ message: "No user or sessionId provided" });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      item => !(item.productId.toString() === productId && item.size === size)
    );

    await cart.save();
    const populatedCart = await cart.populate("items.productId");
    return res.json(populatedCart);
  } catch (error) {
    console.error("removeFromCart error:", error);
    return res.status(500).json({ message: "Failed to remove item from cart" });
  }
}

module.exports = {
  getCart,
  addToCart,
  removeFromCart,
};



