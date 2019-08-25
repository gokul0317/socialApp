
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const Profile = require('../../models/Profile');
const user = require('../../models/User');

//@route - Get request to api/profile/test
//@desc - Test route
//@access - Public 
router.get('/test', (req, res) => {
  res.json({ message: "Profile works" })
});

//@route - Get request to api/profile
//@desc - Get current user Profile
//@access - Private

router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  var errors = {}
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      if (!profile) {
        errors.noProfile = 'There is no profile';
        return res.status(404).json(errors)
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});



module.exports = router;