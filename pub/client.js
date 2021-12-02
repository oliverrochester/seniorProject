
let vm = {
    data() {
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
            performers: [],
            chartData: null,
            news: [],
            hasNews: false,
            greenColor: 'green',
            redColor: 'red',
        }
    }, 
    methods: {
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
            this.scrapeWebForTopPerformers()
            
        },

        scrapeWebForTopPerformers(){
            let newDataArr = [];
            $.post("/getTopPerformers", {}, dataFromServer => {
                console.log(dataFromServer.topPerformers)
                console.log(typeof(dataFromServer.topPerformers))
                let dataArr = dataFromServer.topPerformers.split(", ");
                for(let i = 0; i < dataArr.length; i++){
                    
                    let x = this.removeBadChars(dataArr[i])
                    newDataArr.push(x)
                }
                this.performers = newDataArr;
            });
        },

        removeBadChars(str){
            let retStr = ''
            for(let i = 0; i < str.length; i++){
                if(str[i] == "'"){
                    continue
                }
                else if(str[i] == "]"){
                    continue
                }
                else if(str[i] == "["){
                    continue
                }
                else{
                    retStr += str[i];
                }
            }
            return retStr;
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
                            newBalance = (this.userBalance - costOfPurchase).toFixed(2);
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
            if(dateNowCorrect[dateNowCorrect.length-2] == "-"){
                oldDate = oldDate.substring(0, 7) + "-0" + oldDate.substring(8, oldDate.length);
                dateNowCorrect = dateNowCorrect.substring(0, 7) + "-0" + dateNowCorrect.substring(8, dateNowCorrect.length);
            }

            console.log(oldDate);
            console.log(dateNowCorrect);
            
            let APIString = 'https://api.polygon.io/v2/aggs/' + "ticker/" + ticker + '/range/1/day/' + oldDate + "/" + dateNowCorrect + "?apiKey=Sj2WpljTfw42jRUGXFmOamS0KCAhPC5K";
            return APIString;                                                                                                                                                                                      
        },

        reverseDateRange(start){
            let splitArr = start.split("/");
            let retStr = splitArr[2] + "-" + splitArr[0] + "-" + splitArr[1];
            return retStr;
        },

        parseDataForGraph(timeFrame){
            let newdata = [];
            if(timeFrame == "initial"){
                for(let i = 0; i < this.chartData.length; i++){
                    if(this.chartData.length - i <= 7){
                        newdata.push(this.chartData[i]);
                    }
                }
            }
            else if(timeFrame == "1 Year"){
                for(let i = 0; i < this.chartData.length; i++){
                    
                    newdata.push(this.chartData[i]);
                    
                }
            }
            else if(timeFrame == "6 Months"){
                let range = this.chartData.length / 2;
                range = range.toFixed(0);
                for(let i = range; i < this.chartData.length; i++){
                    newdata.push(this.chartData[i]);           
                }
            }
            return newdata;
            
        },

        changeChart(timeFrame){
            if(this.chart != undefined){
                this.chart.destroy();
            }
            let stockticker = document.getElementById("tickerData").value;
            let newData = this.parseDataForGraph(timeFrame);
            let newTime = [];
            
            for(let i = 0; i < newData.length; i++){
                newTime.push(i);
            }
            let lineColor;
            let lastIndex = newData.length - 1;
            if(newData[0] >= newData[lastIndex]){
                lineColor = "Red";
            }
            else{
                lineColor = "Green";
            }
            const ctx = document.getElementById('chart').getContext('2d');
            let myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: newTime,
                    datasets: [{
                        label: stockticker + " " + timeFrame,
                        data: newData,
                        backgroundColor: null,
                        
                        borderColor: lineColor,
                        borderWidth: 1,
                        pointRadius: 0,
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
        },

        getNews(ticker){
            let apiURL1 = "https://api.marketaux.com/v1/news/all?symbols="
            let apiURL2 = "&filter_entities=true&language=en&api_token=hB8F0psRHewWAFT8K4svlHvsm6DDtbigLgSxFzAh"
            let finalAPI = apiURL1 + ticker + apiURL2;
            fetch(finalAPI)
            .then(response => response.json())
            .then(data => {
                console.log("news");
                console.log(data);
                let newsArr = [];
                data.data.forEach((newsStory)=>{
                    let obj = {};
                    obj.title = newsStory.title;
                    obj.image = newsStory.image_url;
                    newsArr.push(obj);
                })
                this.news = newsArr;
                this.hasNews = true;
            });
        },

        getTickerData(timeFrame){
            //api key   hB8F0psRHewWAFT8K4svlHvsm6DDtbigLgSxFzAh
            this.showCanvas = true;
            let stockticker = document.getElementById("tickerData").value;
            let apiURL = this.getDateRangeAndAPIString(stockticker);
            
            let description = "";
            if(timeFrame == "initial"){                
                description = "1 Week";
            }
            else if(timeFrame == "1 Year"){
                description = "1 Year";
            }
            else if(timeFrame == "6 Months"){
                description = "6 Months"
            }
            fetch(apiURL)
            .then(response => response.json())
            .then(data => {
                try{
                    console.log(data);
                    let newTime = [];
                    let newData = [];
                    data.results.forEach((open)=>{
                        newData.push(open.o);
                    })
                    this.chartData = newData;
                    let finalData = this.parseDataForGraph(timeFrame);     

                    for(let i = 0; i < finalData.length; i++){
                        newTime.push(i);
                    }
                    
                    if(this.chart != undefined){
                        this.chart.destroy();
                    }

                    let lineColor;
                    let lastIndex = finalData.length - 1;
                    if(finalData[0] >=finalData[lastIndex]){
                        lineColor = "Red";
                    }
                    else{
                        lineColor = "Green";
                    }
                    
                    const ctx = document.getElementById('chart').getContext('2d');
                    let myChart = new Chart(ctx, {
                        type: 'line',
                        data: {
                            labels: newTime,
                            datasets: [{
                                label: stockticker + " " + description,
                                data: finalData,
                                backgroundColor: [
                                    
                                ],
                                borderColor: lineColor,
                                borderWidth: 1,
                                pointRadius: 0,
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
                    console.log(error)
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

        this.getNews(stockticker);
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
                this.userBalance = dataFromServer.data.balance;
                let newProfit = 0.0;
                this.positions.forEach((pos)=>{
                    newProfit += parseFloat(pos.profit);
                })
                this.totalProfits = newProfit;
            }); 
        },

        restartFresh(){
            $.post("/restartFresh", {username: this.username}, dataFromServer => {
                //console.log(dataFromServer)
                this.positions = dataFromServer.data.tickerList;
                this.userBalance = dataFromServer.data.balance;
                this.totalProfits = 0.00;
            });
        }
        
    },
    computed: {
    }
}

let app = Vue.createApp(vm).mount('#main');