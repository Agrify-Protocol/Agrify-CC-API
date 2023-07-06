const orderModel = require("../models/order.model");

const createOrder = async (req, res) => {
    try {
        const {certificateInfo} = req.body;
        const order = await orderModel.create({certificateInfo});
        res.status(201).json(order);
    } catch (error) {
        console.log(error);
    }
}

module.exports = {createOrder};