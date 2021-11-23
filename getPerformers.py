from bs4 import BeautifulSoup

import requests

session = requests.session()

response = session.get('https://finance.yahoo.com/gainers/')

if response.status_code == 200:

    page = response.text
    
    soup = BeautifulSoup(page, "lxml")

    market = soup.find('tbody').text

    print(market)