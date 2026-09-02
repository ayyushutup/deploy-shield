// src/login.js
const express = require('express');
const router = express.Router();
const { generateToken } = require('./auth');

// Demo credentials: admin / password123
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'password123') {
    const token = generateToken({ username });
    return res.json({ token });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

module.exports = router;
