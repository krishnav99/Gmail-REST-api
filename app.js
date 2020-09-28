var express = require("express"),
    bodyParser = require("body-parser"),
    passport = require("passport")
    Credentials = require("./credentials");

var app = express();
var port= process.env.PORT || 3000;
var GoogleStrategy = require('passport-google-oauth20') 

let promise = new Promise(function(resolve, reject) {
    // executor (the producing code, "singer")
  });
  
app.use(bodyParser.urlencoded({extended:true}));

//Google Authentication Strategy for passport
passport.use(new GoogleStrategy({
    clientID: Credentials.clientID,
    clientSecret: Credentials.clientSecret,
    callbackURL: "http://localhost:3000/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    return cb(null, profile);    
  }
));

//setting up passport middlewares
app.use(passport.initialize());
app.use(passport.session());

app.use(require("express-session")({
    secret: "secret",
    resave: false,
    saveUninitialized: false
}))

passport.serializeUser(function(user, done) {
    done(null, user.id);        
});
passport.deserializeUser(function(user, done) {
    done(null, user);  
});

app.get("/", function(req, res){
    res.send("Home Page");
})

app.get('/google', passport.authenticate('google', { scope: ['profile','email'] }));

app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), function(req, res) {
    console.log(req.user);
    res.send("authenticated");
  });

//Logout
app.get("/logout", function(req, res){ 
    console.log("returning");
    req.logout();
});



app.listen(port, ()=> console.log("The Server is Running"));