import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './models/User.js';
import authRoutes from './routes/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Auth service is running.' });
});

app.use('/auth', authRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.use((error, req, res, next) => {
  console.error('[auth-service] Error:', error);
  res.status(error.status || 500).json({
    message: error.message || 'Internal server error.',
  });
});

const seedAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@campus.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
  console.log(`[auth-service] Checking for admin account: ${adminEmail}`);
  const existing = await User.findOne({ email: adminEmail });
  if (!existing) {
    const hashed = await bcrypt.hash(adminPassword, 10);
    await User.create({ name: 'Campus Admin', email: adminEmail, password: hashed, phone: '', role: 'admin' });
    console.log('[auth-service] ✅ Admin account created!');
  } else if (existing.role !== 'admin') {
    existing.role = 'admin';
    await existing.save();
    console.log('[auth-service] ✅ Admin role updated!');
  } else {
    console.log('[auth-service] ✅ Admin already exists.');
  }
};

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[auth-service] Connected to MongoDB.');
    await seedAdmin();
    app.listen(PORT, () => {
      console.log(`[auth-service] Listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('[auth-service] Failed to start:', error.message);
    process.exit(1);
  }
};

startServer();