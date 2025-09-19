const Product = require('../models/Product');
const Stock = require('../models/Stock');

/**
 * Retorna inventário de produtos.
 * Suporta filtro de busca por nome (?q=).
 * Retorna array com { productId, name, sizes, totalStock, sku? }
 */
async function getInventory({ q } = {}) {
  const filter = {};
  if (q) {
    filter.name = { $regex: q, $options: 'i' };
  }

  const products = await Product.find(filter).lean();

  let stockMap = new Map();
  if (products.length > 0) {
    const productIds = products.map((p) => p._id);
    const stockDocs = await Stock.find({ productId: { $in: productIds } }).lean();
    stockMap = new Map(stockDocs.map((s) => [String(s.productId), s]));
  }

  const inventory = products.map((p) => {
    const sizes = (p.sizes || []).map((s) => ({
      name: s.name,
      price: s.price,
      stock: typeof s.stock === 'number' ? s.stock : 0,
    }));

    let totalStock = sizes.reduce((acc, s) => acc + (s.stock || 0), 0);

    const stockDoc = stockMap.get(String(p._id));
    if (stockDoc && typeof stockDoc.quantity === 'number') {
      totalStock = stockDoc.quantity;
    }

    return {
      productId: String(p._id),
      name: p.name,
      sku: p.sku || null,
      sizes,
      totalStock,
    };
  });

  return { inventory };
}

/**
 * Atualiza estoque de um produto.
 * body pode ser:
 *  - { quantity: number }  -> atualiza/insere Stock doc
 *  - { sizes: [{ name, stock }] } -> atualiza Product.sizes stock por name
 *  - { delta: number } -> incrementa/decrementa quantidade
 */
async function updateStock(productId, body) {
  const product = await Product.findById(productId);
  if (!product) {
    const err = new Error('Product not found');
    err.status = 404;
    throw err;
  }

  if (body && typeof body.quantity === 'number') {
    const q = Math.max(0, Math.floor(body.quantity));
    await Stock.findOneAndUpdate(
      { productId },
      { $set: { quantity: q } },
      { upsert: true }
    );

    const result = await getInventory({ q: null });
    return result.inventory.find((i) => i.productId === String(productId));
  }

  if (Array.isArray(body.sizes)) {
    const sizesToUpdate = body.sizes;
    product.sizes = (product.sizes || []).map((s) => {
      const found = sizesToUpdate.find((u) => u.name === s.name);
      if (found && typeof found.stock === 'number') {
        return {
          ...s,
          stock: Math.max(0, Math.floor(found.stock)),
        };
      }
      return s;
    });

    sizesToUpdate.forEach((u) => {
      if (!product.sizes.some((s) => s.name === u.name)) {
        product.sizes.push({
          name: u.name,
          price: typeof u.price === 'number' ? u.price : 0,
          stock: Math.max(0, Math.floor(u.stock || 0)),
        });
      }
    });

    await product.save();

    const result = await getInventory({ q: null });
    return result.inventory.find((i) => i.productId === String(productId));
  }

  if (body && typeof body.delta === 'number') {
    const stockDoc = await Stock.findOneAndUpdate(
      { productId },
      { $inc: { quantity: Math.floor(body.delta) } },
      { upsert: true, new: true }
    );

    if (stockDoc.quantity < 0) {
      stockDoc.quantity = 0;
      await stockDoc.save();
    }

    const result = await getInventory({ q: null });
    return result.inventory.find((i) => i.productId === String(productId));
  }

  const err = new Error('No valid update payload provided (expected {quantity}, {sizes} or {delta})');
  err.status = 400;
  throw err;
}

module.exports = { getInventory, updateStock };
