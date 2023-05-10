import express from 'express';
const router = express.Router();

// Importing controllers
const {
  createSystemAdmin,
  loginSystemAdmin,
} = require('../controllers/systemAdminController');

// Additional imports
const { authSystemAdmin } = require('../middlewares/auth');

// CREATE ROUTES
router.post('/login', loginSystemAdmin);
router.post('/', authSystemAdmin, createSystemAdmin);

// READ ROUTES

// UPDATE ROUTES

// DELETE ROUTES

module.exports = router;
