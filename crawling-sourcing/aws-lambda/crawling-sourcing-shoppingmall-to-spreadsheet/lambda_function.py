from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.oauth2.credentials import Credentials
from google.oauth2 import service_account
from google.auth.transport.requests import Request
import os.path
import json


from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import StaleElementReferenceException
from selenium.common.exceptions import NoSuchElementException
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse, quote
import time 
import random




def oauth():
    SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
    creds_filename = 'test-daebong-service-account.json'  # 서비스 계정 파일 경로를 지정합니다.

    # 서비스 계정 파일을 사용하여 인증 정보를 로드합니다.
    creds = service_account.Credentials.from_service_account_file(creds_filename, scopes=SCOPES)
    return creds



def extract_number_from_text(text):
    # 쉼표 제거
    no_comma = text.replace(",", "")
    # 원화 기호 및 문자 제거
    only_numbers = ''.join(filter(str.isdigit, no_comma))
    return int(only_numbers)







def lambda_handler(event, context):
    # TODO implement
    print(event, context)


    creds = oauth()
    service_sheets = build('sheets', 'v4', credentials=creds)

    update_data_list = []
    

    SPREADSHEET_ID = '1c1ZpmyWI1bqcaaUTgzpA0SKpxcXSfZ3PhWYHmLVAhRU'
    search_keyword = event["search_keyword"]
    search_start_page = event["search_start_page"]
    search_end_page = event["search_end_page"]
    start_column = event["start_column"]
    spreadsheet_name = event["sheet_name"]
    spreadsheet_range = f'{spreadsheet_name}!A{start_column}:H'


    try:
        for page in range(int(search_start_page), int(search_end_page)):
            crawling_list = crawlingData(page, search_keyword)
            update_data_list += crawling_list
        update_sheets_by_2_dimension_list(service_sheets, SPREADSHEET_ID, spreadsheet_range, update_data_list)


    except HttpError as error:
        # HttpError에서 응답 코드와 메시지를 추출합니다.
        error_code = error.resp.status
        try:
            # 오류 응답 본문을 JSON 객체로 파싱합니다.
            error_details = json.loads(error.content.decode())
            error_message = error_details.get('error', {}).get('message', 'Unknown error')
        except json.JSONDecodeError:
            # 오류 응답 본문이 JSON이 아닌 경우, 일반 텍스트로 처리합니다.
            error_message = error.content.decode()

        print(f"An error occurred: {error}")
        return {
            'statusCode': error_code,  # HTTP 상태 코드를 응답에 설정합니다.
            'body': json.dumps({"error": error_message})  # 오류 메시지를 JSON 응답에 포함시킵니다.
        }

    return {
        'statusCode': 200,
        'body': json.dumps({"result": "Success", "message": "Formula applied successfully"})
    }








def coupang_crawling(driver):
    try:

        time.sleep(10)  # 로드 시간에 따라 조절 가능
        product_title = driver.find_element(By.CSS_SELECTOR, ".new-header").text.strip()  
        print("product_title", product_title)

        
        

        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".tab-titles")))  

        product_title = driver.find_element(By.CSS_SELECTOR, ".prod-buy-header__title").text.strip()  

        time.sleep(random.uniform(1, 5))  # 로드 시간에 따라 조절 가능

        tab_name = driver.find_element(By.NAME, "etc").text.strip()
        print("tab_name", tab_name)
        
        pricing = driver.find_element(By.CSS_SELECTOR, ".total-price strong").text.strip()  
        time.sleep(random.uniform(0.1, 0.3))  # 로드 시간에 따라 조절 가능
        # button_click = driver.find_element(By.NAME, "etc")
        # driver.execute_script("arguments[0].click();", button_click)
        driver.find_element(By.NAME, "etc").click()

        time.sleep(random.uniform(0.1, 0.3))  # 로드 시간에 따라 조절 가능

        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".product-seller")))  # 새 창에서 콘텐츠가 로드될 때까지 대기
        partner_info_after_click = driver.find_element(By.CSS_SELECTOR, ".product-seller")
        partner_table = partner_info_after_click.find_element(By.CSS_SELECTOR, ".prod-delivery-return-policy-table tbody")
        partner_table_element = partner_table.find_elements(By.CSS_SELECTOR, "tr")

        if len(partner_table_element) <= 1:
            biz_name = driver.find_element(By.CSS_SELECTOR, ".product-seller table.prod-delivery-return-policy-table tbody > tr:nth-child(1) > td:nth-child(2)").text.strip()
            print(biz_name, "의 상품입니다")
            return []
        else:
            biz_name = driver.find_element(By.CSS_SELECTOR, ".product-seller table.prod-delivery-return-policy-table tbody > tr:nth-child(1) > td:nth-child(2)").text.strip()

    # e-mail 정보 추출
            biz_email = driver.find_element(By.CSS_SELECTOR, ".product-seller table.prod-delivery-return-policy-table tbody > tr:nth-child(2) > td:nth-child(2)").text.strip()

    # 연락처 정보 추출
            biz_phone = driver.find_element(By.CSS_SELECTOR, ".product-seller table.prod-delivery-return-policy-table tbody > tr:nth-child(2) > td:nth-child(4)").text.strip()
            current_url = driver.current_url
            print("New Window URL:", current_url)
            print(product_title, biz_name,biz_email, biz_phone)
            print("last_cupang", current_url, "쿠팡", product_title, biz_name, biz_phone, biz_email, extract_number_from_text(pricing))
            
            return [current_url, "쿠팡", product_title, biz_name, biz_phone, biz_email, extract_number_from_text(pricing)]
    except Exception as e:  # 모든 예외를 잡으며, 'e' 변수에 예외 객체를 할당
        print("예외 발생:", e)  # 예외 객체의 문자열 표현을 출력







def tmon_crawling(driver):
    try:
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".partner_info")))  # 새 창에서 콘텐츠가 로드될 때까지 대기
        pricing = driver.find_element(By.CSS_SELECTOR, ".deal_price_sell .number_unit").text.strip()
        # shop_content = driver.find_elements(By.CSS_SELECTOR, "body")
        time.sleep(random.uniform(0.1, 0.3))

        partner_info = driver.find_element(By.CSS_SELECTOR, ".partner_info")
        time.sleep(random.uniform(0.1, 0.3))

        driver.find_element(By.CSS_SELECTOR, ".tab-navigation li:nth-child(4) > a").click()
        time.sleep(random.uniform(0.1, 0.3))

        partner_button_click = driver.find_element(By.CSS_SELECTOR, ".partner_info button")
        driver.execute_script("arguments[0].click();", partner_button_click)
        time.sleep(random.uniform(0.1, 0.3))

        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".partner_info .slide-ct div table tbody > tr:nth-child(1) > td:nth-child(2)")))  # 새 창에서 콘텐츠가 로드될 때까지 대기

        partner_info_after_click = driver.find_element(By.CSS_SELECTOR, ".partner_info .slide-ct div table tbody")
        product_title = driver.find_element(By.CSS_SELECTOR, ".deal_title_main").text.strip()  

        table_item = partner_info_after_click.find_elements(By.CSS_SELECTOR, "tr")

        if len(table_item) <= 5:
            biz_name = partner_info_after_click.find_element(By.CSS_SELECTOR, "tr:nth-child(1) > td:nth-child(2)").text.strip()  
            biz_email = partner_info_after_click.find_element(By.CSS_SELECTOR, "tr:nth-child(4) > td:nth-child(2)").text.strip()  
            biz_phone = partner_info_after_click.find_element(By.CSS_SELECTOR, "tr:nth-child(5) > td:nth-child(2)").text.strip()  
        elif len(table_item) > 5:
            biz_name = partner_info_after_click.find_element(By.CSS_SELECTOR, "tr:nth-child(1) > td:nth-child(2)").text.strip()  
            biz_email = partner_info_after_click.find_element(By.CSS_SELECTOR, "tr:nth-child(6) > td:nth-child(2)").text.strip()  
            biz_phone = partner_info_after_click.find_element(By.CSS_SELECTOR, "tr:nth-child(7) > td:nth-child(2)").text.strip()  


        current_url = driver.current_url
            
        return [current_url, "티몬", product_title, biz_name, biz_phone, biz_email, extract_number_from_text(pricing)]
    except Exception as e:  # 모든 예외를 잡으며, 'e' 변수에 예외 객체를 할당
                        print("예외 발생:", e)  # 예외 객체의 문자열 표현을 출력
    


def plus_wemakeprice_crawling(driver):
    try:
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CSS_SELECTOR, "#div_seller_detail_info_list")))  # 새 창에서 콘텐츠가 로드될 때까지 대기

        # shop_content = driver.find_elements(By.CSS_SELECTOR, "body")

        product_title = driver.find_element(By.CSS_SELECTOR, "#goods_name").text.strip()  
        pricing = driver.find_element(By.CSS_SELECTOR, ".price__num").get_attribute("data-price")
        
        seller_info = driver.find_element(By.CSS_SELECTOR, "#div_seller_detail_info_list")    

        biz_name = seller_info.find_element(By.CSS_SELECTOR, "tbody > tr:nth-child(1) > td").text.strip()  
        biz_phone = seller_info.find_element(By.CSS_SELECTOR, "tbody > tr:nth-child(2) > td").text.strip()
        biz_email = seller_info.find_element(By.CSS_SELECTOR, "tbody > tr:nth-child(3) > td").text.strip()  
        

        current_url = driver.current_url
            
        return [current_url, "위메프플러스", product_title, biz_name, biz_phone, biz_email, extract_number_from_text(pricing)]
    except Exception as e:  # 모든 예외를 잡으며, 'e' 변수에 예외 객체를 할당
                        print("예외 발생:", e)  # 예외 객체의 문자열 표현을 출력


def wemakeprice_crawling(driver):
    try:
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".tab_info")))  # 새 창에서 콘텐츠가 로드될 때까지 대기

        product_title = driver.find_element(By.CSS_SELECTOR, ".deal_tit").text.strip()  
        pricing = driver.find_element(By.CSS_SELECTOR, ".sale_price .num").text.strip()  


        driver.find_element(By.CSS_SELECTOR, ".tab_info .on a").click()

        time.sleep(random.uniform(0.1, 0.3))  # 로드 시간에 따라 조절 가능

        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".deal_shipinfo.box + .table_box")))  # 새 창에서 콘텐츠가 로드될 때까지 대기

        
        seller_info = driver.find_element(By.CSS_SELECTOR, ".deal_shipinfo.box + .table_box")    

        biz_name = seller_info.find_element(By.CSS_SELECTOR, "tbody > tr:nth-child(2) > td").text.strip()  
        biz_phone = seller_info.find_element(By.CSS_SELECTOR, "tbody > tr:nth-child(3) > td").text.strip()
        biz_email = seller_info.find_element(By.CSS_SELECTOR, "tbody > tr:nth-child(4) > td").text.strip()  
        

        current_url = driver.current_url
            
        return [current_url, "위메프", product_title, biz_name, biz_phone, biz_email, extract_number_from_text(pricing)]
    except Exception as e:  # 모든 예외를 잡으며, 'e' 변수에 예외 객체를 할당
        print("예외 발생:", e)  # 예외 객체의 문자열 표현을 출력

    

def gmarket_crawling(driver):
    try:
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".vip-tabnavi.uxeposfix")))  # 새 창에서 콘텐츠가 로드될 때까지 대기

        product_title = driver.find_element(By.CSS_SELECTOR, ".itemtit").text.strip()  
        pricing = driver.find_element(By.CSS_SELECTOR, ".price_real").text.strip()  

        driver.find_element(By.CSS_SELECTOR, ".vip-tabnavi.uxeposfix ul li:nth-child(4) a").click()

        time.sleep(random.uniform(0.1, 0.3))  # 로드 시간에 따라 조절 가능

        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".box__exchange-guide")))  # 새 창에서 콘텐츠가 로드될 때까지 대기

        
        seller_info = driver.find_element(By.CSS_SELECTOR, ".box__exchange-guide > div:nth-child(6)")    

        # 상호명 추출을 위한 CSS 선택자 수정 예시
        title = seller_info.find_element(By.CSS_SELECTOR, ".text__exchange-title").text.strip()
        biz_name = seller_info.find_element(By.CSS_SELECTOR, ".list__exchange-data .list-item:nth-child(1) .text__deco").text.strip()

        # 대표자명 추출을 위한 CSS 선택자 수정 예시
        ceo_name = seller_info.find_element(By.CSS_SELECTOR, ".list__exchange-data .list-item:nth-child(2) .text__deco").text.strip()
        biz_phone = seller_info.find_element(By.CSS_SELECTOR, ".list__exchange-data > li:nth-child(3) span").text.strip()
        biz_email = seller_info.find_element(By.CSS_SELECTOR, ".list__exchange-data > li:nth-child(7) span").text.strip()
        

        current_url = driver.current_url
            
        return [current_url, "G마켓", product_title, biz_name + "-" + ceo_name, biz_phone, biz_email, extract_number_from_text(pricing)]
    except Exception as e:  # 모든 예외를 잡으며, 'e' 변수에 예외 객체를 할당
        print("예외 발생:", e)  # 예외 객체의 문자열 표현을 출력

    

def interpark_crawling(driver):
    try:
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".sellerArea")))  # 새 창에서 콘텐츠가 로드될 때까지 대기

        # shop_content = driver.find_elements(By.CSS_SELECTOR, "body")

        product_title = driver.find_element(By.CSS_SELECTOR, ".productName .subject").text.strip()  
        pricing = driver.find_element(By.CSS_SELECTOR, ".salePrice > em").text.strip()
        
        seller_info = driver.find_element(By.CSS_SELECTOR, ".sellerArea .infoContent")    

        biz_name = seller_info.find_element(By.CSS_SELECTOR, ".info:nth-child(1) > dd").text.strip()  
        biz_ceo = seller_info.find_element(By.CSS_SELECTOR, ".info:nth-child(2) > dd").text.strip()  
        biz_phone = seller_info.find_element(By.CSS_SELECTOR, ".info:nth-child(3) > dd").text.strip()
        biz_email = seller_info.find_element(By.CSS_SELECTOR, ".info:nth-child(6) > dd").text.strip()  
        

        current_url = driver.current_url
            
        return [current_url, "인터파크", product_title, biz_name + "/" + biz_ceo, biz_phone, biz_email, extract_number_from_text(pricing)]
    except Exception as e:  # 모든 예외를 잡으며, 'e' 변수에 예외 객체를 할당
                        print("예외 발생:", e)  


def auction_crawling(driver):
    try:
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".vip-tabcontent.vip-tabcontent_lt.tabview_exchange")))  # 새 창에서 콘텐츠가 로드될 때까지 대기

        # shop_content = driver.find_elements(By.CSS_SELECTOR, "body")

        product_title = driver.find_element(By.CSS_SELECTOR, ".itemtit").text.strip()  
        pricing = driver.find_element(By.CSS_SELECTOR, ".price_real").text.strip()
        

        driver.find_element(By.CSS_SELECTOR, "#tap_moving_4 > a").click()

        time.sleep(random.uniform(0.1, 0.3))  # 로드 시간에 따라 조절 가능

        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".vip-tabcontent.vip-tabcontent_lt.tabview_exchange > .box__exchange-guide")))  # 새 창에서 콘텐츠가 로드될 때까지 대기

        seller_info = driver.find_element(By.CSS_SELECTOR, ".vip-tabcontent.vip-tabcontent_lt.tabview_exchange > .box__exchange-guide")    
        
        # biz_title = seller_info.find_element(By.CSS_SELECTOR, ".text__exchange-title").text.strip()  
        # print(biz_title)
        # print(seller_info.text.strip())

        biz_name = seller_info.find_element(By.CSS_SELECTOR, ".list__exchange-data .list-item:nth-child(1) > .text__deco").text.strip()  
        biz_ceo = seller_info.find_element(By.CSS_SELECTOR, ".list__exchange-data .list-item:nth-child(2) > .text__deco").text.strip()  
        biz_phone = seller_info.find_element(By.CSS_SELECTOR, ".list__exchange-data .list-item:nth-child(3) > .text__deco").text.strip()  
        biz_email = seller_info.find_element(By.CSS_SELECTOR, ".list__exchange-data .list-item:nth-child(7) > .text__deco").text.strip()  
        

        current_url = driver.current_url
            
        return [current_url, "옥션", product_title, biz_name + "/" + biz_ceo, biz_phone, biz_email, extract_number_from_text(pricing)]
    except Exception as e:  # 모든 예외를 잡으며, 'e' 변수에 예외 객체를 할당
        print("예외 발생:", e)




def lotte_on_crawling(driver):
    try:
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".scrollTabWrapper li:nth-child(4) > a")))  # 새 창에서 콘텐츠가 로드될 때까지 대기

        # shop_content = driver.find_elements(By.CSS_SELECTOR, "body")

        product_title = driver.find_element(By.CSS_SELECTOR, ".pd-widget1__product-name").text.strip()  
        pricing = driver.find_element(By.CSS_SELECTOR, ".pd-price__info--number").text.strip()

        try:
            driver.find_element(By.CSS_SELECTOR, ".popupClose").click()
        except:
            print("팝업이 없습니다.")

        time.sleep(random.uniform(0.1, 0.3))  # 로드 시간에 따라 조절 가능

        driver.find_element(By.CSS_SELECTOR, ".scrollTabWrapper > li:nth-child(4) > a > strong").click()

        time.sleep(random.uniform(0.1, 0.3))  # 로드 시간에 따라 조절 가능

        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".detailContents.deliveryInfo .productCollapseContents:nth-child(1) .guideContents:nth-child(1)")))  # 새 창에서 콘텐츠가 로드될 때까지 대기


        # seller_info = driver.find_element(By.CSS_SELECTOR, ".detailContents.deliveryInfo .productCollapseContents:nth-child(1) div:nth-child(2) > .collapseContents > div:nth-child(1) > > div:nth-child(2) > table")    
        seller_info = driver.find_element(By.CSS_SELECTOR, "table")    
        
        # print(seller_info.text.strip())

        biz_name = seller_info.find_element(By.CSS_SELECTOR, "tr:nth-child(3) > td:nth-child(2)").text.strip()  
        biz_ceo = seller_info.find_element(By.CSS_SELECTOR, "tr:nth-child(4) > td:nth-child(2)").text.strip()  
        biz_phone = seller_info.find_element(By.CSS_SELECTOR, "tr:nth-child(8) > td:nth-child(2)").text.strip()  
        biz_email = seller_info.find_element(By.CSS_SELECTOR, "tr:nth-child(9) > td:nth-child(2)").text.strip()  
        

        current_url = driver.current_url
            
        return [current_url, "롯데ON", product_title, biz_name + "/" + biz_ceo, biz_phone, biz_email, extract_number_from_text(pricing)]
    except Exception as e:  # 모든 예외를 잡으며, 'e' 변수에 예외 객체를 할당
        print("예외 발생:", e)

    

def street11_crawling(driver):
    try:
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CSS_SELECTOR, "#tabpanelDetail4")))  # 새 창에서 콘텐츠가 로드될 때까지 대기

        seller_info = driver.find_element(By.CSS_SELECTOR, "#tabpanelDetail4 .prodc_return_wrap .prdc_detail_table:nth-child(9)")    
        product_title = driver.find_element(By.CSS_SELECTOR, ".c_product_info_title .title").text.strip()  
        pricing = driver.find_element(By.CSS_SELECTOR, ".price_block .price .value").text.strip()
        
        biz_infos = seller_info.find_elements(By.CSS_SELECTOR, "tr")

        if len(biz_infos) <= 5:
            biz_name = seller_info.find_element(By.CSS_SELECTOR, "tbody tr:nth-child(1) td:nth-child(2)").text.strip()  
            biz_ceo = seller_info.find_element(By.CSS_SELECTOR, "tbody tr:nth-child(1) td:nth-child(4)").text.strip()
            biz_phone = seller_info.find_element(By.CSS_SELECTOR, "tbody tr:nth-child(2) td:nth-child(4)").text.strip()
            biz_email = seller_info.find_element(By.CSS_SELECTOR, "tbody tr:nth-child(4) td:nth-child(2)").text.strip()
        elif len(biz_infos) <= 6:
            biz_name = seller_info.find_element(By.CSS_SELECTOR, "tbody tr:nth-child(1) td:nth-child(2)").text.strip()  
            biz_ceo = seller_info.find_element(By.CSS_SELECTOR, "tbody tr:nth-child(2) td:nth-child(2)").text.strip()
            biz_phone = seller_info.find_element(By.CSS_SELECTOR, "tbody tr:nth-child(3) td:nth-child(4)").text.strip()
            biz_email = seller_info.find_element(By.CSS_SELECTOR, "tbody tr:nth-child(5) td:nth-child(2)").text.strip()
        elif len(biz_infos) <= 8:
            biz_name = seller_info.find_element(By.CSS_SELECTOR, "tbody tr:nth-child(1) td:nth-child(2)").text.strip()  
            biz_ceo = seller_info.find_element(By.CSS_SELECTOR, "tbody tr:nth-child(2) td:nth-child(2)").text.strip()
            biz_phone = seller_info.find_element(By.CSS_SELECTOR, "tbody tr:nth-child(3) td:nth-child(2)").text.strip()
            biz_email = seller_info.find_element(By.CSS_SELECTOR, "tbody tr:nth-child(4) td:nth-child(2)").text.strip()
        

        current_url = driver.current_url
            
        return [current_url, "11번가", product_title, biz_name + "/" + biz_ceo, biz_phone, biz_email, extract_number_from_text(pricing)]
    except Exception as e:  # 모든 예외를 잡으며, 'e' 변수에 예외 객체를 할당
                        print("예외 발생:", e)


def lotte_home_crawling(driver):
    try:
        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".division_product_tab")))  # 새 창에서 콘텐츠가 로드될 때까지 대기

        driver.find_element(By.CSS_SELECTOR, ".division_product_tab .tab2 > a").click()

        time.sleep(random.uniform(0.1, 0.3))  # 로드 시간에 따라 조절 가능

        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".wrap_detail.content2 .detail .row_info:nth-child(3) .table_1")))  # 새 창에서 콘텐츠가 로드될 때까지 대기

        seller_info = driver.find_element(By.CSS_SELECTOR, ".wrap_detail.content2 .detail .row_info:nth-child(3) .table_1")    
        product_title = driver.find_element(By.CSS_SELECTOR, ".title_product .tit").text.strip()  
        pricing = driver.find_element(By.CSS_SELECTOR, ".price_product.price_black .num").text.strip()
        

        biz_name = seller_info.find_element(By.CSS_SELECTOR, "tbody tr:nth-child(13) td:nth-child(2)").text.strip()  
        biz_phone = seller_info.find_element(By.CSS_SELECTOR, "tbody tr:nth-child(15) td:nth-child(2)").text.strip()
        biz_email = ""
        

        current_url = driver.current_url
            
        return [current_url, "롯데홈쇼핑", product_title, biz_name, biz_phone, biz_email, extract_number_from_text(pricing)]
    except Exception as e:  # 모든 예외를 잡으며, 'e' 변수에 예외 객체를 할당
        print("예외 발생:", e)



def crawlingData(page, search_keyword):
    options = Options()
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_argument("--headless")  # 헤드리스 모드 옵션 수정

    driver = webdriver.Chrome('/opt/chromedriver', options=options)

    crawling_list = []

    try:
        # 페이지 로드
        url = f'https://search.danawa.com/dsearch.php?query={search_keyword}&checkedInfo=N&volumeType=allvs&page={page}&limit=40&sort=priceASC&list=list&boost=true&tab=main&addDelivery=Y&coupangMemberSort=N&isInitTireSmartFinder=N&recommendedSort=N&defaultUICategoryCode=16325265&defaultPhysicsCategoryCode=46803%7C46818%7C50379%7C0&defaultVmTab=10&defaultVaTab=389&isZeroPrice=Y&quickProductYN=N&priceUnitSort=Y&priceUnitSortOrder=A'
        driver.get(url)
        # driver.get(f'https://search.danawa.com/dsearch.php?query={search_keyword}&checkedInfo=N&volumeType=allvs&page={page}&limit=40&sort=priceASC&list=list&boost=true&tab=goods&addDelivery=Y&coupangMemberSort=N&isInitTireSmartFinder=N&recommendedSort=N&defaultUICategoryCode=16325265&defaultPhysicsCategoryCode=46803%7C46818%7C50379%7C0&defaultVmTab=10&defaultVaTab=387&isZeroPrice=Y&quickProductYN=N&priceUnitSort=N&priceUnitSortOrder=A')

        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".product_list")))
        main_window = driver.current_window_handle  # 메인 윈도우 핸들 저장
        
        products = WebDriverWait(driver, 10).until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, ".product_list .prod_item.searched")))

        print(len(products))

        for index, product in enumerate(products):
            print("crawling_data+crawling_list", crawling_list)
            try:
                # 새로운 요소 참조를 얻기 위해 매번 elements를 다시 조회합니다.

                product = driver.find_elements(By.CSS_SELECTOR, ".product_list .prod_item.searched")[index]
                main_info = product.find_element(By.CSS_SELECTOR, ".prod_main_info")
                price_list = main_info.find_element(By.CSS_SELECTOR, ".prod_pricelist")

                # try:
                #     product_category = main_info.find_element(By.CSS_SELECTOR, ".prod_category_location dd a span").text.strip()

                #     if product_category != "신선과일" and product_category != "쌀":
                #         continue
                #     else:
                #         print("신선과일입니다")
                # except Exception as e:  # 모든 예외를 잡으며, 'e' 변수에 예외 객체를 할당
                #     continue
                #     print("카테고리없음:", e)  # 예외 객체의 문자열 표현을 출력

                mall_icon_alt_text = price_list.find_element(By.CSS_SELECTOR, ".mall_icon img").get_attribute('alt').strip()
                print("Mall Icon Alt Text:", mall_icon_alt_text)

                price_text = price_list.find_element(By.CSS_SELECTOR, ".price_sect strong").text
                print("Price:", price_text)


                print("index", index)
                # 새 창에서 작업
                click_link = price_list.find_element(By.CSS_SELECTOR, ".click_log_product_searched_price_")
                driver.execute_script("arguments[0].click();", click_link)
                
                # 새 창이 나타날 때까지 기다립니다.
                WebDriverWait(driver, 10).until(EC.number_of_windows_to_be(2))
                windows = driver.window_handles
                new_window = [window for window in windows if window != main_window][0]
                driver.switch_to.window(new_window)
                current_url = driver.current_url
                
                # # 새 창에서 필요한 정보를 가져온 후 닫기
                if mall_icon_alt_text == "티몬":
                    try:
                        tmon_list = tmon_crawling(driver)
                        current_url = driver.current_url        
                        crawling_list.append(tmon_list)
                    except Exception as e:  # 모든 예외를 잡으며, 'e' 변수에 예외 객체를 할당
                        print("예외 발생:", e)  # 예외 객체의 문자열 표현을 출력
                elif mall_icon_alt_text == "쿠팡":
                    # WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".prod-atf-main")))  
                    try:
                        coupang_list = coupang_crawling(driver)
                        current_url = driver.current_url
                        print("New Window URL:", current_url)
                        if len(coupang_list) == 0:
                            print("회원정보 없음")
                        else:
                            current_url = driver.current_url
                            crawling_list.append(coupang_list)
                    
                    except Exception as e:  # 모든 예외를 잡으며, 'e' 변수에 예외 객체를 할당
                        print("예외 발생:", e)  # 예외 객체의 문자열 표현을 출력
                elif mall_icon_alt_text == "위메프플러스":
                    try:
                        plus_we_make_market_list = plus_wemakeprice_crawling(driver)
                        current_url = driver.current_url
                        print("New Window URL:", current_url)
                        crawling_list.append(plus_we_make_market_list)
                    except Exception as e:  # 모든 예외를 잡으며, 'e' 변수에 예외 객체를 할당
                        print("예외 발생:", e)  # 예외 객체의 문자열 표현을 출력
                elif mall_icon_alt_text == "위메프":
                    try:
                        we_make_market_list = wemakeprice_crawling(driver)
                        current_url = driver.current_url
                        print("New Window URL:", current_url)
                        crawling_list.append(we_make_market_list)
                    except Exception as e:  # 모든 예외를 잡으며, 'e' 변수에 예외 객체를 할당
                        print("예외 발생:", e)  # 예외 객체의 문자열 표현을 출력
                elif mall_icon_alt_text == "G마켓":
                    try:
                        gmarket_list = gmarket_crawling(driver)
                        current_url = driver.current_url
                        print("New Window URL:", current_url)
                        crawling_list.append(gmarket_list)
                    except Exception as e:  # 모든 예외를 잡으며, 'e' 변수에 예외 객체를 할당
                        print("예외 발생:", e)  # 예외 객체의 문자열 표현을 출력
                elif mall_icon_alt_text == "인터파크":
                    try:
                        prev_popup_window = driver.current_window_handle  # 메인 윈도우 핸들 저장

                        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".productInfomation")))  
                        windows = driver.window_handles
                        new_window = next(window for window in windows if window != prev_popup_window and window != main_window)
                        driver.switch_to.window(new_window)
                        driver.close()
                        driver.switch_to.window(prev_popup_window)
                        interpark_list = interpark_crawling(driver)
                        current_url = driver.current_url
                        print("New Window URL:", current_url)
                        crawling_list.append(interpark_list)
                    except Exception as e:  # 모든 예외를 잡으며, 'e' 변수에 예외 객체를 할당
                        print("예외 발생:", e)  # 예외 객체의 문자열 표현을 출력
                elif mall_icon_alt_text == "옥션":
                    try:
                        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".vip-content")))  
                        auction_list = auction_crawling(driver)
                        print("auction_list", auction_list)
                        current_url = driver.current_url
                        print("New Window URL:", current_url)
                        crawling_list.append(auction_list)
                    except Exception as e:  # 모든 예외를 잡으며, 'e' 변수에 예외 객체를 할당
                        print("예외 발생:", e)  # 예외 객체의 문자열 표현을 출력
                        print("옥션 패스")
                elif mall_icon_alt_text == "롯데ON":
                    try:
                        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".productWrap")))  
                        lotte_on_list = lotte_on_crawling(driver)
                        current_url = driver.current_url
                        print("New Window URL:", current_url)
                        crawling_list.append(lotte_on_list)
                    except Exception as e:  # 모든 예외를 잡으며, 'e' 변수에 예외 객체를 할당
                        print("예외 발생:", e)  # 예외 객체의 문자열 표현을 출력
                elif mall_icon_alt_text == "11번가":
                    try:
                        street11_list =street11_crawling(driver)
                        current_url = driver.current_url
                        print("New Window URL:", current_url)
                        crawling_list.append(street11_list)
                    except Exception as e:  # 모든 예외를 잡으며, 'e' 변수에 예외 객체를 할당
                        print("예외 발생:", e)  # 예외 객체의 문자열 표현을 출력
                elif mall_icon_alt_text == "이마트인터넷쇼핑몰":
                    try:
                        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".cdtl_row_top")))  
                        current_url = driver.current_url
                        print("New Window URL:", current_url)
                    except Exception as e:  # 모든 예외를 잡으며, 'e' 변수에 예외 객체를 할당
                        print("예외 발생:", e)  # 예외 객체의 문자열 표현을 출력
                elif mall_icon_alt_text == "SSG.COM":
                    try:
                        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".content_primary")))  
                        current_url = driver.current_url
                        print("New Window URL:", current_url)
                    except Exception as e:  # 모든 예외를 잡으며, 'e' 변수에 예외 객체를 할당
                        print("예외 발생:", e)  # 예외 객체의 문자열 표현을 출력
                elif mall_icon_alt_text == "롯데홈쇼핑":
                    try:
                        prev_popup_window = driver.current_window_handle  # 메인 윈도우 핸들 저장

                        WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".detail_sec")))  
                        windows = driver.window_handles
                        new_window = next(window for window in windows if window != prev_popup_window and window != main_window)
                        driver.switch_to.window(new_window)
                        driver.close()
                        driver.switch_to.window(prev_popup_window)

                        lotte_home_list = lotte_home_crawling(driver)
                        crawling_list.append(lotte_home_list)
                        current_url = driver.current_url
                        print("New Window URL:", current_url)
                    except Exception as e:  # 모든 예외를 잡으며, 'e' 변수에 예외 객체를 할당
                        print("예외 발생:", e)  # 예외 객체의 문자열 표현을 출력
                else:
                    # driver.close()
                    # driver.switch_to.window(main_window)  # 메인 윈도우로 전환

                    # 원래 윈도우로 돌아온 후 필요한 웹 요소를 다시 찾습니다.
                    # WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".product_list")))
                    continue
                    
                driver.close()
                driver.switch_to.window(main_window)  # 메인 윈도우로 전환

                # 원래 윈도우로 돌아온 후 필요한 웹 요소를 다시 찾습니다.
                WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.CSS_SELECTOR, ".product_list")))


            except Exception as e:  # 모든 예외를 잡으며, 'e' 변수에 예외 객체를 할당
                print("예외 발생:", e)  # 예외 객체의 문자열 표현을 출력

    except Exception as e:  # 모든 예외를 잡으며, 'e' 변수에 예외 객체를 할당
        print("예외 발생:", e)  # 예외 객체의 문자열 표현을 출력

    finally:
        driver.quit()
        print("crawling_data+crawling_list", crawling_list)
        return crawling_list
    


def update_sheets_by_2_dimension_list(service, spreadsheet_id, range_name, values):
    # 스프레드시트 서비스 객체 생성 (인증 과정은 생략)
    
    body = {'values':values}

    # values().update 메소드를 사용하여 스프레드시트에 데이터를 채워넣습니다.
    # valueInputOption='USER_ENTERED'는 사용자가 직접 입력하는 것과 같은 형식으로 데이터를 처리합니다.
    request = service.spreadsheets().values().update(
        spreadsheetId=spreadsheet_id,
        range=range_name,
        valueInputOption='USER_ENTERED',
        body=body
    )
    response = request.execute()