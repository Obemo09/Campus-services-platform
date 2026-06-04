import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['academic', 'sports', 'cultural', 'social', 'career'], 
    required: true 
  },
  location: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  capacity: { type: Number, required: true },
  organizerId: { type: String, required: true },
  organizerName: { type: String, required: true },
  attendees: [{ userId: String, userName: String }],
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);