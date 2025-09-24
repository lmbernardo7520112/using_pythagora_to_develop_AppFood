const express = require('express');
const UserService = require('../services/userService.js');
const { authenticate, requireUser } = require('./middlewares/auth.js'); // ✅ corrigido
const User = require('../models/User.js');
const { generateAccessToken, generateRefreshToken } = require('../utils/auth.js');
const jwt = require('jsonwebtoken');
const { ALL_ROLES } = require('../../shared/config/roles.js');

const router = express.Router();

// LOGIN
router.post('/login', async (req, res) => {
  const sendError = msg => res.status(400).json({ message: msg });
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError('Email and password are required');
  }

  const user = await UserService.authenticateWithPassword(email, password);

  if (user) {
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    return res.json({
      ...user.toObject(),
      accessToken,
      refreshToken
    });
  } else {
    return sendError('Email or password is incorrect');
  }
});

// REGISTER
router.post('/register', async (req, res) => {
  if (req.user) {
    return res.json({ user: req.user });
  }
  try {
    const user = await UserService.create(req.body);
    return res.status(200).json(user);
  } catch (error) {
    console.error(`Error while registering user: ${error}`);
    return res.status(400).json({ error });
  }
});

// LOGOUT
router.post('/logout', async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (user) {
    user.refreshToken = null;
    await user.save();
  }

  res.status(200).json({ message: 'User logged out successfully.' });
});

// REFRESH TOKEN
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({
      success: false,
      message: 'Refresh token is required'
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await UserService.get(decoded.sub);

    if (!user) {
      return res.status(403).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.refreshToken !== refreshToken) {
      return res.status(403).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        ...user.toObject(),
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    console.error(`Token refresh error: ${error.message}`);

    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        message: 'Refresh token has expired'
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
});

// CURRENT USER
router.get('/me', authenticate, requireUser(ALL_ROLES), async (req, res) => {
  return res.status(200).json(req.user);
});

module.exports = router;

