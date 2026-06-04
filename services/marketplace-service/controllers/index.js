import Item from '../models/Item.js';

// GET all items
export const getItems = async (req, res) => {
  try {
    const { category, condition } = req.query;
    const filter = { status: 'available' };
    if (category) filter.category = category;
    if (condition) filter.condition = condition;
    const items = await Item.find(filter).sort({ createdAt: -1 });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch items.', error: error.message });
  }
};

// GET single item
export const getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    res.json({ item });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch item.', error: error.message });
  }
};

// POST create item listing
export const createItem = async (req, res) => {
  try {
    const { title, description, category, price, condition } = req.body;
    const sellerId = req.headers['x-user-id'];
    const sellerName = req.headers['x-user-name'];
    const sellerPhone = req.headers['x-user-phone'];


    console.log('[marketplace] Creating item:', { title, category, price, sellerId, sellerName, sellerPhone });
    console.log('[marketplace] Body:', req.body);
    console.log('[marketplace] Headers:', req.headers);

    const item = await Item.create({
      title, description, category,
      price, condition, sellerId, sellerName,sellerPhone
    });

    res.status(201).json({ message: 'Item listed successfully.', item });
  } catch (error) {
    console.error('[marketplace] Error creating item:', error.message);
    console.error('[marketplace] Full error:', error);
    res.status(500).json({ message: 'Failed to list item.', error: error.message });
  }
};

// GET my listings
export const getMyItems = async (req, res) => {
  try {
    const sellerId = req.headers['x-user-id'];
    const items = await Item.find({ sellerId }).sort({ createdAt: -1 });
    res.json({ items });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch your items.', error: error.message });
  }
};

// PATCH mark item as sold
export const markAsSold = async (req, res) => {
  try {
    const sellerId = req.headers['x-user-id'];
    const item = await Item.findOne({ _id: req.params.id, sellerId });
    if (!item) return res.status(404).json({ message: 'Item not found.' });

    item.status = 'sold';
    await item.save();

    res.json({ message: 'Item marked as sold.', item });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update item.', error: error.message });
  }
};

// DELETE remove listing
export const deleteItem = async (req, res) => {
  try {
    const sellerId = req.headers['x-user-id'];
    const item = await Item.findOneAndDelete({ _id: req.params.id, sellerId });
    if (!item) return res.status(404).json({ message: 'Item not found.' });

    res.json({ message: 'Item removed successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete item.', error: error.message });
  }
};