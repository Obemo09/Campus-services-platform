import mongoose from 'mongoose';

const lostFoundSchema = new mongoose.Schema({
  type: { type: String, enum: ['lost', 'found'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['electronics', 'clothing', 'documents', 'accessories', 'books', 'other'],
    required: true
  },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  reporterId: { type: String, required: true },
  reporterName: { type: String, required: true },
  status: { type: String, enum: ['open', 'claimed', 'resolved'], default: 'open' },
  expiresAt: { type: Date },
}, { timestamps: true });

export default mongoose.model('LostFound', lostFoundSchema);