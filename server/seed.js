const mongoose = require("mongoose");
require("dotenv").config();

const Category = require("./models/Category");
const Product = require("./models/Product");

const categories = [
  {
    name: "Appetizers",
    description: "Start your meal with our delicious appetizers",
    coverImage:
      "https://images.unsplash.com/photo-1541014741259-de529411b96a?w=400",
    isActive: true,
  },
  {
    name: "Main Courses",
    description: "Hearty and satisfying main dishes",
    coverImage:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400",
    isActive: true,
  },
  {
    name: "Desserts",
    description: "Sweet treats to end your meal perfectly",
    coverImage:
      "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400",
    isActive: true,
  },
  {
    name: "Beverages",
    description: "Refreshing drinks and beverages",
    coverImage:
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400",
    isActive: true,
  },
];

const products = [
  {
    name: "Margherita Pizza",
    description: "Classic pizza with fresh tomatoes, mozzarella, and basil",
    basePrice: 12.99,
    categoryName: "Main Courses",
    images: [
      "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
    ],
    sizes: [
      { name: "Small", price: 12.99, isDefault: true },
      { name: "Medium", price: 16.99 },
      { name: "Large", price: 20.99 },
    ],
  },
  {
    name: "Caesar Salad",
    description: "Fresh romaine lettuce with caesar dressing and croutons",
    basePrice: 8.99,
    categoryName: "Appetizers",
    images: [
      "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400",
    ],
    sizes: [{ name: "Regular", price: 8.99, isDefault: true }],
  },
  {
    name: "Chocolate Cake",
    description: "Rich and moist chocolate cake with chocolate frosting",
    basePrice: 6.99,
    categoryName: "Desserts",
    images: [
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
    ],
    sizes: [
      { name: "Slice", price: 6.99, isDefault: true },
      { name: "Whole Cake", price: 45.99 },
    ],
  },
  {
    name: "Fresh Orange Juice",
    description: "Freshly squeezed orange juice",
    basePrice: 4.99,
    categoryName: "Beverages",
    images: [
      "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400",
    ],
    sizes: [
      { name: "Small", price: 4.99, isDefault: true },
      { name: "Large", price: 7.99 },
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Connected to MongoDB");

    // Clean existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log("🧹 Cleaned existing collections");

    // Insert categories
    const insertedCategories = await Category.insertMany(categories);
    console.log(`✅ Inserted ${insertedCategories.length} categories`);

    // Map category names to IDs
    const categoryMap = {};
    insertedCategories.forEach((cat) => {
      categoryMap[cat.name] = cat._id;
    });

    // Prepare products with proper categoryId + price field
    const productsWithCategoryId = products.map((prod) => {
      const categoryId = categoryMap[prod.categoryName];
      if (!categoryId) {
        throw new Error(
          `⚠️ Categoria não encontrada para o produto: ${prod.name}`
        );
      }

      return {
        name: prod.name,
        description: prod.description,
        price: prod.basePrice, // <-- corrigido
        images: prod.images,
        sizes: prod.sizes,
        categoryId,
      };
    });

    // Insert products
    const insertedProducts = await Product.insertMany(productsWithCategoryId);
    console.log(`✅ Inserted ${insertedProducts.length} products`);

    console.log("🎉 Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
