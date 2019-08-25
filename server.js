const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

var app = express();
const db = require('./config/keys').mongoURI;
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//connect to mongo db

mongoose
    .connect(db)
    .then(() => console.log('connected to mongo'))
    .catch( err => console.log(err));
var port = process.env.PORT || 5000;

app.use(passport.initialize());

require('./config/passport')(passport);

app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

app.listen(port, ()=>{
    console.log(`Server listening on port - ${port}`)
})