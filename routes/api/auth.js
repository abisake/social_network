const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const {
    check,
    validationResult
} = require('express-validator')

const auth = require('../../middleware/auth')
const User = require('../../models/User')

//@route   GET api/auth
//@desc    Test route
//@access  public
router.get('/', auth, async (req, res) => { // adding the middleware in the request
    try {
        const user = await User.findById(req.user.id).select([
            '-password',
            '-_id'
        ])
        res.json(user)
    } catch (err) {
        res.status(500).send('Server error')
    }
})

//@route   POST api/auth
//@desc    Authenticate user & get token
//@access  public
router.post('/', [
        check('email', 'Email is required').isEmail(), //email validation
        check('password', 'Password is required').exists() //password validation 
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            })
        }
        const {
            email,
            password
        } = req.body
        try {
            let user = await User.findOne({
                email
            }); //mongodb query by searching email using findOne
            if (!user) {
                return res.status(400).json({
                    errors: [{
                        msg: "Invalid credentials"
                    }]
                })
            } // check if user exists or not

            const isMatch = await bcrypt.compare(password, user.password)

            if (!isMatch) {
                return res.status(400).json({
                    errors: [{
                        msg: "Invalid credentials"
                    }]
                })
            }

            const payload = {
                user: {
                    id: user.id //mongoose abstraction
                }
            }
            jwt.sign(payload, config.get('jwtSecret'), {
                    expiresIn: 360000
                },
                (err, token) => { //callback function
                    if (err) throw err;
                    res.json({
                        token
                    })
                })

            //return jason web token 
        } catch (err) {
            console.error(err.message)
            res.status(400).send("Server Error (user.js)")
        }
    }
)

module.exports = router;