import express from 'express';
const router = express.Router();

// Importing controllers
const { getProducts } = require('../controllers/productController');

// CREATE ROUTES

// READ ROUTES
router.get('/', getProducts);

// UPDATE ROUTES

// DELETE ROUTES

module.exports = router;
