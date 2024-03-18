from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
import os.path



def oauth():
    SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
    creds = None
    creds_filename = './credentials.json'
    # 토큰 파일이 있는지 확인합니다. 있으면 인증 정보를 로드합니다.
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)
    # 토큰이 없거나 유효하지 않으면 사용자 인증을 다시 진행합니다.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                creds_filename, SCOPES)
            creds = flow.run_local_server(port=8080)
        # 새로운 인증 정보를 파일로 저장합니다.
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    return creds


def create_sheet(title):
    # SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
    # # credentials.json 파일 경로를 지정합니다.
    # creds_filename = './credentials.json'

    # flow = InstalledAppFlow.from_client_secrets_file(creds_filename, SCOPES)
    # # `run_console` 메소드를 사용하여 Headless 인증을 진행합니다.
    # # creds = flow.run_console()
    # creds = flow.run_local_server(port=8080)

    creds = oauth()

    try:
        service = build('sheets', 'v4', credentials=creds)
        spreadsheet_body = {'properties': {'title': title}}
        request = service.spreadsheets().create(body=spreadsheet_body)
        response = request.execute()

        print(f"Created spreadsheet ID: {response['spreadsheetId']}")
    except HttpError as error:
        print(f"An error occurred: {error}")



def get_sheet_data(spreadsheet_id, range_name):
    # SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
    # # credentials.json 파일 경로를 지정합니다.
    # creds_filename = './credentials.json'

    # flow = InstalledAppFlow.from_client_secrets_file(creds_filename, SCOPES)
    # # 여기서 인증을 진행합니다. 아래의 메소드 중 하나를 선택하세요.
    # # creds = flow.run_console()
    # creds = flow.run_local_server(port=8080)

    creds = oauth()

    try:
        service = build('sheets', 'v4', credentials=creds)
        # 스프레드시트 ID와 범위(예: "Sheet1!A1:C2")를 지정합니다.
        result = service.spreadsheets().values().get(spreadsheetId=spreadsheet_id, range=range_name).execute()
        print(result)
        rows = result.get('values', [])

        if not rows:
            print('No data found.')
            return
        print('Name, Major:')
        for row in rows:
            # 행의 각 열을 출력합니다.
            print(f"{row[0]}, {row[1]}")
    except HttpError as error:
        print(f"An error occurred: {error}")

    

if __name__ == "__main__":
    # 여기에 스프레드시트 ID와 가져오고 싶은 범위를 지정합니다.
    SPREADSHEET_ID = '1Ajz2g-pChLSoies5umhPMcgTp5m2MIjhljJOviPlWCU'
    RANGE_NAME = 'Sheet1!A1:C2'
    get_sheet_data(SPREADSHEET_ID, RANGE_NAME)
    # create_sheet("New Spreadsheet")