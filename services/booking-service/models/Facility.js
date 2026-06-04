import mongoose from 'mongoose';

const facilitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['lab', 'lecture_hall'], required: true },
  capacity: { type: Number, required: true },
  location: { type: String, required: true },
  description: { type: String },
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('Facility', facilitySchema);