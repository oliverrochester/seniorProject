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

//Server get ticker Data function, receives ticker symbol from client
//spawns a new process and calls a python script to retrieve data about the stock
//returns array of data in a string format, which requires string manipulation to get the data in correct format
// in order to use it later
app.post("/getTickerData", function(req, res) {
    let ticker = req.body.ticker;
    let tickerData = null;
    const process = spawn('py', ['./getTickerData2.py', ticker])
    process.stdout.on('data', (data)=>{
        tickerData = data.toString();
        res.setHeader("Content-Type", "application/json");
        res.write(JSON.stringify({tickerPrice: tickerData}));
        res.end();
    })
});

app.post("/getStockPrice", function(req, res) {
    let ticker = req.body.ticker;
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
    let username = req.body.username;
    let newTickerList = [];
    let newBuyObj = {
         ticker: req.body.ticker,
         balance: req.body.balance,
         sharesBought: req.body.shareAmt,
         sharePriceWhenBought: req.body.sharePrice,
         costOfPurchase: req.body.cost,
         
    }
    
    userDatabase.findOne({username: username}, (err, user) =>{
        //console.log(user.tickerList);
        newTickerList = user.tickerList;
        newTickerList.push(newBuyObj)
        userDatabase.update({username: username},{$set: {tickerList: newTickerList, balance: newBuyObj.balance}})
        userDatabase.findOne({username: username}, (err, user) =>{
            console.log(user.tickerList)
            res.setHeader("Content-Type", "application/json");
            res.write(JSON.stringify({data: user}));
            res.end();
        });
    });
 

    

    
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

//Server login function, gathers username and password from req object
//Searches database to see if that username with the given password exists
//If true, it returns true and the entire user object back to the client
//If false, returns false
app.post("/login", function(req, res) {
    let username = req.body.username;
    let password = req.body.password;

    userDatabase.findOne({username: username, password: password}, (err, user) =>{
        if(user != null){
            console.log("login success")
            res.setHeader("Content-Type", "application/json");
            res.write(JSON.stringify({loginSuccess: true, data: user, password: password}));
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


//Server create account function, gathers username and password from req object
//Searches database to see if that username with the given password exists
//If true, then a user already has an accont with that username and returns false
//If false, then it creates a new user object with given information and adds it to the database and returns success
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


