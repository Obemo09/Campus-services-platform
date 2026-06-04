import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['textbooks', 'electronics', 'clothing', 'furniture', 'stationery', 'other'],
    required: true
  },
  price: { type: Number, required: true },
  condition: {
    type: String,
    enum: ['new', 'like_new', 'good', 'fair'],
    required: true
  },
  sellerId: { type: String, required: true },
  sellerName: { type: String, required: true },
  sellerPhone: { type: String, required: true },
  status: { type: String, enum: ['available', 'sold', 'reserved'], default: 'available' },
}, { timestamps: true });

export default mongoose.model('Item', itemSchema);