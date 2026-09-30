const express = require('express');
const squareController = require('../controllers/squareController');

const router = express.Router();

router.get('/', squareController.showForm);
router.post('/calculate', squareController.calculateSquare);

module.exports = router;
