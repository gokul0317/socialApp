
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const validateProfileInuput = require('../../validations/profile');
const validateExperienceInuput = require('../../validations/experience');
const validateEducationInuput = require('../../validations/education');

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
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noProfile = 'There is no profile';
        return res.status(404).json(errors)
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});


//@route - Post request to api/profile
//@desc - POST create user Profile
//@access - Private

router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  //Get Fields 
  var profileFields = {};
  var { errors, isValid } = validateProfileInuput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  profileFields.user = req.user.id;
  if (req.body.handle) profileFields.handle = req.body.handle;
  if (req.body.company) profileFields.company = req.body.company;
  if (req.body.website) profileFields.website = req.body.website;
  if (req.body.location) profileFields.location = req.body.li;
  if (req.body.bio) profileFields.bio = req.body.bio;
  if (req.body.status) profileFields.status = req.body.status;
  if (req.body.githubusername) profileFields.githubusername = req.body.githubusername;
  if (typeof req.body.skills !== undefined) {
    profileFields.skills = req.body.skills.split(",");
  }
  profileFields.social = {}
  if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
  if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
  if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
  if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
  if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

  Profile.findOne({ user: req.user.id }).then(profile => {
    if (profile) {
      Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true }).then(profile => res.json(profile));
    } else {
      //create
      //check handle exists

      Profile.findOne({ handle: profileFields.handle }).then(profile => {
        if (profile) {
          errors.handle = "Handle already exists";
          res.status(400).json(errors);
        } else {
          //save
          new Profile(profileFields).save().then(profile => {
            res.json(profile)
          });

        }
      })
    }
  })

});


//@route - Get request to api/profile/all
//@desc - Get profiles all
//@access - Public

router.get('/all', (req, res) => {
  let errors = {};
  Profile.find()
    .populate('user', ['name', 'avatar'])
    .then(profiles => {
      if (!profiles) {
        errors.profile = "No Profiles";
        return res.status(404).json(errors)
      }
      res.json(profiles)
    })
    .catch(err => {
      errors.profile = "No Profiles";
      res.status(404).json(errors);
    })
})


//@route - Get request to api/profile/handle/:handle
//@desc - Get profile by handle
//@access - Public

router.get('/handle/:handle', (req, res) => {
  const errors = {};
  Profile.findOne({ handle: req.params.handle })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noProfile = "There is no Profile";
        res.status(404).json(errors);
      }
      res.json(profile)
    })
    .catch(err => {
      errors.profile = "No profile Found"
      res.status(404).json(errors);
    });
});


//@route - Get request to api/profile/user/:user_id
//@desc - Get profile by handle
//@access - Public


router.get('/user/:user_id', (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.params.user_id })
    .populate('user', ['name', 'avatar'])
    .then(profile => {
      if (!profile) {
        errors.noProfile = "There is no Profile";
        res.status(404).json(errors);
      }
      res.json(profile)
    })
    .catch(err => {
      errors.profile = "No profile Found"
      res.status(404).json(errors);
    });
});



//@route - POST request to api/profile/experience
//@desc - Add experience
//@access - Private

router.post('/user/experience', passport.authenticate('jwt', { session: false }), (req, res) => {
  var { errors, isValid } = validateExperienceInuput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  } 
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      const newEdu = {
        title: req.body.title,
        company: req.body.company,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      }
      //Add to expereince

      profile.experience.unshift(newEdu);
      profile.save().then(profile => res.json(profile)).catch(err => {
          console.log(err)
          res.status(400).json({ "message": "Error adding experience" })
        })
    })
});

//@route - POST request to api/profile/education
//@desc - Add experience
//@access - Private

router.post('/user/education', passport.authenticate('jwt', { session: false }), (req, res) => {
  var { errors, isValid } = validateEducationInuput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  } 
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      const newExp = {
        school: req.body.school,
        degree: req.body.degree,
        fieldofstudy: req.body.fieldofstudy,
        from: req.body.from,
        to: req.body.to,
        current: req.body.current,
        description: req.body.description
      }
      //Add to expereince
      profile.education.unshift(newExp);
      profile.save().then(profile => res.json(profile)).catch(err => {
          console.log(err)
          res.status(400).json({ "message": "Error adding experience" })
        })
    })
});




//@route - DELETE request to api/profile/experience/:exp_id
//@desc - Delete experience from profile
//@access - Private

router.delete('/user/experience/:exp_id', passport.authenticate('jwt', { session: false }), (req, res) => {
   
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      //Get remove index
      const updatedExperience = profile.experience
         .filter(item => item.id !== req.params.exp_id);
      profile.experience = updatedExperience;
      profile.save().then(profile => res.json(profile))
        .catch(err => res.status(404).json({"message": "No Profile Found"}))
       
    })
});



//@route - DELETE request to api/profile/education/:exp_id
//@desc - Delete education from profile
//@access - Private

router.delete('/user/education/:edu_id', passport.authenticate('jwt', { session: false }), (req, res) => {
   
  Profile.findOne({ user: req.user.id })
    .then(profile => {
      //Get remove index
      const updatedExperience = profile.education
         .filter(item => item.id !== req.params.edu_id);
      profile.education = updatedExperience;
      profile.save().then(profile => res.json(profile))
        .catch(err => res.status(404).json({"message": "No Profile Found"}))
       
    })
});


//@route - DELETE request to api/profile
//@desc - Delete profile
//@access - Private

router.delete('/', passport.authenticate('jwt', { session: false }), (req, res) => {
   
  Profile.findOneAndRemove({ user: req.user.id })
    .then( () => {
        user.findOneAndRemove({_id: req.user_id})
          .then( () => {
             res.json({"success": true})
          })       
          .catch( () => {
             res.status(400).json({"success": false, "message": "user not deleted"})
          })
    })
});


module.exports = router;