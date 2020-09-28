const { json }      = require("body-parser");
var express         = require("express"),
    bodyParser      = require("body-parser"),
    passport        = require("passport"),
    GoogleStrategy  = require('passport-google-oauth20'),
    nodemailer      = require("nodemailer"),
    Credentials     = require("./credentials"), //requiring credentials from a private file
    User            = require("./nodemaileruser"), //getting user data for nodemailer
    fs              = require("fs");
const { get } = require("http");

var app = express();
var port= process.env.PORT || 3000;
var emailList = [];
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

//setting up nodemailer transporter
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: User.mailId,
    pass: User.password,
  }
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
        if(!readdata.includes(JSON.stringify(data))){   //checking if the data does not exist previously
          fs.writeFile("data.json", JSON.stringify(JSON.parse(readdata).concat(data)), function (err) {   //writing the data onto the file
            if (err) throw err;
            console.log('Saved!')}); 
          }      
      });
    }
  else{
    fs.writeFile("data.json", JSON.stringify([data]), function (err) {  //if the file does not exist we create a new file and save the user data
      if (err) throw err;
      console.log('Saved!')});
  }   
};

//Route to send mail
app.get("/sendmail", function(req, res){
  fs.readFile('data.json', function(err, readdata){  //read the client data stored in the file 
    if(err){
      console.log(err);
      res.redirect("/")
    }
    for (const element of JSON.parse(readdata)){      //loops through each client data and stores the email in an array
      if(!emailList.includes(element.emails[0].value)){
        emailList.push(element.emails[0].value)
      }
    }
    console.log(JSON.parse(readdata))
    transporter.sendMail(mailOptions = {        //sends an email to each email adress in the email array
      from: User.mailId,
      subject: 'Sending Email from Node.js',
      text: 'Test Message',
      to:emailList  
      }, function(error, info){ 
        if (error) {
          console.log(error);
          res.redirect("/")
        } else {
          console.log('Email sent: ' + info.response);
          res.send("Email Sent")
        }
    });
  });
});


//Logout route
app.get("/logout", function(req, res){ 
    console.log("returning");
    req.logout();
    res.redirect("/");
  });

app.listen(port, ()=> console.log("The Server is Running"));