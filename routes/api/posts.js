const express = require('express');
const router = express.Router();

//@route - Get request to api/posts/test
//@desc - Test route
//@access - Public
router.get('/test', (req, res) => {
  res.json({message: "Post works"})
});


module.exports = router;