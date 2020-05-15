const jwt = require('jsonwebtoken')
const config = require('config')

module.exports = (req, res, next) => {
    //get token from header
    const token = req.header('x-auth-token');

    //check whether there is token are not
    if (!token) {
        return res.status(401).json({
            msg: "No token,Authorization denied"
        })
    }

    //verify the token
    try {
        //decode the token,verifying with secret message
        const decoded = jwt.verify(token, config.get('jwtSecret'))
        //assign the requested user's value with decoded value
        req.user = decoded.user
        next();
    } catch (err) {
        res.status(401).json({
            msg: "Token is not valid"
        })

    }
}