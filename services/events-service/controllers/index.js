import Event from '../models/Event.js';
import { publishEvent } from '../utils/publisher.js';

// GET all events
export const getEvents = async (req, res) => {
  try {
    const { category, status } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    else filter.status = 'upcoming';
    const events = await Event.find(filter).sort({ date: 1 });
    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch events.', error: error.message });
  }
};

// GET my events
export const getMyEvents = async (req, res) => {
  try {
    const organizerId = req.headers['x-user-id'];
    const events = await Event.find({ organizerId }).sort({ date: 1 });
    res.json({ events });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your events.', error: error.message });
  }
};

// GET single event
export const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json({ event });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch event.', error: error.message });
  }
};

// POST create event
export const createEvent = async (req, res) => {
  try {
    const { title, description, category, location, date, startTime, endTime, capacity } = req.body;
    const organizerId = req.headers['x-user-id'];
    const organizerName = req.headers['x-user-name'];

    const event = await Event.create({
      title, description, category, location,
      date, startTime, endTime, capacity,
      organizerId, organizerName,
    });

    publishEvent('EventCreated', {
      eventId: event._id,
      title: event.title,
      date: event.date,
      location: event.location,
      organizerName: event.organizerName,
    });

    res.status(201).json({ message: 'Event created successfully.', event });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create event.', error: error.message });
  }
};

// POST RSVP to event
export const rsvpEvent = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const userName = req.headers['x-user-name'];

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    // Check if already RSVP'd
    const alreadyRsvp = event.attendees.find(a => a.userId === userId);
    if (alreadyRsvp) return res.status(409).json({ message: 'Already RSVP\'d to this event.' });

    // Check capacity
    if (event.attendees.length >= event.capacity) {
      return res.status(400).json({ message: 'Event is full.' });
    }

    event.attendees.push({ userId, userName });
    await event.save();

    res.json({ message: 'RSVP successful.', attendees: event.attendees.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to RSVP.', error: error.message });
  }
};

// DELETE cancel RSVP
export const cancelRsvp = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });

    event.attendees = event.attendees.filter(a => a.userId !== userId);
    await event.save();

    res.json({ message: 'RSVP cancelled.', attendees: event.attendees.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel RSVP.', error: error.message });
  }
};

// DELETE cancel event (organizer only)
export const cancelEvent = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    if (event.organizerId !== userId) return res.status(403).json({ message: 'Not authorized.' });

    event.status = 'cancelled';
    await event.save();

    res.json({ message: 'Event cancelled.', event });
  } catch (error) {
    res.status(500).json({ message: 'Failed to cancel event.', error: error.message });
  }
};