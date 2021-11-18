const spawn = require('child_process').spawn;

onmessage = function(e) {

    e.data.forEach((position) =>{
        let tickerData;
        const process = spawn('py', ['./getTickerData.py', ticker])
        process.stdout.on('data', (data)=>{
            tickerData = data.toString();
            //position.profit = (parseFloat(tickerData).toFixed(2) * parseFloat(position.sharesBought)) - parseFloat(position.costOfPurchase);
            position.profit = "1";
        })
    });
    

    data = JSON.parse(JSON.stringify(e.data))
    this.postMessage(data)
};