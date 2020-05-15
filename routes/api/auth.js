const express = require('express')
const router = express.Router();
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


module.exports = router;