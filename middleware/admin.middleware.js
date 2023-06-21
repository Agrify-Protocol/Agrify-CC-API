const User = require('../models/user.model');

async function adminMiddleware(req, res, next) {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        if(!user.isAdmin){
            return res.status(403).json({error: 'Access Denied!'});
        }
        next();
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}
module.exports = adminMiddleware;