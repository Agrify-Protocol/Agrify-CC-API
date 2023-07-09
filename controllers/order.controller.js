const orderModel = require("../models/order.model");
const projectModel = require('../models/project.model');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
        const {certificateInfo, orderItems, total, cardInfo} = req.body;
        // create token
        const token = await createToken(cardInfo);
        if(token.error) {
            res.status(500).json({token});
        }

        if(!token.id) {
            return res.status(500).json({
                "message": "Payment Failed"
            });
        }
        const charge = await createCharge(token.id, total * 100);
    // console.log(charge);
        if(charge.status === "succeeded"){
            // return res.status(200).json({message: 'Payment Successful'});
            const order = await orderModel.create({certificateInfo, orderReferenceId, orderItems, total});
            orderItems.forEach(async (item) => {
                // const {project, quantity} = item;
                const p = await projectModel.findOne({_id: item.project});
                p.availableTonnes -= item.quantity;
                const updatedProject = await p.save();
                // project.availableTonnes = project.availableTonnes - item.quantity;
                // await project.save();
            });
            res.status(201).json(order);
        }
    } catch (error) {
        res.status(500).json({
            error
        });
        console.log(error);
    }
}

const payStripe = async (req, res) => {
    
    const {cardInfo, amount} = req.body;
    const token = await createToken(cardInfo);
    // res.json({token});
    if(token.error) {
        res.status(500).json({token});
    }

    if(!token.id) {
        return res.status(500).json({
            "message": "Payment Failed"
        });
    }

    const charge = await createCharge(token.id, amount * 100);
    // console.log(charge);
    if(charge.status === "succeeded"){
        return res.status(200).json({message: 'Payment Successful'});
    }
}

const createToken = async (cardInfo) => {
    let token = {};
    try {
        token = await stripe.tokens.create({
            card: {
                number: cardInfo.number,
                exp_month: cardInfo.exp_month,
                exp_year: cardInfo.exp_year,
                cvc: cardInfo.cvc,
            }
        });
    } catch (error) {
        switch (error.type) {
            case 'StripeCardError':
                token.error = error.message;
                break;
            default:
                token.error = error.message;
                break;
        }
    }
    return token;
}

const createCharge = async (tokenId, amount) => {
    let charge = {};
    try {
        charge = await stripe.charges.create({
            amount: amount,
            currency: 'usd',
            source: tokenId,
            description: 'Payment for Carbon Credits'
        });
    } catch (error) {
        charge.error = error.message;
    };
    return charge;
}

module.exports = {createOrder, payStripe};