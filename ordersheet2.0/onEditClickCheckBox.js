function onEdit(e) {
  handleEditForSheet1(e);
  handleK7Edit(e);
}

function handleEditForSheet1(e) {
  var sheetName = "발주서"; // 조건을 적용할 시트 이름

  // e 객체가 유효한지 확인
  if (!e) {
    throw new Error(
      "이 함수는 스프레드시트의 onEdit 이벤트에 의해 실행되어야 합니다."
    );
  }

  var sheet = e.source.getActiveSheet(); // 편집된 시트 가져오기
  var range = e.range; // 편집된 셀 범위 가져오기

  // 편집된 시트가 지정된 시트이고, A8 셀이 편집된 경우에만 실행
  if (sheet.getName() === sheetName && range.getA1Notation() === "A8") {
    var value = range.getValue(); // A8 셀의 값 가져오기

    // A8의 값이 "매핑모드"인 경우
    if (value === "매핑모드") {
      // D열(4번째 열)을 숨김
      sheet.hideColumns(4);
      // E부터 G열(5번째에서 7번째 열)을 표시
      sheet.showColumns(5, 3);
      // I열(9번째 열)을 숨김
      sheet.hideColumns(9);
    }
    // A8의 값이 "일반모드"인 경우
    else if (value === "일반모드") {
      // E부터 G열(5번째에서 7번째 열)을 숨김
      sheet.hideColumns(5, 5);
      // D열을 표시
      sheet.showColumns(4);
    }
    // A8의 값이 다른 경우
    else {
      // D열을 표시
      sheet.showColumns(4);
      // E부터 G열을 표시
      sheet.showColumns(5, 3);
      // I열을 표시
      sheet.showColumns(9);
    }
  }
}

function handleK7Edit(e) {
  var sheet = e.source.getActiveSheet();

  // 시트 이름이 '시트1'인지 확인
  if (sheet.getName() === "발주서" || sheet.getName() === "시트1") {
    var range = e.range;

    // K7 셀을 감지
    try {
      if (range.getA1Notation() === "K7") {
        var newValue = range.getValue();

        // K7이 true로 변경된 경우
        if (newValue === true) {
          // A열부터 X열까지 복사
          var dataRange = sheet.getDataRange().getValues();
          var lastRow = dataRange.length;
          var rowsToMove = [];
          var valuesForIToX = [];

          var currentDate = Utilities.formatDate(
            new Date(),
            Session.getScriptTimeZone(),
            "yyyy-MM-dd"
          );
          var currentDateFormatted = Utilities.formatDate(
            new Date(),
            Session.getScriptTimeZone(),
            "yyMMdd"
          );
          var currentTime = Utilities.formatDate(
            new Date(),
            Session.getScriptTimeZone(),
            "HHmm"
          );

          for (var i = 0; i < lastRow; i++) {
            if (dataRange[i][10] === "정상입력") {
              // K열이 "정상입력"인 경우
              dataRange[i][23] = true; // X열을 true로 설정
            }
            if (dataRange[i][23] === true) {
              // X열이 true인 경우
              // I열부터 넣을 값을 설정 // 택배사 포함 25까지 총 길이 25개
              var newRow = dataRange[i].slice(0, 25);
              // I열부터 넣을 값을 설정 // 택배사 제외 24, 발주체크박스까지
              valuesForIToX.push(dataRange[i].slice(0, 24)); // 시트1의 A열부터 y열까지의 값

              // B열에 추가할 값 생성
              var newCellValue =
                dataRange[i][6] +
                "-" +
                dataRange[i][0] +
                "-" +
                currentDateFormatted +
                "-" +
                currentTime +
                "-" +
                (i + 1) +
                dataRange[i][16] +
                "-" +
                dataRange[i][19];
              newRow.unshift(dataRange[i][24]); // C열에 넣을 값을 맨 앞에 추가 택배사
              newRow.unshift(newCellValue); // B열에 넣을 값을 맨 앞에 추가
              newRow.unshift(currentDate); // A열에 넣을 날짜를 그 앞에 추가
              newRow.splice(4, 0, "발주완료"); // E열에 "발주완료" 추가
              newRow.splice(7, 0, "입금확인중"); // H열에 "입금확인중" 추가
              rowsToMove.push(newRow);
            }
          }

          // 시트2에 행 추가
          if (rowsToMove.length > 0) {
            var sheet2 =
              SpreadsheetApp.getActiveSpreadsheet().getSheetByName("누적발주");
            var startRow = sheet2.getLastRow() + 1;
            for (var j = 0; j < rowsToMove.length; j++) {
              // sheet2.getRange(startRow + j, 1, 1, 5).setValues([[rowsToMove[j][0], rowsToMove[j][1], , , rowsToMove[j][4]]]);
              // A열과 B열, C열, E열, H열에 값을 넣음
              //C열은 택배사
              sheet2
                .getRange(startRow + j, 1, 1, 8)
                .setValues([
                  [
                    rowsToMove[j][0],
                    rowsToMove[j][1],
                    rowsToMove[j][2],
                    ,
                    rowsToMove[j][4],
                    ,
                    ,
                    rowsToMove[j][7],
                  ],
                ]);
              // I열부터 X열까지 값을 넣음
              sheet2
                .getRange(startRow + j, 9, 1, valuesForIToX[j].length)
                .setValues([valuesForIToX[j]]);
            }
          }
          for (var i = lastRow - 1; i >= 0; i--) {
            if (dataRange[i][23] === true) {
              // X열이 true인 경우
              sheet.deleteRow(i + 1);
            }
          }
        }
      }
    } catch (e) {
      Logger.log("오류:" + e.message); // 오류 메시지 출력
      var ui = SpreadsheetApp.getUi();
      // 사용자에게 경고 메시지를 표시
      var errorMessage =
        "예상치못한 오류가 발생했습니다. 담당자에게 문의해주세요" +
        "\n" +
        e.message;
      ui.alert("오류메시지", errorMessage, ui.ButtonSet.OK);
    } finally {
      // K7을 false로 변경
      if (range.getA1Notation() === "K7") {
        var newValue = range.getValue();

        // K7이 true로 변경된 경우
        if (newValue === true) {
          sheet.getRange("K7").setValue(false);
        }
      }
    }
  }
}
