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
    data = yf.Ticker(ticker)
    currentPrice = data.info['regularMarketPrice']
    print(str(currentPrice))
except:
    print("Error getting ticker data")



 