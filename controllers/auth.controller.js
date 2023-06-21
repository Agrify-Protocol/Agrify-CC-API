const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');


const register = async (req, res) => {
    try {
        const {firstname, lastname, email, password} = req.body;
        
        // hash password
        const hashPassword = await bcrypt.hash(password, 10);
        const user = new User({
            firstname,
            lastname,
            email,
            password: hashPassword
        });
        await user.save();
        res.status(201).json({message: 'User account created!'});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

const login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await User.findOne({email});

        if(!user){
            return res.status(401).json({error: 'Invalid credentials!'});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid){
            return res.status(401).json({error: 'Invalid credentials!'});
        }

        const token = jwt.sign({userId: user._id}, 'x-secret-key');
        res.json({
            user,
            token
        });
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}
module.exports = {
    register,
    login
};