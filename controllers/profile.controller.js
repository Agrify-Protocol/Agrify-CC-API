const express = require('express');
const authMiddleware = require('../middleware/auth');
const User = require('../models/user.model');

const profile = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        res.json(user);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

module.exports = {
    profile
}