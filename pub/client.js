//var CryptoJS = require("crypto-js");
let vm = {
    data() { //properties of our object must be established here, and are returned as an object.
        return {
            viewType: "landingPage",
            balance: null,
            tickerList: null
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
          },

          buyStock(){
                let ticker = document.getElementById("tickerToPurchase").value;
                let shareAmt = document.getElementById("shareAmt").value;
                shareAmt = parseInt(shareAmt);
                let tickerPrice = null

                $.post("/getStockPrice", {ticker: ticker,}, dataFromServer => {
                    tickerPrice = parseFloat(dataFromServer.tickerPrice);  
                }); 

                if(ticker = ""){
                    console.log("invalid ticker")
                }
                else if(shareAmt % 1 != 0){
                    console.log("Please enter whole number for share amount")
                }
                else if((tickerPrice * shareAmt) > this.balance){
                    console.log("do not have enough money to fill this order")
                }
                else{
                    console.log("buying stock");
                    let cost = tickerPrice * parseFloat(shareAmt);
                    console.log(cost)
                    this.balance = this.balance - cost;
                    let arr = [];
                    arr.push(ticker);
                    arr.push(shareAmt);
                    arr.push(tickerPrice);
                    arr.push(cost);
                    console.log(this.tickerList);
                }
                
            }
    },
    computed: { //computed properties (methods that compute stuff based on "data" properties)
        //Do not change the value of a property from within these functions.  Side-effects
        //will not be reliable because Vue might skip calls to computed functions as an optimization.
    }
}

let app = Vue.createApp(vm).mount('#main');