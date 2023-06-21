const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next){
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token,process.env.JWT_SECRET_KEY);
        req.userId = decodedToken.userId;
        next();
    } catch (error) {
        res.status(401).json({error: 'Invalid token!'});
    }
}

module.exports = authMiddleware;