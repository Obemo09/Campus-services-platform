import mongoose from 'mongoose';

const rideSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  date: { type: Date, required: true },
  departureTime: { type: String, required: true },
  availableSeats: { type: Number, required: true },
  pricePerSeat: { type: Number, required: true },
  driverId: { type: String, required: true },
  driverName: { type: String, required: true },
  driverPhone: { type: String, default: '' },
  passengers: [{ 
    userId: String, 
    userName: String,
    userPhone: String,
  }],
  status: { type: String, enum: ['open', 'full', 'completed', 'cancelled'], default: 'open' },
  notes: { type: String },
}, { timestamps: true });

export default mongoose.model('Ride', rideSchema);