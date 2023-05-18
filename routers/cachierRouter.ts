import express from 'express';
const router = express.Router();

// Importing controllers
const {
  loginCachier,
  refreshToken,
  logout,
} = require('../controllers/cachierController');

// Addiional imports
const { authCachier: auth } = require('../middlewares/auth');

// CREATE ROUTES
router.post('/login', loginCachier);
router.post('/token', refreshToken);
router.post('/logout', auth, logout);

// READ ROUTES

// UPDATE ROUTES

// DELETE ROUTES

module.exports = router;
