import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const signToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // ==========================================================
    // 🛡️ GOOGLE-STANDARD & TELECOM STRICT VALIDATION LAYER 
    // ==========================================================
    
    // 1. Validate Username/Name (Must be letters/spaces, at least 3 chars long)
    const nameRegex = /^[a-zA-Z\s]{3,50}$/;
    if (!name || !nameRegex.test(name.trim())) {
      return res.status(400).json({ message: 'Name must be at least 3 characters long and contain only letters and spaces.' });
    }

    // 2. Validate Email Structure & Length (Google Standard Whitelist)
    if (!email || !email.includes('@')) {
      return res.status(400).json({ message: 'A valid email address is required.' });
    }
    
    const localPart = email.split('@')[0];
    
    // Google Length Rule: Local username part must be between 6 and 30 characters
    if (localPart.length < 6 || localPart.length > 30) {
      return res.status(400).json({ message: 'The username part of your email must be between 6 and 30 characters long.' });
    }

    // Google Character Rule Whitelist: Only letters, numbers, and periods are allowed.
    const googleEmailRegex = /^[a-zA-Z0-9.]+$/;
    if (!googleEmailRegex.test(localPart)) {
      return res.status(400).json({ message: 'Only letters (a-z), numbers (0-9), and periods (.) are allowed in the email username.' });
    }

    // Google Rule: Must contain at least one letter (cannot be purely numeric numbers like 123456)
    const hasLetterRegex = /[a-zA-Z]/;
    if (!hasLetterRegex.test(localPart)) {
      return res.status(400).json({ message: 'The email username must contain at least one letter (a-z). It cannot be fully numerical.' });
    }

    // Google Period Placement Rules: Cannot start/end with a period, and no consecutive double periods
    if (localPart.startsWith('.') || localPart.endsWith('.') || localPart.includes('..')) {
      return res.status(400).json({ message: 'Periods (.) cannot be placed at the start, end, or consecutively in the email address.' });
    }

    // 3. Validate Password (Must be at least 6 characters, no negative/division signs at the start)
    if (!password || password.length < 6 || password.startsWith('-') || password.startsWith('/')) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long and cannot begin with negative or mathematical symbols.' });
    }

    // 4. Validate Phone Number (Strict Telecom Carrier & Exact Length Verification)
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required.' });
    }

    // Strip any potential country codes like +237 or 237 to evaluate the core 9-digit mobile number
    let cleanPhone = phone.trim().replace(/^\+237|^237/, '');

    // Strictly match legitimate prefixes AND enforce EXACTLY 9 digits total using string length + anchored regex
    const regionalPhoneRegex = /^(620|65[0-9]|66[0-9]|67[0-9]|68[0-9]|69[0-9])[0-9]{6}$/;
    
    if (cleanPhone.length !== 9 || !regionalPhoneRegex.test(cleanPhone)) {
      return res.status(400).json({ message: 'Please provide a valid, exact 9-digit mobile phone number starting with a legitimate carrier prefix (e.g., 67x, 69x, 65x).' });
    }
    // ==========================================================

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered.' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, phone: cleanPhone, role: 'student' });
    const token = signToken(user);

    res.status(201).json({
      message: 'User registered successfully.',
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials.' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials.' });

    const token = signToken(user);

    return res.json({
      message: 'Login successful.',
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};

export const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    return res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.', error: error.message });
  }
};
