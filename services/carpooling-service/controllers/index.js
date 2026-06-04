import Ride from '../models/Ride.js';

export const getRides = async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = { status: 'open' };
    if (from) filter.from = new RegExp(from, 'i');
    if (to) filter.to = new RegExp(to, 'i');
    const rides = await Ride.find(filter).sort({ date: 1 });
    res.json({ rides });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch rides.', error: error.message });
  }
};

export const getRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: 'Ride not found.' });
    res.json({ ride });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch ride.', error: error.message });
  }
};

export const createRide = async (req, res) => {
  try {
    const { from, to, date, departureTime, availableSeats, pricePerSeat, notes } = req.body;
    const driverId = req.headers['x-user-id'];
    const driverName = req.headers['x-user-name'];
    const driverPhone = req.headers['x-user-phone'];
    const ride = await Ride.create({
      from, to, date, departureTime,
      availableSeats, pricePerSeat,
      driverId, driverName, driverPhone, notes,
    });
    res.status(201).json({ message: 'Ride created successfully.', ride });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create ride.', error: error.message });
  }
};

export const joinRide = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const userName = req.headers['x-user-name'];
    const userPhone = req.headers['x-user-phone'];

    // Check if user has already joined another open ride
    const alreadyInRide = await Ride.findOne({
      'passengers.userId': userId,
      status: { $in: ['open', 'full'] }
    });
    if (alreadyInRide) {
      return res.status(409).json({ message: 'You have already joined a ride. Leave it first before joining another.' });
    }

    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: 'Ride not found.' });
    if (ride.status !== 'open') return res.status(400).json({ message: 'Ride is no longer open.' });
    if (ride.driverId === userId) return res.status(400).json({ message: 'You cannot join your own ride.' });

    const alreadyJoined = ride.passengers.find(p => p.userId === userId);
    if (alreadyJoined) return res.status(409).json({ message: 'Already joined this ride.' });

    if (ride.passengers.length >= ride.availableSeats) {
      return res.status(400).json({ message: 'Ride is full.' });
    }

    ride.passengers.push({ userId, userName, userPhone });
    if (ride.passengers.length >= ride.availableSeats) ride.status = 'full';
    await ride.save();

    res.json({ message: 'Joined ride successfully.', passengers: ride.passengers.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to join ride.', error: error.message });
  }
};

export const leaveRide = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: 'Ride not found.' });

    const isPassenger = ride.passengers.find(p => p.userId === userId);
    if (!isPassenger) return res.status(400).json({ message: 'You are not a passenger on this ride.' });

    ride.passengers = ride.passengers.filter(p => p.userId !== userId);
    if (ride.status === 'full') ride.status = 'open';
    await ride.save();

    res.json({ message: 'Left ride successfully.', passengers: ride.passengers.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to leave ride.', error: error.message });
  }
};

export const cancelRide = async (req, res) => {
  try {
    const driverId = req.headers['x-user-id'];
    const ride = await Ride.findOne({ _id: req.params.id, driverId });
    if (!ride) return res.status(404).json({ message: 'Ride not found or not authorized.' });
    ride.status = 'cancelled';
    await ride.save();
    res.json({ message: 'Ride cancelled.', ride });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel ride.', error: error.message });
  }
};

export const getMyRides = async (req, res) => {
  try {
    const driverId = req.headers['x-user-id'];
    const rides = await Ride.find({ driverId }).sort({ date: 1 });
    res.json({ rides });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your rides.', error: error.message });
  }
};

export const getJoinedRides = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const rides = await Ride.find({
      'passengers.userId': userId,
      status: { $in: ['open', 'full'] }
    }).sort({ date: 1 });
    res.json({ rides });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch joined rides.', error: error.message });
  }
};