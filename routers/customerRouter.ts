import express from 'express';
const router = express.Router();

// Importing controllers
const {
  createCustomer,
  loginCustomer,
  reserveProduct,
  logoutCustomer,
  refreshToken,
} = require('../controllers/customerController');

// Addiional imports
const { authCustomer: auth } = require('../middlewares/auth');

// CREATE ROUTES
router.post('/login', loginCustomer);
router.post('/reserve', auth, reserveProduct);
router.post('/logout', auth, logoutCustomer);
router.post('/token', refreshToken);
router.post('/', createCustomer);

// READ ROUTES

// UPDATE ROUTES

// DELETE ROUTES

module.exports = router;
