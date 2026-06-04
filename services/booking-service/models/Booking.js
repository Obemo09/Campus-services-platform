import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  facilityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  duration: { type: Number, required: true },
  numberOfPeople: { type: Number, required: true },
  purpose: { type: String, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);