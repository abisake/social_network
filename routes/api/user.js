const express = require('express')
const router = express.Router();
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
            });
            if (user) {
                res.status(400).json({
                    errors: [{
                        msg: "User already existing"
                    }]
                })
            } // check if user exists or not

            // get gravatar,i.e profile image

            //Encrypt the password

            //return jason web token 
            res.send("User route")
        } catch (err) {
            console.error(err.message)
            res.status(400).send("Server Error (user.js)")
        }
    }
)

module.exports = router;