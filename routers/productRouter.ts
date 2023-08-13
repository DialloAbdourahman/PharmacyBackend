import express from 'express';
const router = express.Router();

// Importing controllers
const {
  getProducts,
  searchProduct,
} = require('../controllers/productController');

// CREATE ROUTES

// READ ROUTES
router.get('/search', searchProduct);
router.get('/', getProducts);

// UPDATE ROUTES

// DELETE ROUTES

module.exports = router;
