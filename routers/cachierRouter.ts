import express from 'express';
const router = express.Router();

// Importing controllers
const {
  loginCachier,
  refreshToken,
  logout,
  updateCredentiatls,
  deleteAccount,
} = require('../controllers/cachierController');

// Addiional imports
const { authCachier: auth } = require('../middlewares/auth');

// CREATE ROUTES
router.post('/login', loginCachier);
router.post('/token', refreshToken);
router.post('/logout', auth, logout);

// READ ROUTES

// UPDATE ROUTES
router.put('/', auth, updateCredentiatls);

// DELETE ROUTES
router.delete('/', auth, deleteAccount);

module.exports = router;
