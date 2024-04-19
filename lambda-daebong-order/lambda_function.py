from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.oauth2.credentials import Credentials
from google.oauth2 import service_account
from google.auth.transport.requests import Request
import os.path
import json




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
    insert_name = event["insert_name"]
    phone_number = event["phone_number"]
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






if __name__ == "__main__":
       lambda_handler({
        "spreadsheet_id": "1RAnWFmNvlv2VUk_biNbpUyhasr6o2Gt5HXZEk216sDs",
        "insert_name": "338_백민",
        "phone_number":"01052371951"
    }, {})
