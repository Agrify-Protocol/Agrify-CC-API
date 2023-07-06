const orderModel = require("../models/order.model");

function generateUniqueRef(){
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters[randomIndex];
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