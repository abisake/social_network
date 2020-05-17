const express = require('express')
const router = express.Router();
const {
    check,
    validationResult
} = require('express-validator')


const auth = require('../../middleware/auth')
const Profile = require('../../models/Profile')
const User = require('../../models/User')

//@route   GET api/profile/me
//@desc    current user profile
//@access  private
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        }).populate('user', ['name', 'avatar'])

        if (!profile) {
            return res.status(400).json({
                msg: "No profile exists"
            })
        }
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Server error (profile.js)")
    }
})

//@route   POST api/profile
//@desc    create or update user profile 
//@access  private
router.post('/', [auth, [
        check('status', 'Status is required').not().isEmpty(),
        check('skills', 'Skills is required').not().isEmpty()
    ]],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            })
        }

        const {
            company,
            website,
            location,
            bio,
            status,
            githubusername,
            skills,
            youtube,
            facebook,
            twitter,
            instagram,
            linkedin,
        } = req.body

        //Build profile object
        const profileFields = {}
        profileFields.user = req.user.id //storing user id in profileFields.user
        if (company) profileFields.company = company
        if (website) profileFields.website = website
        if (location) profileFields.location = location
        if (bio) profileFields.bio = bio
        if (status) profileFields.status = status
        if (githubusername) profileFields.githubusername = githubusername
        if (skills) {
            profileFields.skills = skills.split(',').map(skill => skill.trim())
        }
        //build social object
        profileFields.social = {}
        if (youtube) profileFields.social.youtube = youtube
        if (facebook) profileFields.social.facebook = facebook
        if (twitter) profileFields.social.twitter = twitter
        if (instagram) profileFields.social.instagram = instagram
        if (linkedin) profileFields.social.linkedin = linkedin

        try {
            let profile = await Profile.findOne({
                user: req.user.id
            })

            if (profile) {
                profile = await Profile.findOneAndUpdate( //updating an existing user
                    {
                        user: req.user.id
                    }, {
                        $set: profileFields
                    }, {
                        new: true
                    }
                )

                return res.json(profile)
            }
            //creating an user profile
            profile = new Profile(profileFields)

            await profile.save();
            res.json(profile)
        } catch (err) {
            console.error(err.message)
            res.send(500).send("Server error (profile.js)")

        }
    }
)

//@route   GET api/profile
//@desc    all user profile 
//@access  public
router.get('/', async (req, res) => {
    try {
        const profiles = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profiles)
    } catch (err) {
        console.error(err.message)
        res.status(500).send("Server error (profile.js)")
    }
})


module.exports = router;