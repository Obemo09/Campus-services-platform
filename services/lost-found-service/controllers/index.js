import LostFound from '../models/LostFound.js';

// GET all reports
export const getReports = async (req, res) => {
  try {
    const { type, category, status } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (category) filter.category = category;
    filter.status = status || 'open';
    const reports = await LostFound.find(filter).sort({ createdAt: -1 });
    res.json({ reports });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reports.', error: error.message });
  }
};

// GET my reports
export const getMyReports = async (req, res) => {
  try {
    const reporterId = req.headers['x-user-id'];
    const reports = await LostFound.find({ reporterId }).sort({ createdAt: -1 });
    res.json({ reports });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your reports.', error: error.message });
  }
};

// GET single report
export const getReport = async (req, res) => {
  try {
    const report = await LostFound.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found.' });
    res.json({ report });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch report.', error: error.message });
  }
};

// POST create report
export const createReport = async (req, res) => {
  try {
    const { type, title, description, category, location, date } = req.body;
    const reporterId = req.headers['x-user-id'];
    const reporterName = req.headers['x-user-name'];

    // Auto expire after 30 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const report = await LostFound.create({
      type, title, description, category,
      location, date, reporterId, reporterName, expiresAt,
    });

    res.status(201).json({ message: 'Report submitted successfully.', report });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit report.', error: error.message });
  }
};

// PATCH mark as resolved
export const resolveReport = async (req, res) => {
  try {
    const reporterId = req.headers['x-user-id'];
    const report = await LostFound.findOne({ _id: req.params.id, reporterId });
    if (!report) return res.status(404).json({ message: 'Report not found.' });

    report.status = 'resolved';
    await report.save();

    res.json({ message: 'Report marked as resolved.', report });
  } catch (error) {
    res.status(500).json({ message: 'Failed to resolve report.', error: error.message });
  }
};

// PATCH claim item
export const claimReport = async (req, res) => {
  try {
    const report = await LostFound.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found.' });
    if (report.status !== 'open') return res.status(400).json({ message: 'Report is no longer open.' });

    report.status = 'claimed';
    await report.save();

    res.json({ message: 'Item claimed successfully.', report });
  } catch (error) {
    res.status(500).json({ message: 'Failed to claim report.', error: error.message });
  }
};

// DELETE remove report
export const deleteReport = async (req, res) => {
  try {
    const reporterId = req.headers['x-user-id'];
    const report = await LostFound.findOneAndDelete({ _id: req.params.id, reporterId });
    if (!report) return res.status(404).json({ message: 'Report not found.' });

    res.json({ message: 'Report deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete report.', error: error.message });
  }
};