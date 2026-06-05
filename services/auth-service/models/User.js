import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
    // Do NOT add unique: true here so students with the same name can register!
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, // 100% Blocks duplicate emails
    lowercase: true, 
    trim: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  phone: { 
    type: String, 
    required: true, // Make it required so they can't leave it blank
    unique: true,   // 100% Blocks duplicate carrier phone numbers
    trim: true 
  },
  role: { 
    type: String, 
    enum: ['student', 'admin'], 
    default: 'student' 
  },
}, { timestamps: true });

export default mongoose.model('User', userSchema);