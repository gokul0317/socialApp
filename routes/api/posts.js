
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const validatePostInput = require('../../validations/post');


//@route - Get request to api/posts/test
//@desc - Test route
//@access - Public
router.get('/test', (req, res) => {
  res.json({ message: "Post works" })
});



//@route - POST request to api/posts
//@desc - Create post route
//@access - Private
router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  var { errors, isValid } = validatePostInput(req.body);
  if (!isValid) {
    res.status(400).json(errors);
  }
  const newPost = new Post({
    name: req.body.name,
    text: req.body.text,
    avatar: req.body.avatar,
    user: req.user.id
  });

  newPost.save(newPost).then(post => res.json(post));
});


//@route - GET request to api/posts
//@desc - get post route
//@access - Public

router.get('/', (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ "noPosts": "No Posts" }));
});


//@route - GET request to api/posts/:id
//@desc - get post by id route
//@access - Public

router.get('/:id', (req, res) => {
  Post.findById(req.params.id)
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ "noPost": "No Posts with the id" }));
});



//@route - DELETE request to api/posts/:id
//@desc - Delete post by id route
//@access - Private

router.delete('/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(() => {
      Post.findById(req.params.id).then(post => {
        if (!post) {
          return res.status(404).json({ postNotFound: "No Post Found with the ID" })
        }

        if (post.user.toString() !== req.user.id) {
          return res.status(401).json({ "notAuthorized": "User not authorized" });
        }
        post.remove().then(() => res.json({ "success": true }))
          .catch(() => res.status(404).json({ postNotFound: "No Post Found with the ID" }));
      })
    })
    .catch(err => res.status(404).json({ "noPostFound": "Error deleting posts" }))
});


//@route - POST request to api/posts/like/:id
//@desc - Like post by id route
//@access - Private 

router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(() => {
      Post.findById(req.params.id).then(post => {

        if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
          return res.status(400).json({ "alreadyliked": "User Already liked" });
        }

        post.likes.unshift({ user: req.user.id });
        post.save()
          .then(post => res.json(post))
          .catch(() => res.status(404).json({ "message": "Error liking the post" }));
      })
    })
    .catch(err => res.status(404).json({ "noPostFound": "Error deleting posts" }))
});


//@route - POST request to api/posts/unlike/:id
//@desc - Like post by id route
//@access - Private 

router.post('/unlike/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then(() => {
      Post.findById(req.params.id).then(post => {

        if (!post.likes.filter(like => like.user.toString() != req.user.id).length) {
          return res.status(400).json({ "notLike": "User Haven't liked the post" });
        }

        //get remove index

        var newLikes = post.likes.filter(item => item.user.toString() == req.user.id);
        post.likes = newLikes;
        post.save()
          .then(post => res.json(post))
          .catch(() => res.status(404).json({ "message": "Error liking the post" }));
      })
    })
    .catch(err => res.status(404).json({ "noPostFound": "Error deleting posts" }))
});


//@route - POST request to api/posts/comment/:id
//@desc - Comment a post by id route
//@access - Private 

router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
  var { errors, isValid } = validatePostInput(req.body);
  if (!isValid) {
    res.status(400).json(errors);
  }

  Post.findById(req.params.id).then(post => {
    const newComment = {
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    };

    //add to comments;
    post.comments.unshift(newComment);
    post.save().then(post => res.json(post)).catch(err => res.status(404).json({ postnotfound: 'No post found' }));

  })
});



//@route - DELETE request to api/posts/comment/:id
//@desc - Delete a post by id route
//@access - Private 


router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }), (req, res) => {
  Post.findById(req.params.id).then(post => {

    if (post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
      return res.status(404).json({ commentnotexists: "Comment does not exist" })
    }
    let indexToRemove = post.comments.findIndex(comment => comment._id.toString() === req.params.comment_id);
    if (post.comments[indexToRemove].user != req.user.id) {
      return res.status(401).json({ noaccestocomment: "User dont have acces to delete the comment" })
    }else{
      post.comments.splice(indexToRemove, 1);
      post.save().then(post => res.json(post)).catch(err => res.status(404).json({ postnotfound: "post not found" }));
    }

  })
})

module.exports = router;