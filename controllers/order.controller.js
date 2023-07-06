const orderModel = require("../models/order.model");

function generateUniqueRef(){
    const digits = '0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * digits.length);
        code += digits[randomIndex];
    }
    return code;
}
const createOrder = async (req, res) => {
    try {
        const orderReferenceId = generateUniqueRef();
        const {certificateInfo} = req.body;
        const order = await orderModel.create({certificateInfo, orderReferenceId});
        res.status(201).json(order);
    } catch (error) {
        console.log(error);
    }
}

module.exports = {createOrder};