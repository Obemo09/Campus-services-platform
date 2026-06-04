import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import serviceRoutes from './routes/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Marketplace Service is running.' });
});

app.use('/marketplace', serviceRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.use((error, req, res, next) => {
  console.error('[marketplace-service] Error:', error);
  res.status(error.status || 500).json({
    message: error.message || 'Internal server error.',
  });
});

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('[marketplace-service] Connected to MongoDB.');

    app.listen(PORT, () => {
      console.log('[marketplace-service] Listening on port ' + PORT);
    });
  } catch (error) {
    console.error('[marketplace-service] Failed to start:', error);
    process.exit(1);
  }
};

startServer();
