import express from 'express';
const router = express.Router();

// Importing controllers
const {
  createSystemAdmin,
  loginSystemAdmin,
  refreshToken,
  logout,
  updateSystemAdmin,
  allSystemAdmins,
  createPharmacy,
  deletePharmacy,
} = require('../controllers/systemAdminController');

// Additional imports
const { authSystemAdmin: auth } = require('../middlewares/auth');

// CREATE ROUTES
router.post('/login', loginSystemAdmin);
router.post('/token', refreshToken);
router.post('/logout', auth, logout);
router.post('/createPharmacy', auth, createPharmacy);
router.post('/', auth, createSystemAdmin);

// READ ROUTES
router.get('/', auth, allSystemAdmins);

// UPDATE ROUTES
router.put('/', auth, updateSystemAdmin);

// DELETE ROUTES
router.delete('/deletePharmacy/:id', auth, deletePharmacy);

module.exports = router;
