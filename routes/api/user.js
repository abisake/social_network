const express = require('express')
const router = express.Router();
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const {
    check,
    validationResult
} = require('express-validator')

const User = require('../../models/User')


//@route   POST api/user
//@desc    Register route
//@access  public
router.post('/', [
        check('name', 'Name is required').not().isEmpty(), //name validation
        check('email', 'Please enter a valid email').isEmail(), //email validation
        check('password', 'Please enter a password with minimum 8 characters').isLength({
            min: 8
        }) //password validation with min length.
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            })
        }
        const {
            name,
            email,
            password
        } = req.body; //destructing or pulling name,email,password values from the req.body
        try {
            let user = await User.findOne({
                email: email
            }); //mongodb query by searching email using findOne
            if (user) {
                return res.status(400).json({
                    errors: [{
                        msg: "User already existing"
                    }]
                })
            } // check if user exists or not

            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm'
            }) // get gravatar,i.e profile image

            user = new User({
                name,
                email,
                avatar,
                password
            }) // creates an instance of user,which arguments should be passed.

            const salt = await bcrypt.genSalt(10); // level of encryption

            user.password = await bcrypt.hash(password, salt) //Encrypt the password

            await user.save() // saving encrypted password and user details.

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