var express = require("express");
const Datastore = require('nedb')
var bodyParser = require("body-parser");
var app = express(); 
app.use(bodyParser.urlencoded({extended: true})); 
app.use(express.static("pub")); 
const spawn = require('child_process').spawn;

const userDatabase = new Datastore('userDatabase.db');
userDatabase.loadDatabase();
//userDatabase.insert({username: "orochest", password: "Skipper99?", tickerList: [], balance: 100000.00})

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
    let newHistoryList = [];
    let newBuyObj = {
         ticker: req.body.ticker,
         balance: req.body.balance,
         sharesBought: req.body.shareAmt,
         sharePriceWhenBought: req.body.sharePrice,
         costOfPurchase: req.body.cost,
         date: req.body.date,
         profit: "0",
         
    }

    let historyObj = {
        tickerSymbol: req.body.ticker,
        orderType: "BUY",
        date: new Date().toLocaleDateString(),
        shareAmt: req.body.shareAmt,
        costOfPurchase: req.body.cost
    }
    
    userDatabase.findOne({username: username}, (err, user) =>{
        newTickerList = user.tickerList;
        newHistoryList = user.orderHistory;
        newTickerList.push(newBuyObj);
        newHistoryList.push(historyObj);
        userDatabase.update({username: username},{$set: {tickerList: newTickerList, balance: newBuyObj.balance, orderHistory: newHistoryList}})
        userDatabase.findOne({username: username}, (err, user) =>{
            res.setHeader("Content-Type", "application/json");
            res.write(JSON.stringify({data: user}));
            res.end();
        });
    });  
});

app.post("/refreshPositions", function(req, res) {
    let username = req.body.username;
    let newTickerList;
    userDatabase.findOne({username: username}, (err, user) =>{
        newTickerList = user.tickerList;
        console.log(newTickerList);


        
        // for(let i = 0; i < newTickerList.length; i++){
        //     let tickerPrice = null;
        //     const process = spawn('py', ['./getTickerData.py', newTickerList[i].ticker])
        //     process.stdout.on('data', (data)=>{
        //         tickerPrice = data.toString();
        //         let newCost = parseFloat(tickerPrice) * parseFloat(newTickerList[i].sharesBought);
        //         newTickerList[i].profit = (newCost - parseFloat(newTickerList[i].costOfPurchase)).toString();
        //     })
        // }

        // console.log(newTickerList);
        // userDatabase.update({username: username},{$set: {tickerList: newTickerList}});
        // userDatabase.findOne({username: username}, (err, user) =>{
        //     res.setHeader("Content-Type", "application/json");
        //     res.write(JSON.stringify({data: user}));
        //     res.end();
        // });
    });
    
});

app.post("/updateProfitOfPosition", function(req, res) {
    let username = req.body.username;
    let dateBought = req.body.date;   
    let newTickerList; 
    userDatabase.findOne({username: username}, (err, user) =>{
        let tickerData;
        newTickerList = user.tickerList;
        for(let i = 0; i<newTickerList.length; i++){
            if(newTickerList[i].date == dateBought){
                console.log(newTickerList[i].date);
                console.log(dateBought);
                const process = spawn('py', ['./getTickerData.py', newTickerList[i].ticker])
                process.stdout.on('data', (data)=>{
                    tickerData = parseFloat(data);
                    console.log("ticker data  " + tickerData);
                    console.log("number of shares  " + newTickerList[i].sharesBought)

                    newTickerList[i].profit = (tickerData * parseFloat(newTickerList[i].sharesBought)) - parseFloat(newTickerList[i].costOfPurchase);
                    newTickerList[i].profit = newTickerList[i].profit.toFixed(2)
                    console.log(newTickerList[i].profit)
                    userDatabase.update({username: username},{$set: {tickerList: newTickerList}})
                    userDatabase.findOne({username: username}, (err, user) =>{
                        res.setHeader("Content-Type", "application/json");
                        res.write(JSON.stringify({data: user}));
                        res.end();  
                    });
                })    
            }
        }  
    })
    
});

app.post("/sellPosition", function(req, res) {
    let date = req.body.date;
    let username = req.body.username;
    let newTickerList = [];
    let tickerPrice;
    let newBalance;
    userDatabase.findOne({username: username}, (err, user) =>{
        newTickerList = user.tickerList;
        let ticker;
        let posInArray;
        let sharesBought;
        let cost;
        for(let i = 0; 0 < newTickerList.length; i++){
            if(newTickerList[i].date == date){
                ticker = newTickerList[i].ticker
                posInArray = i;
                cost = newTickerList[i].costOfPurchase;
                sharesBought = newTickerList[i].sharesBought;
                break;
            }
        }
        const process = spawn('py', ['./getTickerData.py', ticker])
        process.stdout.on('data', (data)=>{
        tickerPrice = data.toString();
        let sellingPrice = parseFloat(tickerPrice) * parseFloat(sharesBought);
        newBalance = parseFloat(user.balance) + parseFloat(sellingPrice);
        newTickerList.splice(posInArray, 1);
        userDatabase.update({username: username},{$set: {tickerList: newTickerList, balance: newBalance}})
        userDatabase.findOne({username: username}, (err, user) =>{
            res.setHeader("Content-Type", "application/json");
            res.write(JSON.stringify({data: user}));
            res.end();  
        });
    })

        
    }); 

});

app.post("/restartFresh", function(req, res) {
    let username = req.body.username;
    let newTickerList = [];
    userDatabase.findOne({username: username}, (err, user) =>{
        userDatabase.update({username: username},{$set: {tickerList: newTickerList, balance: 100000.00, orderHistory: []}})
        userDatabase.findOne({username: username}, (err, user) =>{
            res.setHeader("Content-Type", "application/json");
            res.write(JSON.stringify({data: user}));
            res.end();
        });
    });
});

app.post("/getTopPerformers", function(req, res) {
    let performers = null;
    const process = spawn('py', ['./getPerformers.py', "yes"])
    process.stdout.on('data', (data)=>{
        performers = data.toString();
        res.setHeader("Content-Type", "application/json");
        res.write(JSON.stringify({topPerformers: performers}));
        res.end();
    })
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

    console.log(username);
    console.log(password);
    userDatabase.findOne({username: username}, (err, user) =>{
        if(user != null){
            console.log("Account with this username already exists");
            res.setHeader("Content-Type", "application/json");
            res.write(JSON.stringify({createAccountSuccess: false}));
            res.end();
        }
        else{
            userDatabase.insert({username: username, password: password, tickerList: [], balance: 100000.00, orderHistory: []});
            console.log("Account created successfully")
            res.setHeader("Content-Type", "application/json");
            res.write(JSON.stringify({createAccountSuccess: true}));
            res.end();
        }
    });
});



app.listen(80, function() {
    console.log("Server is now running.");
});


