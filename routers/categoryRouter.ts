import express from 'express';
const router = express.Router();

// Importing controllers
const { seeCategories } = require('../controllers/categoryController');

// READ ROUTES
router.get('/', seeCategories);

module.exports = router;
