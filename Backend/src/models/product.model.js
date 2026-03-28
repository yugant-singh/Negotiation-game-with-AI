import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String, 
    },

    listedPrice: {
      type: Number,
      required: true,
    },

    // Hidden — Sirf backend jaanta hai
    minimumPrice: {
      type: Number,
      required: true,
    },
    targetPrice: {
      type: Number,
      required: true,
    },
    personality: {
      type: String,
      enum: ["stubborn", "friendly", "desperate"],
      default: "friendly",
    },
  },
  { timestamps: true }
);

const productModel = mongoose.model("Product",productSchema)


export default productModel