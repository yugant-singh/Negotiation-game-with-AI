import mongoose from 'mongoose'
import dotenv from 'dotenv'
import productModel from '../models/product.model.js'
import {products} from '../data/products.js'

dotenv.config()

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("MongoDB connected for seeding")

    await productModel.deleteMany({})
    console.log("Old products cleared")

    await productModel.insertMany(products)
    console.log(`${products.length} products seeded successfully`)

    process.exit(0)
  } catch (err) {
    console.error("Seeding failed:", err.message)
    process.exit(1)
  }
}

seedDB()