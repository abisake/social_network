const express = require('express')
const router = express.Router();
const {
    check,
    validationResult
} = require('express-validator')


const auth = require('../../middleware/auth')
const Post = require('../../models/Posts')
const Profile = require('../../models/Profile')
const User = require('../../models/User')

//@route   post api/posts
//@desc    create a post
//@access  private
router.post('/', [auth, [
    check('text', 'Text is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
        return res.status(400).json({
            errors: errors.array()
        })
    try {
        const user = await User.findById(req.user.id).select('-password') //mongodb query
        const newPost = new Post({
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        })
        const post = await newPost.save() // saving in a variable,for returning to post to frontend as request

        res.json(post);
    } catch (err) {
        console.error(err.message)
        res.status(400).json({
            msg: "Server error(post.js)"
        })
    }
})


//@route   post api/posts
//@desc    get all the post
//@access  private
router.get('/', auth, async (req, res) => {
    try {
        const posts = await Post.find().sort({
            date: -1
        })
        res.json(posts)
    } catch (err) {
        console.error(err.message)
        res.status(400).json({
            msg: "Server error(post.js)"
        })
    }
})
//@route   post api/posts/:id
//@desc    get the post for that id
//@access  private
router.get('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post)
            return res.status(404).json({
                msg: "post not found"
            })
        res.json(post)
    } catch (err) {
        console.error(err.message)
        if (err.kind == "ObjectId")
            return res.status(404).json({
                msg: "post not found"
            })
        res.status(400).json({
            msg: "Server error(post.js)"
        })
    }
})
//@route   delete api/posts/:id
//@desc    delete the post for that id
//@access  private
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post)
            return res.status(404).json({
                msg: "post not found"
            }) // checking if post exists or not
        if (post.user.toString() !== req.user.id) {
            return res.status(401).json({
                msg: "User not authorized"
            })
        } //checking user id matches with post's user id

        await post.remove();
        res.json({
            msg: "post removed"
        })
    } catch (err) {
        console.error(err.message)
        if (err.kind == "ObjectId")
            return res.status(404).json({
                msg: "post not found"
            })
        res.status(400).json({
            msg: "Server error(post.js)"
        })
    }
})

//@route   put api/posts/like/:id
//@desc    like a post
//@access  private
router.put('/like/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        //Checking if user already liked the post
        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
            return res.status(400).json({
                msg: "post already liked"
            })
        }
        post.likes.unshift({
            user: req.user.id
        })
        await post.save()
        res.json(post.likes)
    } catch (err) {
        console.error(err.message)
        res.status(400).json({
            msg: "Server error(post.js)"
        })
    }
})


//@route   put api/posts/unlike/:id
//@desc    unlike a post
//@access  private
router.put('/unlike/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        //Checking if user already liked the post
        if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
            return res.status(400).json({
                msg: "post has not been liked yet"
            })
        }
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id)

        post.likes.splice(removeIndex, 1)
        await post.save()
        res.json(post.likes)
    } catch (err) {
        console.error(err.message)
        res.status(400).json({
            msg: "Server error(post.js)"
        })
    }
})

//@route   post api/posts/comment/:id
//@desc    create a comment on a post
//@access  private
router.post('/comment/:id', [auth, [
    check('text', 'Text is required').not().isEmpty()
]], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty())
        return res.status(400).json({
            errors: errors.array()
        })
    try {
        const user = await User.findById(req.user.id).select('-password') //mongodb query
        const post = await Post.findById(req.params.id)
        const newComment = {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        } // no need to create as an class object,because we are not creating an object for an db,instead it is a part of collection
        post.comment.unshift(newComment)
        await post.save()

        res.json(post.comment);
    } catch (err) {
        console.error(err.message)
        res.status(400).json({
            msg: "Server error(post.js)"
        })
    }
})

//@route   Delete api/posts/comment/:id/comment_id
//@desc    delete a comment on a post
//@access  private
router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        //pull out the comment
        const comment = post.comments.find(comment => comment.id === req.params.comment_id)
        //Check whether comment exists or not
        if (!comment)
            return res.status(404).json({
                msg: "Comment does not exist"
            })
        //check whether comment is made by this user or not
        if (comment.user.toString() !== req.user.id)
            return res, status(404).json({
                msg: "User not authorized"
            })
        //removing from the db
        const removeIndex = post.comments.map(cmt => cmt.user.toString()).indexOf(req.user.id)
        post.comments.splice(removeIndex, 1)
        await post.save()
        res.json(post.comments)
    } catch (err) {
        console.error(err.message)
        res.status(400).json({
            msg: "Server error(post.js)"
        })
    }
})



module.exports = router;