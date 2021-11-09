//var CryptoJS = require("crypto-js");
let vm = {
    data() { //properties of our object must be established here, and are returned as an object.
        return {
            username: null,
            viewType: "landingPage",
            user: {},
            positions: [],
            userBalance: 0.00,
            tickerCnt: 0,
        }
    }, 
    methods: { //An object that contains whatever methods we need.
          createAccount(){
            let status = document.getElementById("createAccountorLoginStatus");
            let username = String(document.getElementById("userCreateAct").value);
            let password = String(document.getElementById("passwordCreateAct").value);

            // var bytes  = CryptoJS.AES.decrypt(ciphertext.toString(), 'secret key 123');
            // var plaintext = bytes.toString(CryptoJS.enc.Utf8);
            // console.log(plaintext)

            if(password.length < 8){
                status.innerHTML = "password must be at least 8 characters long"
            }
            else{
                var ciphertext = CryptoJS.AES.encrypt(password, 'secret key 123');
                console.log(ciphertext)
                $.post("/createAccount", {username: username, password: password}, dataFromServer => {
                    if(!dataFromServer.createAccountSuccess){
                        status.innerHTML = "Account with that username already exists"
                    }
                    else{
                        status.innerHTML = "Account created successfully"
                    }
                }); 
            }
            
          },

          login(){
            let username = String(document.getElementById("userLogin").value);
            let password = String(document.getElementById("passwordLogin").value);
            $.post("/login", {username: username, password: password}, dataFromServer => {
                if(dataFromServer.loginSuccess){
                    this.goToMainPage(dataFromServer);
                }
            });
          },

          goToMainPage(data){
              this.viewType = "mainPage";
              console.log(data)
              this.user = data.data;
              this.positions = data.data.tickerList;
              this.userBalance = data.data.balance;
          },

          buyStock(){
                let stockticker = document.getElementById("tickerToPurchase").value;
                let shareAmt = document.getElementById("shareAmt").value;
                shareAmt = parseFloat(shareAmt);
                let tickerPrice = null;
                if(ticker = "" || shareAmt % 1 !== 0){
                    console.log("invalid ticker")
                }
                else{
                    $.post("/getStockPrice", {ticker: stockticker,}, dataFromServer => {
                        tickerPrice = dataFromServer.tickerPrice;  

                        if((tickerPrice * parseFloat(shareAmt)).toFixed(2) > this.balance){
                            console.log("do not have enough money to fill this order")
                        }
                        else{
                            this.userBalance = (this.userBalance - (parseFloat(tickerPrice) * parseFloat(shareAmt))).toFixed(2);
                            tempObj = {
                                ticker: "",
                                shareAmt: 0,
                                tickerPrice: 0.0,
                                costOfPurchase: 0.0,
                            };
                            tempObj.ticker = String(stockticker);
                            tempObj.shareAmt = shareAmt;
                            tempObj.tickerPrice = parseFloat(tickerPrice).toFixed(2);
                            tempObj.costOfPurchase = (parseFloat(tickerPrice) * parseFloat(shareAmt)).toFixed(2);
                            console.log(tempObj)
                            
                            newUserBalance = parseFloat(this.userBalance) - (parseFloat(tickerPrice) * parseFloat(shareAmt)).toFixed(2);
                            $.post("/updateUserDataAfterBuy", {userBalance: newUserBalance, newObj: tempObj, user: this.username}, dataFromServer => {
                                console.log("data from server")
                                console.log(dataFromServer.data);
                                this.user = dataFromServer[0];
                                this.updatePositions(this.user);
                            });
                        }
                    });

                }
          },

          doalert(){
            alert("div clicked")
          },

          updatePositions(userObj){
            console.log("console logging user at update positions")
            //   console.log(userObj)
            // userObj.tickerList.forEach((pos) =>{
            //     let sharesBought = pos.shareAmt;
            //     let initialPurchaseCost = pos.costOfPurchase;

            //     $.post("/getStockPrice", {ticker: tickerName,}, dataFromServer => {
            //         tickerPrice = dataFromServer.tickerPrice;
            //         let updatedCost = parseFloat(purchaseStockPrice)* parseFloat(sharesBought);
            //         pos.profits = parseFloat(updatedCost) - parseFloat(initialPurchaseCost);
            //     });

            // });

            // $.post("/refreshPositions", {tickerList: user.tickerList, username: this.username}, dataFromServer => {
            //     this.positions = dataFromServer.data.tickerList;
            // });

          },

          getTickerData(){
            let searchBtn = document.getElementById("searchButton");
            searchBtn.disabled = true;
            let searchStatus = document.getElementById("searchStatus");
            searchStatus.innerHTML = "Searching...";
            let stockticker = document.getElementById("tickerData").value;
            let currentPrice = document.getElementById("currentPriceDiv");
            currentPrice.innerHTML = "";
            let todayOpenPrice = document.getElementById("todayOpenPriceDiv");
            todayOpenPrice.innerHTML = "";
            let yesterdayClosePrice = document.getElementById("yesterdayClosePriceDiv");
            yesterdayClosePrice.innerHTML = "";
            let fiftyDayAvg = document.getElementById("fiftyDayAvgDiv");
            fiftyDayAvg.innerHTML = "";
            let dayHigh = document.getElementById("dayHigh");
            dayHigh.innerHTML = "";
            let dayLow = document.getElementById("dayLow");
            dayLow.innerHTML = "";
            let fifty2Low = document.getElementById("fiftyTwoLow");
            fifty2Low.innerHTML = "";
            let fifty2High = document.getElementById("fiftyTwoHigh");
            fifty2High.innerHTML = "";

            let dataArr = []
            let dataArrNew = []
            $.post("/getTickerData", {ticker: stockticker,}, dataFromServer => {
                dataArr = dataFromServer.tickerPrice.split(", ");
                dataArr.forEach((str) =>{
                    let tempStr = "";
                    for(let i = 0; i < str.length; i++){
                        if(str.charAt(i) >= '0' && str.charAt(i) <= '9' || str.charAt(i) == '.'){
                            tempStr += str.charAt(i);
                        }
                    }
                    dataArrNew.push(tempStr)
                })

                var newtext = document.createTextNode(dataArrNew[0])
                currentPrice.appendChild(newtext);
                var newtext1 = document.createTextNode(dataArrNew[1])
                todayOpenPrice.appendChild(newtext1);
                var newtext2 = document.createTextNode(dataArrNew[2])
                yesterdayClosePrice.appendChild(newtext2);
                var newtext3 = document.createTextNode(dataArrNew[3])
                fiftyDayAvg.appendChild(newtext3);
                var newtext4 = document.createTextNode(dataArrNew[4])
                dayHigh.appendChild(newtext4);
                var newtext5 = document.createTextNode(dataArrNew[5])
                dayLow.appendChild(newtext5);
                var newtext6 = document.createTextNode(dataArrNew[6])
                fifty2Low.appendChild(newtext6);
                var newtext7 = document.createTextNode(dataArrNew[7])
                fifty2High.appendChild(newtext7);
                searchStatus.innerHTML = "";
                searchBtn.disabled = false;
            });
          }
    },
    computed: { //computed properties (methods that compute stuff based on "data" properties)
        //Do not change the value of a property from within these functions.  Side-effects
        //will not be reliable because Vue might skip calls to computed functions as an optimization.
    }
}

let app = Vue.createApp(vm).mount('#main');