var express = require("express"),
    bodyParser = require("body-parser");
    Passport = require("passport");
var app = express();
var port= process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended:true}));

app.get("/", function(req, res){
    res.send("running");
})


app.listen(port, ()=> console.log("The Server is Running"));