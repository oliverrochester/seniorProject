//var CryptoJS = require("crypto-js");
let vm = {
    data() { //properties of our object must be established here, and are returned as an object.
        return {
            username: "",
            viewType: "landingPage",
            user: {},
            positions: [],
            userBalance: 0.00,
            tickerCnt: 0,
            password: ""
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
            this.username = data.data.username
            this.user = data.data;
            this.positions = data.data.tickerList;
            this.userBalance = data.data.balance;
            this.password = data.password;
        },

        buyStock(){
            let tickerToPurchase = document.getElementById("tickerToPurchase").value;
            let numberOfShares = document.getElementById("shareAmt").value;
            numberOfShares = parseInt(numberOfShares);
            let tickerPrice;
            let costOfPurchase;
            let newBalance;
            console.log(typeof(numberOfShares))
            if(typeof(numberOfShares) === "number"){
                $.post("/getStockPrice", {ticker: tickerToPurchase,}, dataFromServer => {
                    tickerPrice = dataFromServer.tickerPrice;
                    tickerPrice = parseFloat(tickerPrice)
                    costOfPurchase = (numberOfShares * tickerPrice).toFixed(2);
                    newBalance = this.userBalance - costOfPurchase;
                    let dateTimePuchased = this.getDateAndTime();
                    let obj = {
                        ticker: tickerToPurchase,
                        shareAmt: numberOfShares,
                        sharePrice: tickerPrice,
                        cost: costOfPurchase,
                        username: this.username,
                        balance: newBalance,
                        date: dateTimePuchased,
                        profit: 0.00,
                    }
                    this.updateTickerListAfterBuy(obj)
                });
            }
            else{
                alert("invalid share amount")
            }
            
        },

        updateTickerListAfterBuy(obj){
            $.post("/updateUserDataAfterBuy", obj, dataFromServer => {
                //console.log(dataFromServer)
                this.positions = dataFromServer.data.tickerList;
                this.userBalance = dataFromServer.data.balance
            }); 
            
        },

        updatePosition(datePositionWasBought){
            //alert('refresh clicked');
            $.post("/updateProfitOfPosition", {date: datePositionWasBought, username: this.username}, dataFromServer => {
                this.positions = dataFromServer.data.tickerList;
            });
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
        },

        getDateAndTime(){
            let currentdate = Date();
            console.log(currentdate);
            return(currentdate);
        }
        
    },
    computed: { //computed properties (methods that compute stuff based on "data" properties)
        //Do not change the value of a property from within these functions.  Side-effects
        //will not be reliable because Vue might skip calls to computed functions as an optimization.
    }
}

let app = Vue.createApp(vm).mount('#main');