const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys');
const passport = require('passport');

//Load input validation
const validateRegisterInput = require('../../validations/register');
const validateLoginInput = require('../../validations/login');


//@route - Get request to api/users/test
//@desc - Test route
//@access - Public 
router.get('/test', (req, res) => {
  res.json({message: "Users works"})
});


//@route - Post request to api/users/register
//@desc - Register route
//@access - Public 

router.post('/register', (req, res) => {
    const { errors, isValid } = validateRegisterInput(req.body);
    //check validation
    if(!isValid){
      return res.status(400).json(errors);
    }
    User.findOne({email : req.body.email})
      .then(user => {
        if(user){
          errors.email = "Email already exists";
          res.status(400).json(errors)
        }else{
          var avatar = gravatar.url(req.body.email, {s: '200', r: 'pg', d: 'mm'});

          var newUser = new User({
             name: req.body.name,
             email: req.body.email,
             avatar,
             password: req.body.password
          });
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if(err){
                throw err;
              }
              newUser.password = hash;
              newUser.save().then(user => {
                res.json(user)
              })
              .catch(err => console.log(err));
            })
          })    
        }
      })
}); 

//@route - GET request to api/users/login
//@desc - Login route/ return JWT
//@access - Public 

router.post('/login', (req, res) => {
   const email = req.body.email;
   const password = req.body.password;
   const { errors, isValid } = validateLoginInput(req.body);
   //check validation
   if(!isValid){
     return res.status(400).json(errors);
   }
   User.findOne({email})
   .then(user => {
      if(!user){
          errors.email = 'User Not Found';
         return res.status(404).json(errors);
      }
      //checkPassword
      bcrypt.compare(password, user.password)
        .then(isMatch => {
            if(isMatch){
              //user matched
              const payload = { id: user.id, name: user.name, avatar: user.avatar }; // create jwt payload
              jwt.sign(
                payload, 
                keys.secretKey, 
                { expiresIn: 3600 }, 
                (err, token) => {
                   res.json({
                     success: true,
                     token: 'Bearer '+token
                   })   
              });
            }else{
              return res.status(400).json({password: 'Password incorrect'});
            }
        });
   });
});


//@route - GET request to api/users/current
//@desc - current user
//@access - Private

router.get('/current', passport.authenticate('jwt', {session: false}), (req, res)=>{
   res.json({ 
      id: req.user.id,
      name : req.user.name,
      email: req.user.email,
      avatar : req.user.avatar
   });
})



module.exports = router;