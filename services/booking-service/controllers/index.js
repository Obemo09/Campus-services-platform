import Booking from '../models/Booking.js';
import Facility from '../models/Facility.js';
import { publishEvent } from '../utils/publisher.js';

export const getFacilities = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type, isAvailable: true } : { isAvailable: true };
    const facilities = await Facility.find(filter);
    res.json({ facilities });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch facilities.', error: error.message });
  }
};

export const createFacility = async (req, res) => {
  try {
    const role = req.headers['x-user-role'];
    if (role !== 'admin') return res.status(403).json({ message: 'Only admins can create facilities.' });
    const { name, type, capacity, location, description } = req.body;
    const facility = await Facility.create({ name, type, capacity, location, description });
    res.status(201).json({ message: 'Facility created.', facility });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create facility.', error: error.message });
  }
};

export const updateFacility = async (req, res) => {
  try {
    const role = req.headers['x-user-role'];
    if (role !== 'admin') return res.status(403).json({ message: 'Only admins can edit facilities.' });
    const { name, type, capacity, location, description, isAvailable } = req.body;
    const facility = await Facility.findByIdAndUpdate(
      req.params.id,
      { name, type, capacity, location, description, isAvailable },
      { new: true }
    );
    if (!facility) return res.status(404).json({ message: 'Facility not found.' });
    res.json({ message: 'Facility updated.', facility });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update facility.', error: error.message });
  }
};

export const deleteFacility = async (req, res) => {
  try {
    const role = req.headers['x-user-role'];
    if (role !== 'admin') return res.status(403).json({ message: 'Only admins can delete facilities.' });
    const facility = await Facility.findByIdAndDelete(req.params.id);
    if (!facility) return res.status(404).json({ message: 'Facility not found.' });
    res.json({ message: 'Facility deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete facility.', error: error.message });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const bookings = await Booking.find({ userId }).populate('facilityId').sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings.', error: error.message });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const role = req.headers['x-user-role'];
    if (role !== 'admin') return res.status(403).json({ message: 'Only admins can view all bookings.' });
    const bookings = await Booking.find().populate('facilityId').sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch bookings.', error: error.message });
  }
};

export const createBooking = async (req, res) => {
  try {
    const { facilityId, date, startTime, duration, numberOfPeople, purpose } = req.body;
    const userId = req.headers['x-user-id'];
    const userName = req.headers['x-user-name'];

    const facility = await Facility.findById(facilityId);
    if (!facility) return res.status(404).json({ message: 'Facility not found.' });

    if (numberOfPeople > facility.capacity) {
      return res.status(400).json({ message: `Number of people exceeds facility capacity of ${facility.capacity}.` });
    }

    const conflict = await Booking.findOne({
      facilityId, date: new Date(date), startTime,
      status: { $in: ['pending', 'confirmed'] },
    });
    if (conflict) return res.status(409).json({ message: 'Facility already booked at this time.' });

    const booking = await Booking.create({
      facilityId, userId, userName, date, startTime,
      duration, numberOfPeople, purpose, status: 'pending',
    });

    res.status(201).json({ message: 'Booking request submitted! Awaiting admin approval.', booking });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create booking.', error: error.message });
  }
};

export const confirmBooking = async (req, res) => {
  try {
    const role = req.headers['x-user-role'];
    if (role !== 'admin') return res.status(403).json({ message: 'Only admins can confirm bookings.' });

    const booking = await Booking.findById(req.params.id).populate('facilityId');
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    booking.status = 'confirmed';
    await booking.save();

    publishEvent('BookingConfirmed', {
      bookingId: booking._id,
      userId: booking.userId,
      userName: booking.userName,
      facility: booking.facilityId?.name,
      date: booking.date,
      startTime: booking.startTime,
    });

    res.json({ message: 'Booking confirmed.', booking });
  } catch (error) {
    res.status(500).json({ message: 'Failed to confirm booking.', error: error.message });
  }
};

export const rejectBooking = async (req, res) => {
  try {
    const role = req.headers['x-user-role'];
    if (role !== 'admin') return res.status(403).json({ message: 'Only admins can reject bookings.' });

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    booking.status = 'rejected';
    await booking.save();

    res.json({ message: 'Booking rejected.', booking });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reject booking.', error: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];

    const booking = await Booking.findOne({ _id: id, userId });
    if (!booking) return res.status(404).json({ message: 'Booking not found.' });
    if (booking.status === 'confirmed') return res.status(400).json({ message: 'Cannot cancel a confirmed booking. Contact admin.' });

    booking.status = 'cancelled';
    await booking.save();

    res.json({ message: 'Booking cancelled.', booking });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel booking.', error: error.message });
  }
};