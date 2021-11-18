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



# from bs4 import BeautifulSoup

# import requests

# session = requests.session()

# response = session.get('https://www.msn.com/en-us/money/stockdetails/nas-aapl/fi-a1mou2?symbol=AAPL&form=PRMFPS')

# if response.status_code == 200:

#     page = response.text
    
#     soup = BeautifulSoup(page, "lxml")

#     market = soup.find('span', attrs={'class': 'market-status-text'}).text

#     if market == 'US Markets Closed':

#        # do stuff

#         print('closed')

#     else:

#         print('open')

#         # do different stuff


 