var express = require("express");
const Datastore = require('nedb')
var bodyParser = require("body-parser");
var app = express(); 
app.use(bodyParser.urlencoded({extended: true})); 
app.use(express.static("pub")); 
const spawn = require('child_process').spawn;

const userDatabase = new Datastore('userDatabase.db');
userDatabase.loadDatabase();
userDatabase.insert({username: "orochest", password: "Skipper99?", tickerList: [], balance: 100000.00})

//tickerList in database has array form of [stockTicker, how many shares bought, price of stock when bought, total cost of purchase]


app.post("/getTickerData", function(req, res) {
    let ticker = req.body.ticker;
    let tickerPrice = null;
    const process = spawn('py', ['./getTickerData2.py', ticker])
    process.stdout.on('data', (data)=>{
        tickerPrice = data.toString();
        res.setHeader("Content-Type", "application/json");
        res.write(JSON.stringify({tickerPrice: tickerPrice}));
        res.end();
    })
});

app.post("/getStockPrice", function(req, res) {
    let ticker = req.body.ticker;
    console.log(ticker)
    let tickerPrice = null;
    const process = spawn('py', ['./getTickerData.py', ticker])
    process.stdout.on('data', (data)=>{
        tickerPrice = data.toString();
        res.setHeader("Content-Type", "application/json");
        res.write(JSON.stringify({tickerPrice: tickerPrice}));
        res.end();
    })
        
});

app.post("/updateUserDataAfterBuy", function(req, res) {
    let userObj = req.body.user;
    
    // newTickerList.push(buyArr);
    let returnObj = {};
    userDatabase.update({username: userObj.username},{$set: {tickerList: userObj.tickerList, balance: userObj.balance}})

    userDatabase.find({username: userObj.username}, (err, user) =>{
        returnObj = user; 
    });

    // console.log(returnObj)
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify({data: returnObj}));
    res.end();
});


app.post("/refreshPositions", function(req, res) {

    let tickerList = req.body.tickerList;
    let returnObj = {};
    userDatabase.update({username: userObj.username},{$set: {tickerList: tickerList, }})
    userDatabase.find({username: userObj.username}, (err, user) =>{
        returnObj = user; 
    });
    res.setHeader("Content-Type", "application/json");
    res.write(JSON.stringify({data: returnObj}));
    res.end();
});


app.post("/login", function(req, res) {
    let username = req.body.username;
    let password = req.body.password;

    userDatabase.findOne({username: username, password: password}, (err, user) =>{
        if(user != null){
            console.log("login success")
            console.log(user)
            console.log(user.balance)
            res.setHeader("Content-Type", "application/json");
            res.write(JSON.stringify({loginSuccess: true, data: user}));
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
            userDatabase.insert({username: username, password: password, tickerList: [], balance: 100000});
            res.setHeader("Content-Type", "application/json");
            res.write(JSON.stringify({createAccountSuccess: true}));
            res.end();
        }
    });
});

app.listen(80, function() {
    console.log("Server is now running.");
});

function getUserObj(){

}
