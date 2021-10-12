import yfinance as yf
import sys

arguments = str(sys.argv)
arguments = str(arguments)
arguments = arguments[::-1]
apostropheCnt = 0
ticker = ""
for x in arguments:
    if x == "'":
        apostropheCnt += 1
    if x == "]":
        continue
    else:
        ticker += x
    if apostropheCnt == 2:
        break

ticker = ticker[::-1]
ticker = ticker.replace("'", "")

try:
    retArr = []
    data = yf.Ticker(ticker)
    currentPrice = str(data.info['regularMarketPrice'])
    openPrice = str(data.info['regularMarketOpen'])
    prevClosingPrice = str(data.info['previousClose'])
    fiftyDayAvg = str(data.info['fiftyDayAverage'])
    dayHigh = str(data.info['dayHigh'])
    dayLow = str(data.info['dayLow'])
    fifty2WeekLow = str(data.info['fiftyTwoWeekLow'])
    fifty2WeekHigh = str(data.info['fiftyTwoWeekHigh'])
    #fiftyTwoWeekLow
    #fiftyTwoWeekHigh
    #dayHigh
    #dayLow
    retArr.append(currentPrice)
    retArr.append(openPrice)
    retArr.append(prevClosingPrice)
    retArr.append(fiftyDayAvg)
    retArr.append(dayHigh)
    retArr.append(dayLow)
    retArr.append(fifty2WeekLow)
    retArr.append(fifty2WeekHigh)
    print(retArr)
except:
    print("Error getting ticker data")