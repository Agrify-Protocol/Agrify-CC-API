const express = require('express');
const {createOrder, payStripe} = require('../controllers/order.controller');

const router = express.Router();
router.post('/orders', createOrder);
router.post('/pay/stripe', payStripe);

module.exports = router;