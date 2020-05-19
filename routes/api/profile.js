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

//@route   GET api/profile/user/:user_id
//@desc    get user profile by id
//@access  public
router.get('/user/:user_id', async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.params.user_id
        }).populate('user', ['name', 'avatar']);
        if (!profile)
            return res.status(400).json({
                msg: "No profile matches"
            })
        res.json(profile)
    } catch (err) {
        console.error(err.message)
        if (err.kind == 'ObjectId')
            return res.status(400).json({
                msg: "No profile matches"
            })
        res.status(500).send("Server error (profile.js)")
    }
})

//@route   DELETE api/profile
//@desc    delete user,profile and posts
//@access  private
router.delete('/', auth, async (req, res) => {
    try {
        //@todo - remove posts

        //Remove profile
        await Profile.findOneAndRemove({
            user: req.user.id
        })
        //Remove user
        await User.findOneAndRemove({
            _id: req.user.id
        })
        res.json({
            msg: "User deleted"
        })
    } catch (err) {
        console.error(err.message)
        res.status(500).send("Server error (profile.js)")
    }
})

//@route   PUT api/profile/experience
//@desc    add profile experience
//@access  private
router.put('/experience', [auth, [
    check('title', 'Title is required').not().isEmpty(),
    check('company', 'Company Name is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty(),
]], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
    }
    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({
            user: req.user.id
        })
        await profile.experience.unshift(newExp)
        await profile.save()
        res.json(profile)
    } catch (err) {
        console.error(err.message)
        res.status(500).send("Server error (profile.js)")
    }
})

//@route   DELETE api/profile/experience/:exp_id
//@desc    delete experience in a profile
//@access  private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        })
        //get the index which should be removed
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);
        profile.experience.splice(removeIndex, 1)
        await profile.save()
        res.json(profile)
    } catch (err) {
        console.error(err.message)
        res.status(500).send("Server error (profile.js)")
    }
})


//@route   PUT api/profile/education
//@desc    add profile education
//@access  private
router.put('/education', [auth, [
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('fieldofstudy', 'Field of Study is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty(),
]], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        })
    }
    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body

    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    }

    try {
        const profile = await Profile.findOne({
            user: req.user.id
        })
        await profile.education.unshift(newEdu)
        await profile.save()
        res.json(profile)
    } catch (err) {
        console.error(err.message)
        res.status(500).send("Server error (profile.js)")
    }
})

//@route   DELETE api/profile/education/:edu_id
//@desc    delete education in a profile
//@access  private
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        })
        //get the index which should be removed
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);
        profile.education.splice(removeIndex, 1)
        await profile.save()
        res.json(profile)
    } catch (err) {
        console.error(err.message)
        res.status(500).send("Server error (profile.js)")
    }
})
module.exports = router;