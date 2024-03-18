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



def apply_formula_to_cells(service, spreadsheet_id, sheet_title, new_daebong_spreadsheet_title):
    range_name = f"{sheet_title}!J11:J"  # J열 11행부터 끝까지
    # formula = f'=IF(LEN(E11)=0,"", {new_daebong_spreadsheet_title})'  # 적용할 수식
   

    formulas = []
    for i in range(11, 1011):  # 11행부터 1010행까지
        formula = f'=IF(LEN(E{i})=0,"", {new_daebong_spreadsheet_title})'
        formulas.append([formula])

    value_range_body = {
        'values': formulas
    }

    request = service.spreadsheets().values().update(spreadsheetId=spreadsheet_id, range=range_name, valueInputOption='USER_ENTERED', body=value_range_body)
    request.execute()


if __name__ == "__main__":
    # 여기에 스프레드시트 ID와 가져오고 싶은 범위를 지정합니다.
    
    creds = oauth()
    service = build('sheets', 'v4', credentials=creds)
    new_spreadsheet_id = "1gR3kForAN5hNpmA4HBf3_xRS62FtAbSLyKBvWKAUgHg"

    array = [
        [227
        ,'14KS38kY_hZD2061EmIaAm3cA3Rw9R2mEDoIczxdk3sQ'],
        [228, 
        "1hrmwW1aznOQJewXDlyCsfCqEvsTjh_BXXVSZAqwH2r0"],
        [229,
        "1aEZw4wsj1HXCuxvcc5mnvJ0UI8Qkuo05-zmYPzblSWc"],
        [229,
        "1s8u-mN8fv4_OCg5tfQrAktGMFiFipZxu6qSSQh120KE"],
        [230,
        "18KC58d7RZl9wkzTb6qxBeOlVitldqRfO0lJ5uchwV2s"],
        [230,
        "1OxaNX2XUK5CTsqseH6Dnj_3Bhi1FNn_79YAAH1sOdhE"],
        [231,
        "1CC5HAoulfHpomxSJWU2Zr0doNLwZQYj9uMsnk9YlUIY"],
        [231,
        "1IHElKAeGzOK0-LRR3kHsJl-ttKO2_0BL_MApwrozW8A"],
        [232,
        "1iKJnf9JCFOvBUqcufaX9xs2YVrqIpVGTxFruIP6wwhg"],
        [233,
        "1911UP9nR65fxxJO_Na8886T-Q-FBPvMaRs-twm4KsoI"],
        [234,
        "13gTVm1GQEnrQqgc_Q55M8cWyrWrUAmt2gt_v7Ltm-18"],
        [235,
        "1wKg9_xHUVFRujWUsX9unEN38pD8yg3B_c1f8z1C8FI4"],
        [236,
        "102YTIjanaJqeckd-zJ_s5d-EgUeZQUB1F7G9wWw_-6w"],
        [237,
        "1P3Z7nF8kRh0H84yk26Y3G4EzfY_AWRPdU4mNyppTNaM"],
        [238,
        "1ywXZQV6GXPP-xDAfAJ1Q0AqBD4TTTV214qOvUF79_aI"],
    ]

    for i in array:
        apply_formula_to_cells(service, i[1], '발주서', i[0])