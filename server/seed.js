const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');

const Category = require('./models/Category');
const Product = require('./models/Product');
const User = require('./models/User');
const Order = require('./models/Order');

// ======================
// Categorias
// ======================
const categories = [
  {
    name: 'Appetizers',
    description: 'Start your meal with our delicious appetizers',
    coverImage: 'https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400',
    isActive: true,
  },
  {
    name: 'Main Courses',
    description: 'Hearty and satisfying main dishes',
    coverImage: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
    isActive: true,
  },
  {
    name: 'Desserts',
    description: 'Sweet treats to end your meal perfectly',
    coverImage: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',
    isActive: true,
  },
  {
    name: 'Beverages',
    description: 'Refreshing drinks and beverages',
    coverImage: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400',
    isActive: true,
  },
];

// ======================
// Produtos
// ======================
const products = [
  {
    name: 'Margherita Pizza',
    description: 'Classic pizza with fresh tomatoes, mozzarella, and basil',
    price: 12.99,
    categoryName: 'Main Courses',
    images: [
      'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400',
    ],
    sizes: [
      { name: 'Small', price: 12.99, isDefault: true, stock: 10 },
      { name: 'Medium', price: 16.99, isDefault: false, stock: 8 },
      { name: 'Large', price: 20.99, isDefault: false, stock: 5 },
    ],
    isActive: true,
    featured: false,
    rating: 0,
    reviewCount: 0,
  },
  {
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with caesar dressing and croutons',
    price: 8.99,
    categoryName: 'Appetizers',
    images: ['https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400'],
    sizes: [{ name: 'Regular', price: 8.99, isDefault: true, stock: 15 }],
    isActive: true,
    featured: false,
    rating: 0,
    reviewCount: 0,
  },
  {
    name: 'Chocolate Cake',
    description: 'Rich and moist chocolate cake with chocolate frosting',
    price: 6.99,
    categoryName: 'Desserts',
    images: ['https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400'],
    sizes: [
      { name: 'Slice', price: 6.99, isDefault: true, stock: 12 },
      { name: 'Whole Cake', price: 45.99, isDefault: false, stock: 3 },
    ],
    isActive: true,
    featured: false,
    rating: 0,
    reviewCount: 0,
  },
  {
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice',
    price: 4.99,
    categoryName: 'Beverages',
    images: ['https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400'],
    sizes: [
      { name: 'Small', price: 4.99, isDefault: true, stock: 20 },
      { name: 'Large', price: 7.99, isDefault: false, stock: 10 },
    ],
    isActive: true,
    featured: false,
    rating: 0,
    reviewCount: 0,
  },
];

// ======================
// Usuários
// ======================
const users = [
  {
    email: 'admin@appfood.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    email: 'user1@appfood.com',
    password: 'user123',
    role: 'user',
  },
  {
    email: 'user2@appfood.com',
    password: 'user123',
    role: 'user',
  },
];

// ======================
// Função principal
// ======================
async function seed() {
  try {
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('✅ Connected to MongoDB');

    // Limpar coleções
    await Promise.all([
      Category.deleteMany({}),
      Product.deleteMany({}),
      User.deleteMany({}),
      Order.deleteMany({}),
    ]);
    console.log('🧹 Cleaned existing collections');

    // Inserir categorias
    const insertedCategories = await Category.insertMany(categories);
    console.log(`✅ Inserted ${insertedCategories.length} categories`);

    // Mapear categorias
    const categoryMap = {};
    insertedCategories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });

    // Preparar produtos
    const productsWithCategoryId = products.map((prod) => ({
      name: prod.name,
      description: prod.description,
      price: prod.price,
      images: prod.images,
      sizes: prod.sizes,
      categoryId: categoryMap[prod.categoryName],
      isActive: prod.isActive,
      featured: prod.featured,
      rating: prod.rating,
      reviewCount: prod.reviewCount,
    }));

    const insertedProducts = await Product.insertMany(productsWithCategoryId);
    console.log(`✅ Inserted ${insertedProducts.length} products`);

    // Inserir usuários
    const usersWithHashedPw = await Promise.all(
      users.map(async (u) => ({
        email: u.email,
        password: await bcrypt.hash(u.password, 10),
        role: u.role,
      }))
    );

    const insertedUsers = await User.insertMany(usersWithHashedPw);
    console.log(`✅ Inserted ${insertedUsers.length} users`);

    // Criar pedidos fake
    const sampleOrders = [
      {
        orderNumber: `ORD-${Date.now()}-001`,
        userId: insertedUsers[1]._id,
        items: [
          {
            productId: insertedProducts[0]._id,
            name: insertedProducts[0].name,
            price: insertedProducts[0].sizes[0].price, // Usa o preço do tamanho padrão
            quantity: 2,
            size: insertedProducts[0].sizes[0].name, // Adiciona o tamanho
          },
        ],
        customerInfo: {
          name: 'User One',
          email: insertedUsers[1].email,
          phone: '123-456-7890',
        },
        deliveryAddress: {
          street: '123 Main Street',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
          complement: 'Apt 101',
        },
        status: 'delivered',
        paymentMethod: 'credit_card',
        paymentStatus: 'paid',
        subtotal: insertedProducts[0].sizes[0].price * 2,
        deliveryFee: 5.0,
        tax: 1.5,
        discount: 0.0,
        totalAmount: insertedProducts[0].sizes[0].price * 2 + 5.0 + 1.5 - 0.0,
        notes: 'Deliver to front door',
      },
      {
        orderNumber: `ORD-${Date.now()}-002`,
        userId: insertedUsers[2]._id,
        items: [
          {
            productId: insertedProducts[2]._id,
            name: insertedProducts[2].name,
            price: insertedProducts[2].sizes[0].price, // Usa o preço do tamanho padrão
            quantity: 1,
            size: insertedProducts[2].sizes[0].name, // Adiciona o tamanho
          },
        ],
        customerInfo: {
          name: 'User Two',
          email: insertedUsers[2].email,
          phone: '987-654-3210',
        },
        deliveryAddress: {
          street: '456 Elm Street',
          city: 'Rio de Janeiro',
          state: 'RJ',
          zipCode: '20000-000',
          complement: 'House',
        },
        status: 'pending',
        paymentMethod: 'pix',
        paymentStatus: 'pending',
        subtotal: insertedProducts[2].sizes[0].price,
        deliveryFee: 3.0,
        tax: 0.5,
        discount: 1.0,
        totalAmount: insertedProducts[2].sizes[0].price + 3.0 + 0.5 - 1.0,
        notes: 'No notes',
      },
    ];

    const insertedOrders = await Order.insertMany(sampleOrders);
    console.log(`✅ Inserted ${insertedOrders.length} orders`);

    console.log('🎉 Seeding completed successfully!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seed();