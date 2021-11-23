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
            password: "",
            totalProfits: 0.00,
            chart: undefined,
            showCanvas: false,
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
            let marketstatus;
            fetch('https://api.polygon.io/v1/marketstatus/now?apiKey=Sj2WpljTfw42jRUGXFmOamS0KCAhPC5K')
            .then(response => response.json())
            .then(data => {
                if(data.market == "extended-hours" || data.market == "closed"){
                    alert("stock market closed");
                }
                else{
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
                }
            })   
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
                let totalProfits = 0.00;
                this.positions.forEach((ticker)=>{
                    totalProfits += parseFloat(ticker.profit);
                })
                this.totalProfits = parseFloat(totalProfits);
                console.log(dataFromServer.data.profit);
            });
        },

        getDateRangeAndAPIString(ticker){
            let date = new Date;
            let dateNowCorrect = date.toLocaleDateString();

            let oldDate = new Date();
            let pastYear = oldDate.getFullYear() - 1;
            oldDate.setFullYear(pastYear);
            oldDate = oldDate.toLocaleDateString();

            oldDate = this.reverseDateRange(oldDate);
            dateNowCorrect = this.reverseDateRange(dateNowCorrect);
            // console.log(oldDate)
            // console.log(dateNowCorrect)
            let APIString = 'https://api.polygon.io/v2/aggs/' + "ticker/" + ticker + '/range/1/day/' + oldDate + "/" + dateNowCorrect + "?apiKey=Sj2WpljTfw42jRUGXFmOamS0KCAhPC5K";
            return APIString;
        },

        reverseDateRange(start){
            let splitArr = start.split("/");
            let retStr = splitArr[2] + "-" + splitArr[0] + "-" + splitArr[1];
            return retStr;
        },

        parseDataForGraph(timeFrame, data){
            console.log(data);
            let newdata = [];
            if(timeFrame == "initial"){
                for(let i = 0; i < data.length; i++){
                    if(data.length - i <= 7){
                        newdata.push(data[i]);
                    }
                }
            }
            else if(timeFrame == "1 Year"){
                for(let i = 0; i < data.length; i++){
                    if(i % 10 == 0){
                        newdata.push(data[i]);
                    }
                }
            }
            else if(timeFrame == "6 Months"){
                let range = data.length / 2;
                range = range.toFixed(0);
                for(let i = range; i < data.length; i++){
                    if(i % 15 == 0){
                        
                        newdata.push(data[i]);
                    }
                }
            }
            //console.log(newdata)
            return newdata;
        },

        getTickerData(timeFrame){
            this.showCanvas = true;
            let stockticker = document.getElementById("tickerData").value;
            let apiURL = this.getDateRangeAndAPIString(stockticker);
            console.log(apiURL);
            
            let year = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            let sevenDay = ["6","5","4","3","2","1","Now"];
            let sixMonth = ["5.5","5","4.5","4","3.5","3","2.5","2","1.5","1",".5","Now"];
            let time = []
            let description = "";
            if(timeFrame == "initial"){
                time = sevenDay;
                description = "1 Week";
            }
            else if(timeFrame == "1 Year"){
                time = year;
                description = "1 Year";
            }
            else if(timeFrame == "6 Months"){
                time = sixMonth;
                description = "6 Months"
            }
            fetch(apiURL)
            .then(response => response.json())
            .then(data => {
                try{
                    let newData = this.parseDataForGraph(timeFrame, data.results);
                    let finalData = [];
                    newData.forEach((open)=>{
                        finalData.push(open.o);
                    })
                    console.log(finalData);
                    if(this.chart != undefined){
                        this.chart.destroy();
                    }

                    
                    const ctx = document.getElementById('chart').getContext('2d');
                    let myChart = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: time,
                            datasets: [{
                                label: stockticker + " " + description,
                                data: finalData,
                                backgroundColor: [
                                    
                                ],
                                borderColor: [
                                    
                                ],
                                borderWidth: 1
                            }]
                        },
                        options: {
                            scales: {
                                y: {
                                    beginAtZero: false
                                }
                            }
                        }
                    });

                    this.chart = myChart;
                } catch(error){
                    alert("5 API Calls Per Minute Reached");
                }
                
                
            });
            

        let searchBtn = document.getElementById("searchButton");
        searchBtn.disabled = true;
        let searchStatus = document.getElementById("searchStatus");
        searchStatus.innerHTML = "Searching...";
        
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
        },

        sellPosition(date){
            $.post("/sellPosition", {username: this.username, date: date}, dataFromServer => {
                //console.log(dataFromServer)
                this.positions = dataFromServer.data.tickerList;
                this.userBalance = dataFromServer.data.balance
            }); 
        }
        
    },
    computed: { //computed properties (methods that compute stuff based on "data" properties)
        //Do not change the value of a property from within these functions.  Side-effects
        //will not be reliable because Vue might skip calls to computed functions as an optimization.
    }
}

let app = Vue.createApp(vm).mount('#main');