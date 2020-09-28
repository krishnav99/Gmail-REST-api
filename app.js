const { json } = require("body-parser");
var express = require("express"),
    bodyParser = require("body-parser"),
    passport = require("passport"),
    Credentials = require("./credentials"), //requiring credentials from a private file
    fs = require("fs");

    var app = express();
var port= process.env.PORT || 3000;
var GoogleStrategy = require('passport-google-oauth20'); 
const user = require("../Web Development Bootcamp/Node.js projects/YelpCamp/v9/models/user");


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

//setting up express-session
app.use(require("express-session")({
  secret: "secret",
  resave: false,
  saveUninitialized: false
}))


//setting up passport middlewares
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
    done(null, user.id);        
});
passport.deserializeUser(function(user, done) {
    done(null, user);  
});

//Index route 
app.get("/", function(req, res){
    res.send("Home Page");
})

//Login Route
app.get('/google', passport.authenticate('google', { scope: ['profile','email'] }));

//Callback route
app.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), function(req, res) {
    storeData(req.user); //calling a function to store data
    res.send("authenticatedd");
  });


//function to store data
function storeData(data){
  if(fs.existsSync('data.json')){//checking if the file exists;
    fs.readFile('data.json', function(err, readdata){  //reading data from the file
        if(err) throw err;
        console.log(JSON.parse(readdata));
        if(!readdata.includes(JSON.stringify(data))){   //checking if the data does not exists previously
          fs.writeFile("data.json", JSON.stringify(JSON.parse(readdata).concat(data)), function (err) {   //writing the data into the file
            if (err) throw err;
            console.log('Saved!')}); 
          }      
      });
    }
  else{
    fs.writeFile("data.json", JSON.stringify([data]), function (err) {  //if the file does not exist we are creating the file and writing the data
      if (err) throw err;
      console.log('Saved!')});
  }   
};


//Logout route
app.get("/logout", function(req, res){ 
    console.log("returning");
    req.logout();
    res.redirect("/");
  });

app.listen(port, ()=> console.log("The Server is Running"));