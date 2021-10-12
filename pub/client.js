//var CryptoJS = require("crypto-js");
let vm = {
    data() { //properties of our object must be established here, and are returned as an object.
        return {
            username: null,
            viewType: "landingPage",
            balance: null,
            tickerList: [],
            searchedStockData: []
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
              this.balance = data.data.balance;
              this.tickerList = data.data.tickerList;
              this.user = data.data.username;
          },

          buyStock(){
                let stockticker = document.getElementById("tickerToPurchase").value;
                console.log(stockticker)
                let shareAmt = document.getElementById("shareAmt").value;
                shareAmt = parseFloat(shareAmt);
                let tickerPrice = null;
                if(ticker = "" || shareAmt % 1 !== 0){
                    console.log("invalid ticker")
                }
                else{
                    $.post("/getStockPrice", {ticker: stockticker,}, dataFromServer => {
                        tickerPrice = dataFromServer.tickerPrice;  
                        console.log(tickerPrice)
                    });

                    if((tickerPrice * parseFloat(shareAmt)) > this.balance){
                        console.log("do not have enough money to fill this order")
                    }
                    else{
                        $.post("/updateUserDataAfterBuy", {username: this.username, tickerSymbol: stockticker, stockPrice: tickerPrice, shares: shareAmt}, dataFromServer => {
                            
                        });
                    }
                }
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