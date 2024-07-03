import json
import os.path

from google.auth.transport.requests import Request
from google.oauth2 import service_account
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


def oauth():
    SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
    creds_filename = 'test-daebong-service-account.json'  # 서비스 계정 파일 경로를 지정합니다.

    # 서비스 계정 파일을 사용하여 인증 정보를 로드합니다.
    creds = service_account.Credentials.from_service_account_file(creds_filename, scopes=SCOPES)
    return creds


def aws_apply_formula_to_muti_cells_phone_number(service, spreadsheet_id, range_name, phone_number):
    formulas = []
    for i in range(11, 1011):  # 11행부터 1010행까지
        formula = f'=IF(LEN(A{i})=0,"", \"{phone_number}\")'
        formulas.append([formula])

    value_range_body = {
        'values': formulas
    }

    request = service.spreadsheets().values().update(spreadsheetId=spreadsheet_id, range=range_name, valueInputOption='USER_ENTERED', body=value_range_body)
    request.execute()


def lambda_handler(event, context): 
    creds = oauth()
    service = build('sheets', 'v4', credentials=creds)
    spreadsheet_id = event["spreadsheet_id"]
    print(spreadsheet_id)
    
    insert_name = event.get("insert_name", event.get("sheet_title", ""))
    
    
    phone_number = event["phone_number"]

    print(insert_name)
    sheet_order_id = aws_get_sheet_id_by_name(service, spreadsheet_id, "발주서")

    try: 
        if phone_number:
            aws_apply_formula_to_muti_cells_phone_number(service, spreadsheet_id, "발주서!I11:I", phone_number)
        if insert_name:
            aws_insert_title_text_in_cell(service, spreadsheet_id, sheet_order_id, insert_name)

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




def aws_insert_title_text_in_cell(service, spreadsheet_id, sheet_order_id, insert_name):
    text_c2 = f"입금 시 입금자명으로 \"{insert_name}\"을 입력해주세요."
    text_e3 = f"3. 입금자명을 \"{insert_name}\"으로 입력합니다."
    text_l8 = f"{insert_name}"

    color_hex = "#2F55CB"

    
    blue = {"red": int(color_hex[1:3], 16) / 255.0, "green": int(color_hex[3:5], 16) / 255.0, "blue": int(color_hex[5:7], 16) / 255.0}  # 검은색
    black =  {"red": 0.0, "green": 0.0, "blue": 0.0}  # 검은색
    font_size_14 = 14  # 적용할 글자 크기
    font_size_12 = 12  # 적용할 글자 크기
    font_size_25 = 20  # 적용할 글자 크기
    bold = True  # 볼드 여부

    text_format_c2 = {
        "foregroundColor": blue,
        "fontSize": font_size_14,
        "bold": bold
    }

    text_format_e3 = {
        "foregroundColor": black,
        "fontSize": font_size_12,
        "bold": bold
    }

    text_format_l8 = {
        "foregroundColor": black,
        "fontSize": font_size_25,
        "bold": bold
    }

    request_2 = {
        "updateCells": {
            "rows": [
                {
                    "values": [
                        {"userEnteredValue": {"stringValue": text_c2}, "userEnteredFormat": {"textFormat": text_format_c2}}
                    ]
                }
            ],
            "fields": "userEnteredValue,userEnteredFormat.textFormat",
            "range": {
                'sheetId': sheet_order_id,
                'startRowIndex': 1, 
                'startColumnIndex': 2, 
                'endRowIndex':2,
                'endColumnIndex':3
            }
        }
    }

    request_3 = {
        "updateCells": {
            "rows": [
                {
                    "values": [
                        {"userEnteredValue": {"stringValue": text_e3}, "userEnteredFormat": {"textFormat": text_format_e3}}
                    ]
                }
            ],
            "fields": "userEnteredValue,userEnteredFormat.textFormat",
            "range": {
                'sheetId': sheet_order_id,
                'startRowIndex': 2, 
                'startColumnIndex': 4, 
                'endRowIndex':3,
                'endColumnIndex':5
            }
        }
    }


    request_4 = {
        "updateCells": {
            "rows": [
                {
                    "values": [
                        {"userEnteredValue": {"stringValue": text_l8}, "userEnteredFormat": {"textFormat": text_format_l8}}
                    ]
                }
            ],
            "fields": "userEnteredValue,userEnteredFormat.textFormat",
            "range": {
                'sheetId': sheet_order_id,
                'startRowIndex': 7, 
                'startColumnIndex': 11, 
                'endRowIndex':8,
                'endColumnIndex':12
            }
        }
    }    

    response_2 = service.spreadsheets().batchUpdate(
        spreadsheetId=spreadsheet_id,
        body={'requests': [request_2]}
    ).execute()

    response_3 = service.spreadsheets().batchUpdate(
        spreadsheetId=spreadsheet_id,
        body={'requests': [request_3]}
    ).execute()

    response_4 = service.spreadsheets().batchUpdate(
        spreadsheetId=spreadsheet_id,
        body={'requests': [request_4]}
    ).execute()


def aws_get_sheet_id_by_name(service, spreadsheet_id, sheet_name):
    spreadsheet_paste = service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
    sheets_paste = spreadsheet_paste.get('sheets', '')
    sheet_order_id = None
    for sheet in sheets_paste:
        if sheet.get('properties', {}).get('title', '') == sheet_name:
            sheet_order_id = sheet.get('properties', {}).get('sheetId', '')
    
    return sheet_order_id







@retry(wait=wait_exponential(multiplier=1, min=2, max=60), stop=stop_after_attempt(5), retry=retry_if_exception_type(HttpError))
async def batchWriteRequest(service, spreadsheet_id, all_requests):
    # 요청들을 하나의 리스트로 병합
    # all_requests = []
    # for req in requests:
    #     all_requests.append(req)
    
    # 요청 바디 작성
    body = {
        'requests': all_requests
    }

    # batchUpdate 호출
    response = service.spreadsheets().batchUpdate(
        spreadsheetId=spreadsheet_id,
        body=body
    ).execute()
    
    return response


async def apply_formula_and_text(sheet_id_list, ordersheet_number_title, depositer_name, deposit_sheet_id, product_list_sheet_id):
    sheet_order_id_발주서 = sheet_id_list[0]
    sheet_order_id_누적발주 = sheet_id_list[1]
    sheet_order_id_입금내역 = sheet_id_list[2]
    sheet_order_id_상품목록 = sheet_id_list[3]
    sheet_order_id_매핑모드 = sheet_id_list[4]
    sheet_order_id_예판상품 = sheet_id_list[5]

    # request_name_index = [
    #     apply_rename_request(sheet_order_id_발주서, "발주서"),
    #     apply_rename_request(sheet_order_id_누적발주, "누적발주"),
    #     apply_rename_request(sheet_order_id_입금내역, "입금내역"),
    #     apply_rename_request(sheet_order_id_상품목록, "상품목록"),
    #     apply_index_request(sheet_order_id_발주서, 0),
    #     apply_index_request(sheet_order_id_누적발주, 1),
    #     apply_index_request(sheet_order_id_상품목록, 2),
    #     apply_index_request(sheet_order_id_입금내역, 3),
    # ]
    requests = []

    ordersheet_number = int(ordersheet_number_title)

    result_입금자명_발주서 = apply_formula_to_text(str(ordersheet_number_title), "J4:J4", sheet_order_id_발주서)
    result_발주서번호_발주서 = apply_formula_to_text(str(ordersheet_number_title), "T4:T4", sheet_order_id_발주서)
    formula_예치금잔액_발주서 = f'=IMPORTRANGE("{deposit_sheet_id}", "\'셀러발주서정보\'!D{ordersheet_number + 1}:D{ordersheet_number + 1}")'
    result_예치금잔액_발주서 = apply_formula_to_function(formula_예치금잔액_발주서, "K4:K4", sheet_order_id_발주서)


    result_입금자명_발주서매핑모드 = apply_formula_to_text(str(depositer_name), "J4:J4", sheet_order_id_매핑모드)
    result_발주서번호_발주서매핑모드 = apply_formula_to_text(str(ordersheet_number_title), "T4:T4", sheet_order_id_매핑모드)
    formula_예치금잔액_발주서매핑모드 = f'=IMPORTRANGE("{deposit_sheet_id}", "\'셀러발주서정보\'!D{ordersheet_number + 1}:D{ordersheet_number + 1}")'
    result_예치금잔액_발주서매핑모드 = apply_formula_to_function(formula_예치금잔액_발주서매핑모드, "K4:K4", sheet_order_id_매핑모드)


    formula_입금확인중_발주서 = f"=IFERROR(SUMIF(\'누적발주\'!H4:H, \"입금확인중\", \'누적발주\'!R4:R), 0)"
    result_입금확인중_발주서 = apply_formula_to_function(formula_입금확인중_발주서, "O4:O4", sheet_order_id_발주서)
    formula_추가입금필요_발주서 = f"=IFERROR(SUMIF(\'누적발주\'!H4:H, \"입금확인필요\", \'누적발주\'!R4:R), 0)"
    result_추가입금필요_발주서 = apply_formula_to_function(formula_추가입금필요_발주서, "P4:P4", sheet_order_id_발주서)

    formula_입금확인중_발주서매핑모드 = f"=IFERROR(SUMIF(\'누적발주\'!H4:H, \"입금확인중\", \'누적발주\'!R4:R), 0)"
    result_입금확인중_발주서매핑모드 = apply_formula_to_function(formula_입금확인중_발주서매핑모드, "O4:O4", sheet_order_id_매핑모드)
    formula_추가입금필요_발주서매핑모드 = f"=IFERROR(SUMIF(\'누적발주\'!H4:H, \"입금확인필요\", \'누적발주\'!R4:R), 0)"
    result_추가입금필요_발주서매핑모드 = apply_formula_to_function(formula_추가입금필요_발주서매핑모드, "P4:P4", sheet_order_id_매핑모드)


    formula_입금내역 = f'=IFERROR(QUERY(IMPORTRANGE("{deposit_sheet_id}", "전체입금!A2:E"), "SELECT Col1, Col2, Col3, Col5 WHERE Col5 = {ordersheet_number_title} ORDER BY Col3 DESC"), "")'
    result_입금내역_입금내역 = apply_formula_to_function(formula_입금내역, "A2:A2", sheet_order_id_입금내역)


    result_코드번호_발주서 = apply_formula_to_function_in_everyrow(sheet_order_id_발주서, ordersheet_number_title)
    result_코드번호_매핑모드 = apply_formula_to_function_in_everyrow(sheet_order_id_매핑모드, ordersheet_number_title)


    formula_상품목록 = f'=IMPORTRANGE("{product_list_sheet_id}","\'시트1\'!A2:M930")'
    formula_예판상품 = f'=IMPORTRANGE("{product_list_sheet_id}","\'예판상품\'!A2:M930")'
    result_상품목록_상품목록= apply_formula_to_function(formula_상품목록, "AA1:AA1", sheet_order_id_상품목록)
    result_상품목록_예판상품= apply_formula_to_function(formula_예판상품, "AA1:AA1", sheet_order_id_예판상품)
    
    # formula_상품목록 = f'=IMPORTRANGE("1Fg76vk3lucUwwvmcoQJVb4KiMfjJSNx2VEFSdhwYFy4","\'시트1\'!A2:M999")'
    # result_상품목록_상품목록= apply_formula_to_function(formula_상품목록, "AA1:AA1", sheet_order_id_상품목록)

    requests.extend([
        result_입금자명_발주서, result_발주서번호_발주서, result_예치금잔액_발주서, 
        result_추가입금필요_발주서,  result_입금확인중_발주서, 
        
        result_입금자명_발주서매핑모드, result_발주서번호_발주서매핑모드, result_예치금잔액_발주서매핑모드, 
        result_추가입금필요_발주서매핑모드, result_입금확인중_발주서매핑모드,

        result_입금내역_입금내역,
        result_상품목록_상품목록,
        result_상품목록_예판상품    
    ])

    request_protect = [apply_protect_data(sheet_order_id_발주서, "J4:O4"),apply_protect_data(sheet_order_id_발주서, "T1:Z940"),apply_protect_data(sheet_order_id_상품목록, "I1:Z110"),apply_protect_data(sheet_order_id_입금내역, "A1:Z940")]
    

    
    requests.extend(result_코드번호_발주서)
    requests.extend(result_코드번호_매핑모드)
    # requests.extend(request_name_index)
    requests.extend(request_protect)
    
    return requests



async def main(service_sheets, destination_spreadsheet_id, ordersheet_number_title, depositer_name, deposit_sheet_id, product_list_sheet_id):
    sheet_id_list = await find_sheet_id(service_sheets, destination_spreadsheet_id)
    requests = await apply_formula_and_text(sheet_id_list, ordersheet_number_title, depositer_name, deposit_sheet_id, product_list_sheet_id)
    await batchWriteRequest(service_sheets, destination_spreadsheet_id, requests)


if __name__ == "__main__":
       lambda_handler({
        "spreadsheet_id": "1RAnWFmNvlv2VUk_biNbpUyhasr6o2Gt5HXZEk216sDs",
        "insert_name":"338_백민기",
        "phone_number":"01052371951",
        "sheet_title":"12340"
    }, {})



@retry(wait=wait_exponential(multiplier=1, min=2, max=60), stop=stop_after_attempt(5), retry=retry_if_exception_type(HttpError))
async def find_sheet_id(service_sheets, destination_spreadsheet_id):

    #특정시트에 복사하기 
    spreadsheet = service_sheets.spreadsheets().get(spreadsheetId=destination_spreadsheet_id).execute()
    sheets = spreadsheet.get('sheets', '')
    sheet_order_id_발주서 = None
    sheet_order_id_누적발주 = None
    sheet_order_id_입금내역 = None
    sheet_order_id_상품목록 = None
    sheet_order_id_발주서매핑모드 = None
    sheet_order_id_예판상품 = None
    
    for sheet in sheets:
        if sheet.get('properties', {}).get('title', '') == "발주서":
            sheet_order_id_발주서 = sheet.get('properties', {}).get('sheetId', '')
        if sheet.get('properties', {}).get('title', '') == "누적발주":
            sheet_order_id_누적발주 = sheet.get('properties', {}).get('sheetId', '')
        if sheet.get('properties', {}).get('title', '') == "입금내역":
            sheet_order_id_입금내역 = sheet.get('properties', {}).get('sheetId', '')
        if sheet.get('properties', {}).get('title', '') == "상품목록":
            sheet_order_id_상품목록 = sheet.get('properties', {}).get('sheetId', '')
        if sheet.get('properties', {}).get('title', '') == "발주서매핑모드":
            sheet_order_id_발주서매핑모드 = sheet.get('properties', {}).get('sheetId', '')
        if sheet.get('properties', {}).get('title', '') == "예판상품":
            sheet_order_id_예판상품 = sheet.get('properties', {}).get('sheetId', '')

    return [sheet_order_id_발주서,sheet_order_id_누적발주,sheet_order_id_입금내역,sheet_order_id_상품목록, sheet_order_id_발주서매핑모드, sheet_order_id_예판상품]