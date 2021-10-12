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
            let stockticker = document.getElementById("tickerData").value;
            $.post("/getTickerData", {ticker: stockticker,}, dataFromServer => {
                console.log(dataFromServer.tickerPrice)
            });
          }
    },
    computed: { //computed properties (methods that compute stuff based on "data" properties)
        //Do not change the value of a property from within these functions.  Side-effects
        //will not be reliable because Vue might skip calls to computed functions as an optimization.
    }
}

let app = Vue.createApp(vm).mount('#main');