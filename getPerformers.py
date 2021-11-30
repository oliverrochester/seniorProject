from bs4 import BeautifulSoup
import requests
import re

url = "https://finance.yahoo.com/gainers/"
try:
    r = requests.get(url)
    soup = BeautifulSoup(r.content, 'lxml')
    table = soup.find('table', {'class': 'W(100%)'})
    regex = r"(title=\"((\w+ ?)*))"
    ans = re.findall(regex, str(table))
    retArr = []
    for match in ans:
        retArr.append(match[1])
    print(retArr)
except:
    print("False")


    