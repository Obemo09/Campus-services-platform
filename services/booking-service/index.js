import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import bookingRoutes from './routes/index.js';
import Facility from './models/Facility.js';
import { connectRabbitMQ } from './utils/publisher.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Booking service is running.' });
});

app.use('/bookings', bookingRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.use((error, req, res, next) => {
  console.error('[booking-service] Error:', error);
  res.status(error.status || 500).json({
    message: error.message || 'Internal server error.',
  });
});

const seedFacilities = async () => {
  try {
    const count = await Facility.countDocuments();
    if (count > 0) {
      console.log('[booking-service] Facilities already seeded.');
      return;
    }

    const facilities = [
      { name: 'Computer Lab A', type: 'lab', capacity: 30, location: 'Block B, Floor 1', description: 'Main computer lab with 30 workstations and high-speed internet.' },
      { name: 'Computer Lab B', type: 'lab', capacity: 25, location: 'Block B, Floor 2', description: 'Secondary computer lab with programming software installed.' },
      { name: 'Computer Lab C', type: 'lab', capacity: 20, location: 'Block C, Floor 1', description: 'Specialized lab for graphics and design software.' },
      { name: 'Lecture Hall A', type: 'lecture_hall', capacity: 200, location: 'Block A, Floor 1', description: 'Main lecture hall with projector and audio system.' },
      { name: 'Lecture Hall B', type: 'lecture_hall', capacity: 150, location: 'Block A, Floor 2', description: 'Medium lecture hall with smart board.' },
      { name: 'Lecture Hall C', type: 'lecture_hall', capacity: 100, location: 'Block D, Floor 1', description: 'Seminar hall suitable for presentations and workshops.' },
      { name: 'Lecture Hall D', type: 'lecture_hall', capacity: 80, location: 'Block D, Floor 2', description: 'Small lecture hall ideal for tutorials and group sessions.' },
    ];

    await Facility.insertMany(facilities);
    console.log('[booking-service] Facilities seeded successfully.');
  } catch (error) {
    console.error('[booking-service] Failed to seed facilities:', error.message);
  }
};

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[booking-service] Connected to MongoDB.');
    await seedFacilities();
    await connectRabbitMQ();
    app.listen(PORT, () => {
      console.log('[booking-service] Listening on port ' + PORT);
    });
  } catch (error) {
    console.error('[booking-service] Failed to start:', error);
    process.exit(1);
  }
};

startServer();