import requests, time, json
from bs4 import BeautifulSoup
#dinamiskajaam lapaam
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver import Chrome
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from datetime import date
today = date.today()
# dd/mm/YY
d1 = today.strftime("%d/%m/%Y")
#Explicit waits
#try:
#    element = WebDriverWait(browser, 10).until(
#        EC.presence_of_element_located((By.ID, "myDynamicElement"))
#    )
#
rinda = 0
maximacount = rimicount = elvicount = 0
def GetDataMaxima():
	global rinda,maximacount
	chrome_options = Options()
	chrome_options.add_argument("--incognito")
	path = r'C:/Skripti/webdrivers/chromedriver.exe'
	browser = webdriver.Chrome(executable_path=path,options=chrome_options)
	browser.get('https://www.maxima.lv/piedavajumi')

	try:
		time.sleep(2)
		#browser.find_element(By.XPATH, '/html/body/div[9]/div/div/a').click()
		browser.find_element(By.XPATH, '/html/body/div[10]/div/div/a').click()
		browser.find_element(By.XPATH, '/html/body/div[8]/div/div/a').click()
		
	except:
		print("Popups nav atrasts!")
	#click alkohola sadala 
	browser.find_element(By.XPATH, '/html/body/div[4]/div/div[3]/a[14]').click() 
	time.sleep(2)
	#click "raadiit" button, lai ielaadeejas vairaak piedavajumi
	try:
		browser.find_element(By.XPATH, '/html/body/div[5]/div[4]/a').click()
		time.sleep(2)
	except:
		print("Nepastaav vairaakas lapas")
	#nolasiit html
	maximahtml = browser.execute_script("return document.documentElement.outerHTML")
	soup = BeautifulSoup(maximahtml, "html.parser")
	browser.quit()
	##notiira veco json failu un sāk listu
	#with open("sample.json", "w", encoding='utf8') as outfile: 
	#		outfile.write('[\n')
	#rinda=0
	for prece in soup.findAll("div", class_= "col-third"):
		cenainfo = prece.find('div', class_= "title").text
		try:
			cenalitraa = prece.find('div', class_="desc").text
		except:
			cenalitraa = 'None'
		try:
			atlaide = prece.find('span', class_="icon-51").text.strip()
		except:
			atlaide = "None"
		try:
			apaliEuro = prece.find('span', class_="value").text.strip()
		except:
			apaliEuro = "None"
		try:
			apaliCenti = prece.find('span', class_="cents").text.strip()
		except:
			apaliCenti = "None"
		try:
			Bilde = prece.find('img')['src']
		except:
			Bilde = "None"
		try:
			tagiRaw = prece.find('div', class_="tags tags_primary").findAll('div')
			tagi=[]
			for t in tagiRaw:
				tagi.append(t.get('data-alt'))
		except:
			tagi=[]
		#print((cenainfo + ' || ' + cenalitraa + ' || ' + atlaide + ' || ' + apaliEuro + ' || ' + apaliCenti))
		#Katras preces dict->objekts kas tiek konvertets uz pectam uz json 
		JsonObjekts ={
			"Prece" : cenainfo, 
			"Cenalitra" : cenalitraa, 
			"Atlaide" : atlaide, 
			"Euro" : apaliEuro,
			"Centi" : apaliCenti,
			"Vecacena" : "None",
			"Bilde" : Bilde,
			"Veikals" : "Maxima",
			"Info" : tagi
		} 
		# Serializing json  
		json_object = json.dumps(JsonObjekts, indent = 4, ensure_ascii=False) 
		# Writing to sample.json 
		with open("sample.json", "a", encoding='utf8') as outfile: 
			if rinda > 0:
				outfile.write(',\n')
			outfile.write(json_object)
			rinda+=1
	#nobeidz listu
	maximacount = (rinda)
	print(f"No MAXIMA nolasīti {maximacount} produkti")
#rimi loops
def GetDataRimi():
	global rinda, maximacount, rimicount
	ua = {"User-Agent":"Mozilla/5.0"}
	url = "https://www.rimi.lv/piedavajumi"
	page = requests.get(url, headers=ua)

	soup = BeautifulSoup(page.content, "html.parser")
	#preces = soup.findAll("a", {"data-content-category" : "Alkohols"})
	for prece in soup.findAll("a", {"data-content-category" : "Alkohols"}):
		nosaukums = (prece.attrs['data-gtm-click-name'])
		#piedNr = (prece.attrs['data-offer-id'])
		try:
			cenainfo = prece.find('div', class_="offer-card__weight").text
			cenainfo2 = "".join(line.strip() for line in cenainfo.split("\n"))
		except:
			cenainfo2 = 'None'
		try:
			#atlaideprocunsplit = prece.find('div', class_="badge_c").text.strip()
			atlaideprocunsplit = prece.find('div', class_="badge_c").find('div', class_="text").text.strip()
			atlaideproc = "".join(line.strip() for line in atlaideprocunsplit.split("\n")) 

		except:
			atlaideproc = 'None'
		try:
			apaliEuro = prece.find('div', class_="euro").text.strip()
			apaliCenti = prece.find('div', class_="cents").text.strip()
		except:
			apaliCenti = apaliEuro = 'None'

		try:
			b4price = prece.find('span', class_="old-price").text
		except:
			b4price = "None"
		try:
			divBilde = prece.find('div', class_="offer-card__image-cloudinary")
			Bilde=divBilde.attrs.get('data-image-url')
			#<div class="offer-card__image-cloudinary js-offer-image is-loaded" data-image-url="https://rimibaltic-web-res.cloudinary.com/image/upload/b_white,c_fit,f_auto,h_320,q_auto,w_320/v2020041215/web-leaflet/LEAFLET_20200403053505_LV.jpg" style="background-image: url(&quot;https://rimibaltic-web-res.cloudinary.com/image/upload/b_white,c_fit,f_auto,h_320,q_auto,w_320/v2020041215/web-leaflet/LEAFLET_20200403053505_LV.jpg&quot;);"></div>
			if Bilde is None:
				Bilde = "None"
		except:
			Bilde="None"

		JsonObjekts ={
			"Prece" : nosaukums, 
			"Cenalitra" : cenainfo2, 
			"Atlaide" : atlaideproc, 
			"Euro" : apaliEuro,
			"Centi" : apaliCenti,
			"Vecacena" : b4price,
			"Bilde" : Bilde,
			"Veikals" : "Rimi",
			"Info" : "Vecā cena: " + b4price
		} 
		json_object = json.dumps(JsonObjekts, indent = 4, ensure_ascii=False) 
		with open("sample.json", "a", encoding='utf8') as outfile: 
			if rinda > 0:
				outfile.write(',\n')
			outfile.write(json_object)
			rinda+=1
	rimicount= ((rinda+1)-maximacount)
	print(f"No RIMI nolasīti {rimicount} produkti")
		#print(nosaukums + " || " + cenainfo2 + " || " + b4price + " || " + atlaideproc + " || " + apaliEuro + " || " + apaliCenti + " || " + piedNr)
###ELVI###
def GetDataElvi():
	global rinda, maximacount, rimicount, elvicount
	chrome_options = Options()
	chrome_options.add_argument("--incognito")
	path = r'C:/Skripti/webdrivers/chromedriver.exe'
	browser = webdriver.Chrome(executable_path=path,options=chrome_options)
	browser.get('http://elvi.lv/akcijas-avize/alkoholiskie-dzerieni/')
	#Show more button spam on a broken webpage
	for _ in range(10):
		try:
			time.sleep(0.5)
			browser.execute_script("window.scrollTo(0, document.body.scrollHeight);")
			time.sleep(1)
			browser.find_element_by_xpath("//*[text()='Rādīt vēl...']").click()
		except:
			print("Could not press Load more button!")
			break
	#nolasa html ar ielaadeetajiem obejktiem
	elvihtml = browser.execute_script("return document.documentElement.outerHTML")
	soup = BeautifulSoup(elvihtml, "html.parser")
	browser.quit()
	#cycle caur akcijaam
	for prece in soup.findAll("div", class_= "product-wrapper"):
		Bilde = prece.find('img')['src']
		nosaukums = prece.find('div', class_= "title").find('a').text
		cenainfo = prece.find('div', class_= "title").find('span').text
		cena = prece.find('div', class_= "col discount").find('p').text[:-1]
		apaliEuro, apaliCenti= cena.split(".")
		try:
			b4price = prece.find('div', class_="col discount").find('span').text
		except:
			b4price = "None"
		if b4price == "Pērkot vairāk!":
			cenalitra = "Pērkot " + prece.find('div', class_="tooltip moreless tooltipstered").text
		else:
			cenalitra = "None"
		JsonObjekts ={
			"Prece" : nosaukums, 
			"Cenalitra" : cenalitra, 
			"Atlaide" : "None", 
			"Euro" : apaliEuro,
			"Centi" : apaliCenti,
			"Vecacena" : b4price,
			"Bilde" : Bilde,
			"Veikals" : "Elvi",
			"Info" : cenainfo
		}
		json_object = json.dumps(JsonObjekts, indent = 4, ensure_ascii=False) 
		with open("sample.json", "a", encoding='utf8') as outfile: 
			if rinda > 0:
				outfile.write(',\n')
			outfile.write(json_object)
			rinda+=1
	elvicount= ((rinda+1)-maximacount-rimicount)
	print(f"No ELVI nolasīti {elvicount} produkti")

###################################palaizh funkcijas#################################
#notiira veco json failu un sāk listu
with open("sample.json", "w", encoding='utf8') as outfile: 
		outfile.write('[\n')

GetDataMaxima()
GetDataRimi()
GetDataElvi()

with open("sample.json", "a", encoding='utf8') as outfile: 
		outfile.write('\n]')
RemoverT = open("sample.json", "rt",encoding='utf-8')
dataJson = RemoverT.read()
dataJson = dataJson.replace('Alkohola lietošanai ir negatīva ietekme. Alkoholisko dzērienu pārdošana, iegāde un nodošana nepilngadīgām personām ir aizliegta.<br>', '')
dataJson = dataJson.replace('Alkohola lietošanai ir negatīva ietekme. Alkoholisko dzērienu pārdošana, iegāde un nodošana nepilngadīgām personām ir aizliegta<br>', '')
RemoverT.close()

RemoverT = open("sample.json", "wt",encoding='utf-8')
RemoverT.write(dataJson)
RemoverT.close()