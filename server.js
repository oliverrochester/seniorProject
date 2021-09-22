var express = require("express");
const Datastore = require('nedb')
var bodyParser = require("body-parser");
var app = express(); 
app.use(bodyParser.urlencoded({extended: true})); 
app.use(express.static("pub")); 

const userDatabase = new Datastore('userDatabase.db');
userDatabase.loadDatabase();
//userDatabase.insert({username: 'orochest', password: 'elmo'});
//userDatabase.insert({username: 'jrochest', password: 'skipper'});


app.post("/login", function(req, res) {
    let username = req.body.username;
    let password = req.body.password;

    userDatabase.findOne({username: username, password: password}, (err, user) =>{
        if(user != null){
            console.log("login success")
            res.setHeader("Content-Type", "application/json");
            res.write(JSON.stringify({loginSuccess: true}));
            res.end();
        }
        else{
            console.log("login failed")
            res.setHeader("Content-Type", "application/json");
            res.write(JSON.stringify({loginSuccess: false}));
            res.end();
        }
    });
});

app.post("/createAccount", function(req, res) {
    let username = req.body.username;
    let password = req.body.password; 

    userDatabase.findOne({username: username}, (err, user) =>{
        if(user != null){
            console.log("Account with this username already exists");
            res.setHeader("Content-Type", "application/json");
            res.write(JSON.stringify({createAccountSuccess: false}));
            res.end();
        }
        else{
            userDatabase.insert({username: username, password: password});
            res.setHeader("Content-Type", "application/json");
            res.write(JSON.stringify({createAccountSuccess: true}));
            res.end();
        }
    });
});

app.listen(80, function() {
    console.log("Server is now running.");
});
