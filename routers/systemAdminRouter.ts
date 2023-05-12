import express from 'express';
const router = express.Router();

// Importing controllers
const {
  createSystemAdmin,
  loginSystemAdmin,
  refreshToken,
  logout,
  deleteSystemAdmin,
  createPharmacy,
} = require('../controllers/systemAdminController');

// Additional imports
const { authSystemAdmin: auth } = require('../middlewares/auth');

// CREATE ROUTES
router.post('/login', loginSystemAdmin);
router.post('/token', refreshToken);
router.post('/logout', auth, logout);
router.post('/pharmacy', auth, createPharmacy);
router.post('/', auth, createSystemAdmin);

// READ ROUTES

// UPDATE ROUTES

// DELETE ROUTES
router.delete('/:id', auth, deleteSystemAdmin);

module.exports = router;
