function onEdit(e) {
  var sheet = e.source.getActiveSheet();

  if (
    sheet.getName() === "발주서" &&
    e.range.getA1Notation() === "J7" &&
    e.value === "TRUE"
  ) {
    handleJ7CheckOutputMoveSheet("발주서");
  }
  if (
    sheet.getName() === "발주서" &&
    e.range.getA1Notation() === "K7" &&
    e.value === "TRUE"
  ) {
    handleK7CheckOutputMoveSheet();
  }

  if (
    sheet.getName() === "발주서매핑모드" &&
    e.range.getA1Notation() === "J7" &&
    e.value === "TRUE"
  ) {
    handleJ7CheckOutputMoveSheetMapping();
  }
  if (
    sheet.getName() === "발주서매핑모드" &&
    e.range.getA1Notation() === "K7" &&
    e.value === "TRUE"
  ) {
    handleK7CheckOutputMoveSheetMapping();
  }

  // handleEditForSheet1(e);
  // if (sheet.getName() === '발주서' && e.range.getA1Notation() === 'K7' && e.value === 'TRUE') {
  //   // handleK7Edit();
  //   handleK7Check();
  // }
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

// function handleK7Edit(e) {
//   var sheet = e.source.getActiveSheet();

//   // 시트 이름이 '시트1'인지 확인
//   if (sheet.getName() === '발주서' || sheet.getName() === '시트1') {
//     var range = e.range;

//     // K7 셀을 감지
//     try {
//          if (range.getA1Notation() === 'K7') {

//       var newValue = range.getValue();

//       // K7이 true로 변경된 경우
//       if (newValue === true) {
//         // A열부터 X열까지 복사
//         var dataRange = sheet.getDataRange().getValues();
//         var lastRow = dataRange.length;
//         var rowsToMove = [];
//         var valuesForIToX = [];

//         var currentDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
//         var currentDateFormatted = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyMMdd");
//         var currentTime = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "HHmm");

//         for (var i = 0; i < lastRow; i++) {
//           if (dataRange[i][10] === "정상입력") { // K열이 "정상입력"인 경우
//             dataRange[i][23] = true; // X열을 true로 설정
//           }
//           if (dataRange[i][23] === true) { // X열이 true인 경우
//           // I열부터 넣을 값을 설정 // 택배사 포함 25까지 총 길이 25개
//             var newRow = dataRange[i].slice(0, 25);
//             // I열부터 넣을 값을 설정 // 택배사 제외 24, 발주체크박스까지
//             valuesForIToX.push(dataRange[i].slice(0, 24)); // 시트1의 A열부터 y열까지의 값

//             // B열에 추가할 값 생성
//             var newCellValue = dataRange[i][6] + "-" + dataRange[i][0] + "-" + currentDateFormatted + "-" + currentTime + "-" + (i + 1) + dataRange[i][16] + "-" + dataRange[i][19];
//             newRow.unshift(dataRange[i][24]); // C열에 넣을 값을 맨 앞에 추가 택배사
//             newRow.unshift(newCellValue); // B열에 넣을 값을 맨 앞에 추가
//             newRow.unshift(currentDate); // A열에 넣을 날짜를 그 앞에 추가
//             newRow.splice(4, 0, "발주완료"); // E열에 "발주완료" 추가
//             newRow.splice(7, 0, "입금확인중"); // H열에 "입금확인중" 추가
//             rowsToMove.push(newRow);
//           }
//         }

//         // 시트2에 행 추가
//         if (rowsToMove.length > 0) {
//           var sheet2 = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('누적발주');
//           var startRow = sheet2.getLastRow() + 1;
//           for (var j = 0; j < rowsToMove.length; j++) {
//             // sheet2.getRange(startRow + j, 1, 1, 5).setValues([[rowsToMove[j][0], rowsToMove[j][1], , , rowsToMove[j][4]]]);
//             // A열과 B열, C열, E열, H열에 값을 넣음
//             //C열은 택배사
//             sheet2.getRange(startRow + j, 1, 1, 8).setValues([[rowsToMove[j][0], rowsToMove[j][1], rowsToMove[j][2], , rowsToMove[j][4], , ,rowsToMove[j][7]]]);
//             // I열부터 X열까지 값을 넣음
//             sheet2.getRange(startRow + j, 9, 1, valuesForIToX[j].length).setValues([valuesForIToX[j]]);
//           }
//         }
//         for (var i = lastRow - 1; i >= 0; i--) {
//           if (dataRange[i][23] === true) { // X열이 true인 경우
//             sheet.deleteRow(i + 1);
//           }
//         }
//       }
//     }
//     } catch(e) {
//       Logger.log("오류:"+ e.message); // 오류 메시지 출력
//       var ui = SpreadsheetApp.getUi();
//       // 사용자에게 경고 메시지를 표시
//       var errorMessage = "예상치못한 오류가 발생했습니다. 담당자에게 문의해주세요" + "\n" + e.message
//       ui.alert('오류메시지', errorMessage, ui.ButtonSet.OK);

//     }  finally {
//        // K7을 false로 변경
//       if (range.getA1Notation() === 'K7') {
//         var newValue = range.getValue();

//         // K7이 true로 변경된 경우
//         if (newValue === true) {
//           sheet.getRange('K7').setValue(false);
//         }
//       }
//     }
//   }
// }

function handleK7Check() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet1 = ss.getSheetByName("발주서");

  // K7 셀에 "발주 처리 중" 메시지 표시
  sheet1.getRange("K7").setValue("발주 처리 중");

  var data = sheet1.getDataRange().getValues();
  var rowsUpdated = 0;

  // var targetSpreadsheet = SpreadsheetApp.openById(sheetId);
  // var targetSheet = targetSpreadsheet.getSheetByName("누적발주");

  for (var i = 0; i < data.length; i++) {
    if (data[i][10] === "정상입력") {
      // K열이 "정상 발주"인 경우 (0-index로 10번째)
      data[i][23] = true; // X열을 true로 설정 (0-index로 23번째)
      rowsUpdated++;
    }
  }

  // // 업데이트된 데이터를 시트에 반영
  // if (rowsUpdated > 0) {
  //   sheet1.getRange(1, 1, data.length, data[0].length).setValues(data);
  //   Logger.log('X열을 true로 변경한 행 수: ' + rowsUpdated);
  // }

  // copyCheckedRows 함수 호출
  copyCheckedRows();
}

function copyCheckedRows() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet1 = ss.getSheetByName("발주서");
  var sheet2 = ss.getSheetByName("누적발주");

  if (!sheet1) {
    Logger.log("시트1을 찾을 수 없습니다.");
    return;
  }
  if (!sheet2) {
    Logger.log("시트2를 찾을 수 없습니다.");
    return;
  }

  var data = sheet1.getDataRange().getValues();
  Logger.log("data");
  Logger.log(data);
  var rowsToMove = [];
  var rowsToDelete = [];

  for (var i = 11; i < data.length; i++) {
    if (data[i][10] === "정상입력") {
      // X열이 true인 경우 (0-index로 23번째)
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

      var row = data[i];
      var newRow = [
        currentDate, // A: 발주일자
        row[6] +
          "-" +
          row[0] +
          "-" +
          currentDateFormatted +
          "-" +
          currentTime +
          "-" +
          (i + 1) +
          row[16] +
          "-" +
          row[19], // B: 발주번호
        row[24], // C: 택배사
        "", // D: 운송장번호
        "발주완료", // E: 배송현황
        "", // F: 취소요청시
        "", // G: 체크 취소요청 상태
        "입금확인중", // H: 입금확인
      ];

      // (가)배열의 A-X열을 (나)배열의 I-AF열로 복사
      newRow = newRow.concat(row.slice(0, 23));
      newRow = newRow.concat([true]); //마지막 열추가
      rowsToMove.push(newRow);
      rowsToDelete.push(i);
    }
  }

  if (rowsToMove.length > 0) {
    // rowsToMove를 PropertiesService에 저장
    PropertiesService.getScriptProperties().setProperty(
      "rowsToMove",
      JSON.stringify(rowsToMove)
    );
    PropertiesService.getScriptProperties().setProperty("currentBatch", 0);
    PropertiesService.getScriptProperties().setProperty(
      "rowsToDelete",
      JSON.stringify(rowsToDelete)
    );
    Logger.log("Rows to move set in PropertiesService");
    processBatch();
  } else {
    Logger.log("이동할 행이 없습니다.");
    // "발주 처리 중" 메시지를 빈 체크박스로 변경
    sheet1.getRange("K7").setValue("FALSE");
  }
}

function processBatch() {
  try {
    var rowsToMove = JSON.parse(
      PropertiesService.getScriptProperties().getProperty("rowsToMove")
    );
    var currentBatch = parseInt(
      PropertiesService.getScriptProperties().getProperty("currentBatch")
    );
    var rowsToDelete = JSON.parse(
      PropertiesService.getScriptProperties().getProperty("rowsToDelete")
    );
    var batchSize = 100; // 한 번에 처리할 행 수
    var sheet2 =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName("누적발주");
    var sheet1 = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("발주서");

    var start = currentBatch * batchSize;
    var end = Math.min(start + batchSize, rowsToMove.length);
    var batch = rowsToMove.slice(start, end);

    sheet2
      .getRange(sheet2.getLastRow() + 1, 1, batch.length, batch[0].length)
      .setValues(batch);
    Logger.log("Processed batch from " + start + " to " + end);

    if (end < rowsToMove.length) {
      PropertiesService.getScriptProperties().setProperty(
        "currentBatch",
        currentBatch + 1
      );
      processBatch(); // 즉시 다음 배치를 처리
    } else {
      PropertiesService.getScriptProperties().deleteProperty("rowsToMove");
      PropertiesService.getScriptProperties().deleteProperty("currentBatch");

      // 시트1을 지우고 행 추가 및 J열의 함수 복사
      // clearSheet1();
      Logger.log("rowsToDelete");
      Logger.log(rowsToDelete);
      PropertiesService.getScriptProperties().deleteProperty("rowsToDelete");
      deleteRowsInBatches(sheet1, rowsToDelete);
    }
  } catch (error) {
    Logger.log("Error in processBatch: " + error.message);
    // 에러 발생 시 "발주 처리 중" 메시지를 빈 체크박스로 변경
    SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName("발주서")
      .getRange("K7")
      .setValue("FALSE");
  } finally {
    sheet1.getRange("K7").setValue("FALSE");
  }
}

function deleteRowsInBatches(sheet, rowsToDelete) {
  rowsToDelete.sort(function (a, b) {
    return a - b;
  }); // 오름차순 정렬

  var start = rowsToDelete[0];
  var end = start;

  for (var i = 1; i < rowsToDelete.length; i++) {
    if (rowsToDelete[i] == end + 1) {
      end = rowsToDelete[i];
    } else {
      sheet.deleteRows(start + 1, end - start + 1);
      start = rowsToDelete[i];
      end = start;
    }
  }

  // 마지막 그룹 삭제
  sheet.deleteRows(start + 1, end - start + 1);
}

function setFalse(sheet) {
  sheet.getRange("K7").setValue("FALSE");
}

function clearSheet1() {
  var sheet1 = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("발주서");
  if (!sheet1) return;

  var lastRow = sheet1.getLastRow();

  // 12행부터 마지막 행 전까지 삭제
  if (lastRow > 12) {
    sheet1.deleteRows(12, lastRow - 12);
  }

  // 하단에 2000개 행 추가
  sheet1.insertRowsAfter(sheet1.getMaxRows(), 2000);

  // J열의 함수 복사
  var formula =
    "=IFERROR(IF(INDEX('상품목록'!L:L, MATCH(G12, '상품목록'!K:K, 0))*L12=0, \"\", INDEX('상품목록'!L:L, MATCH(G12, '상품목록'!K:K, 0))*L12))";

  // 추가된 2000개 행에 함수 적용
  for (var i = 12; i < 12 + 2000; i++) {
    sheet1.getRange("J" + i).setFormula(formula.replace(/12/g, i));
  }

  // 모든 처리가 완료되면 K7 셀의 값을 빈 체크박스로 변경
  sheet1.getRange("K7").setValue("FALSE");
}

// function handleK7Check() {
//   var ss = SpreadsheetApp.getActiveSpreadsheet();
//   var sheet1 = ss.getSheetByName('시트1');

//   var data = sheet1.getDataRange().getValues();
//   var rowsUpdated = 0;

//   for (var i = 0; i < data.length; i++) {
//     if (data[i][10] === "정상입력") { // K열이 "정상 발주"인 경우 (0-index로 10번째)
//       data[i][23] = true; // X열을 true로 설정 (0-index로 23번째)
//       rowsUpdated++;
//     }
//   }

//   // 업데이트된 데이터를 시트에 반영
//   if (rowsUpdated > 0) {
//     sheet1.getRange(1, 1, data.length, data[0].length).setValues(data);
//     Logger.log('X열을 true로 변경한 행 수: ' + rowsUpdated);
//   }

//   // K7 셀에 "발주 처리 중" 메시지 표시
//   sheet1.getRange('K7').setValue('발주 처리 중');

//   // copyCheckedRows 함수 호출
//   copyCheckedRows();
// }

// function copyCheckedRows() {
//   var ss = SpreadsheetApp.getActiveSpreadsheet();
//   var sheet1 = ss.getSheetByName('시트1');
//   var sheet2 = ss.getSheetByName('시트2');

//   if (!sheet1) {
//     Logger.log('시트1을 찾을 수 없습니다.');
//     return;
//   }
//   if (!sheet2) {
//     Logger.log('시트2를 찾을 수 없습니다.');
//     return;
//   }

//   var data = sheet1.getDataRange().getValues();
//   var rowsToMove = [];

//   for (var i = 0; i < data.length; i++) {
//     if (data[i][23] === true) { // X열이 true인 경우 (0-index로 23번째)
//         var currentDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
//         var currentDateFormatted = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyMMdd");
//         var currentTime = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "HHmm");
//         var row = data[i];
//         var newRow = [
//           currentDate, // A: 발주일자
//           row[6] + "-" + row[0] + "-" + currentDateFormatted + "-" + currentTime + "-" + row[16] + "-" + row[19], // B: 발주번호
//           row[24], // C: 택배사
//           "", // D: 운송장번호
//           "발주완료", // E: 배송현황
//           "", // F: 취소요청시
//           "", // G: 체크 취소요청 상태
//           "입금확인중" // H: 입금확인
//         ];

//         // (가)배열의 A-X열을 (나)배열의 I-AF열로 복사
//         newRow = newRow.concat(row.slice(0, 24));
//       rowsToMove.push(newRow);
//     }
//   }

//   if (rowsToMove.length > 0) {
//     // rowsToMove를 PropertiesService에 저장
//     PropertiesService.getScriptProperties().setProperty('rowsToMove', JSON.stringify(rowsToMove));
//     PropertiesService.getScriptProperties().setProperty('currentBatch', 0);
//     Logger.log('Rows to move set in PropertiesService');
//     processBatch();
//   } else {
//     Logger.log('이동할 행이 없습니다.');
//     // 이동할 행이 없으면 K7 셀을 빈 체크박스로 설정
//     sheet1.getRange('K7').setValue(false);
//   }
// }

// function processBatch() {
//   try {
//     var rowsToMove = JSON.parse(PropertiesService.getScriptProperties().getProperty('rowsToMove'));
//     var currentBatch = parseInt(PropertiesService.getScriptProperties().getProperty('currentBatch'));
//     var batchSize = 100; // 한 번에 처리할 행 수
//     var sheet2 = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('시트2');

//     var start = currentBatch * batchSize;
//     var end = Math.min(start + batchSize, rowsToMove.length);
//     var batch = rowsToMove.slice(start, end);

//     sheet2.getRange(sheet2.getLastRow() + 1, 1, batch.length, batch[0].length).setValues(batch);
//     Logger.log('Processed batch from ' + start + ' to ' + end);

//     if (end < rowsToMove.length) {
//       PropertiesService.getScriptProperties().setProperty('currentBatch', currentBatch + 1);
//       processBatch(); // 즉시 다음 배치를 처리
//     } else {
//       deleteMarkedRows();
//     }
//   } catch (error) {
//     Logger.log('Error in processBatch: ' + error.message);
//   }
// }

// function deleteMarkedRows() {
//   var sheet1 = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('시트1');
//   var data = sheet1.getDataRange().getValues();
//   var rowsToDelete = [];

//   for (var i = 0; i < data.length; i++) {
//     if (data[i][23] === true) {
//       rowsToDelete.push(i + 1);
//     }
//   }

//   // 역순으로 삭제하여 인덱스가 틀어지지 않게 처리
//   for (var i = rowsToDelete.length - 1; i >= 0; i--) {
//     sheet1.deleteRow(rowsToDelete[i]);
//   }
//   Logger.log('Deleted marked rows from sheet1');

//   // 모든 작업이 완료되면 K7 셀을 빈 체크박스로 설정
//   sheet1.getRange('K7').setValue(false);
// }

// function listTriggers() {
//   var triggers = ScriptApp.getProjectTriggers();
//   for (var i = 0; i < triggers.length; i++) {
//     Logger.log(triggers[i].getHandlerFunction());
//   }
// }

function handleJ7CheckOutputMoveSheet(sheetName) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet1 = ss.getSheetByName(sheetName);
    var targetCellJ7 = sheet1.getRange("J7");

    targetCellJ7.setValue("발주서 \n초기화");
    var targetCellK7 = sheet1.getRange("K7");
    targetCellK7.setValue("FALSE");
    clearOrderSheet(sheetName);
    if (sheetName === "발주서") {
      addRowsAndSetDefaultsOrderSheet(sheet1, sheetName);
    } else if (sheetName === "발주서매핑모드") {
      addRowsAndSetDefaultsOrderSheetMapping(sheet1);
    }

    SpreadsheetApp.flush();
  } finally {
    targetCellJ7.setValue("FALSE");
  }
}

function handleK7CheckOutputMoveSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet1 = ss.getSheetByName("발주서");
  sheet1.getRange("K7").setValue("발주 처리 중 \n최대 10초 소요...");
  var sheet2 = ss.getSheetByName("누적발주");
  var data = sheet1.getDataRange().getValues();
  var sheet3 = ss.getSheetByName("상품목록").getRange("K6:L940").getValues();

  var productMap = {};
  for (var j = 0; j < sheet3.length; j++) {
    var key = sheet3[j][0]; // K열 값
    var value = sheet3[j][1]; // L열 값
    productMap[key] = value;
  }

  try {
    if (!sheet1 || !sheet2) {
      Logger.log("시트1 또는 시트2를 찾을 수 없습니다.");
      return;
    }

    var rowsToMove = [];
    var rowsToDelete = [];

    for (var i = 11; i < data.length; i++) {
      if (data[i][10] == "정상입력") {
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

        var row = data[i];

        var key = row[6];
        if (productMap.hasOwnProperty(key)) {
          row[9] = productMap[key];
        }

        var newRow = [
          currentDate, // A: 발주일자
          row[6] +
            "-" +
            row[0] +
            "-" +
            currentDateFormatted +
            "-" +
            currentTime +
            "-" +
            (i + 1) +
            row[16] +
            "-" +
            row[19], // B: 발주번호
          row[24], // C: 택배사
          "", // D: 운송장번호
          "발주완료", // E: 배송현황
          "", // F: 취소요청시
          "", // G: 체크 취소요청 상태
          "입금확인중", // H: 입금확인
        ];

        newRow = newRow.concat(row.slice(0, 23));
        newRow = newRow.concat([true]); // 마지막 열 추가
        rowsToMove.push(newRow);
        rowsToDelete.push(i);
      }
    }

    if (rowsToMove.length > 0) {
      appendRows(sheet2, rowsToMove);
      deleteRowsInBatches(sheet1, rowsToDelete);
    } else {
      Logger.log("이동할 행이 없습니다. 정상입력 확인을 눌러주세요.");
      var ui = SpreadsheetApp.getUi();
      ui.alert(
        "확인",
        "이동할 행이 없습니다. 발주상태를 확인해주세요.",
        ui.ButtonSet.YES_NO
      );
    }
  } catch (error) {
    Logger.log("Error in copyCheckedRows: " + error.message);
  } finally {
    sheet1.getRange("K7").setValue(false);
    addRowsAndSetDefaultsOrderSheet();
  }
}

function appendRows(sheet, rows) {
  if (rows.length > 0) {
    sheet
      .getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length)
      .setValues(rows);
  }
}

function deleteRowsInBatches(sheet, rowsToDelete) {
  rowsToDelete = rowsToDelete.map(function (row) {
    return Math.floor(row); // 모든 요소를 정수로 변환
  });

  // 내림차순으로 정렬
  rowsToDelete.sort(function (a, b) {
    return a - b;
  });

  var start = rowsToDelete[rowsToDelete.length - 1];
  var end = start;

  for (var i = rowsToDelete.length - 2; i >= 0; i--) {
    if (rowsToDelete[i] == start - 1) {
      // end = rowsToDelete[i];
      start = rowsToDelete[i];
    } else {
      sheet.deleteRows(start + 1, end - start + 1);
      end = rowsToDelete[i];
      start = end;
    }
  }
  sheet.deleteRows(start + 1, end - start + 1);
}

// function addRowsAndSetDefaults(sheet) {
//   var ss = SpreadsheetApp.getActiveSpreadsheet();
//   var sheet = ss.getSheetByName('발주서');
//   var lastRow = sheet.getLastRow();
//   var orderNumberValue = sheet.getRange("T4:T4").getValue();

//   if(lastRow < 12) {
//     var rangeA12 = sheet.getRange('A12:Y12');
//     rangeA12.setFontSize(10);
//     rangeA12.setBackground(null);
//     lastRow += 1;

//   };

//   if(lastRow > 1000) {
//     return
//   }

//   var numRowsToAdd = 1000 - lastRow;

//   // 행 추가
//   sheet.insertRowsAfter(lastRow, numRowsToAdd);
//   // 수식을 저장할 2차원 배열 생성
//   var formulas = [];
//   for (var i = 0; i < numRowsToAdd; i++) {
//     var rowNumber = lastRow + 1 + i;

//   formulas.push([
//     `=IF($A$8="매핑모드",
//       IFERROR(INDEX('상품목록'!C:C, MATCH(1, (E${rowNumber}='상품목록'!A:A) * (F${rowNumber}='상품목록'!B:B), 0)), ""),
//       IF($A$8="일반모드", D${rowNumber}, "")
//     )`,
//     `=IF($A$8="매핑모드", IF(E${rowNumber}<>"", IF(G${rowNumber}<>"", "정상매핑", "매핑오류"), ""), "")`,
//     '',
//     `=IFERROR(
//       IF(INDEX('상품목록'!L:L, MATCH('발주서'!G${rowNumber}, '상품목록'!K:K, 0)) * '발주서'!L${rowNumber} = 0,
//         "",
//         INDEX('상품목록'!L:L, MATCH('발주서'!G${rowNumber}, '상품목록'!K:K, 0)) * '발주서'!L${rowNumber}
//       )
//     )`,
//     `=IF($A$8="매핑모드",
//       IF(ISNUMBER(SEARCH("정상매핑", H${rowNumber})),
//         IF(AND(A${rowNumber}<>"", B${rowNumber}<>"", C${rowNumber}<>"", J${rowNumber}<>""), "정상입력", "필수입력사항 입력필요"),
//         IF(H${rowNumber}="매핑오류",
//           "매핑 확인필요",
//           IF(OR(A${rowNumber}<>"", B${rowNumber}<>"", C${rowNumber}<>"", J${rowNumber}<>""), "매핑 확인필요", "")
//         )
//       ),
//       IF($A$8="일반모드",
//         IF(AND(A${rowNumber}="", B${rowNumber}="", C${rowNumber}="", D${rowNumber}="", J${rowNumber}=""),
//           "",
//           IF(OR(A${rowNumber}="", B${rowNumber}="", C${rowNumber}="", D${rowNumber}="", J${rowNumber}=""),
//             "필수입력사항 입력필요",
//               "정상입력"
//             )
//           ),
//           ""
//         )
//       )`,
//       `=IFERROR(IF(LEN(G${rowNumber})=0,NA(), 1))`,
//       '','','','','','','',
//       `=IF(LEN(A${rowNumber})=0,"", ${orderNumberValue})`,
//       '','','','',
//       `=IFERROR(VLOOKUP(G${rowNumber}, '상품목록'!K$6:M, 3, FALSE), "")`,
//     ]);
//   }

//     // G열부터 Z열까지 수식을 설정
//     sheet.getRange(lastRow + 1, 7, numRowsToAdd, 19).setFormulas(formulas);

//     var optionsRange = ss.getSheetByName('상품목록').getRange('K6:K940');

//     // 데이터 유효성 검사 규칙 생성
//     var rule = SpreadsheetApp.newDataValidation()
//       .requireValueInRange(optionsRange, true)
//       .setAllowInvalid(true)  // 경고 표시
//       .setHelpText("올바른 값을 선택해주세요.")
//       .build();

//     // 발주서의 D12:D1000 범위에 데이터 유효성 검사 규칙 적용
//     sheet.getRange('D12:D1000').setDataValidation(rule);
// }

function addRowsAndSetDefaultsOrderSheet(sheet, sheetName) {
  var lastRow = sheet.getLastRow();
  var orderNumberValue = sheet.getRange("T4:T4").getValue();
  var numRowsToAdd = 1000;

  if (lastRow > 1000) {
    return;
  }

  if (lastRow < 12) {
    var rangeA12 = sheet.getRange("A12:Y12");
    rangeA12.setFontSize(10);
    rangeA12.setBackground(null);
    rangeA12.setFontWeight(null);
    rangeA12.setHorizontalAlignment(null);
    rangeA12.setVerticalAlignment("middle");
    var format = ["₩0"];
    var rangeJ12 = sheet.getRange("J12");
    var rangeL12 = sheet.getRange("L12");
    rangeJ12.setNumberFormat("₩0");
    rangeL12.setNumberFormat("0");

    SpreadsheetApp.flush();
    sheet.insertRowsAfter(lastRow + 1, 1000 - (lastRow + 1));
    numRowsToAdd = numRowsToAdd - lastRow;
  } else {
    sheet.insertRowsAfter(lastRow, 1000 - lastRow);
    numRowsToAdd = numRowsToAdd - lastRow;
  }

  // 수식을 저장할 2차원 배열 생성
  var formulas = [];
  for (var i = 0; i < numRowsToAdd; i++) {
    var rowNumber = lastRow + 1 + i;

    if (sheetName === "발주서") {
      formulas.push([
        `=IF($A$8="일반모드", D${rowNumber}, "")`,
        ``,
        ``,
        `=IFERROR(
      IF(INDEX('상품목록'!L:L, MATCH('발주서'!G${rowNumber}, '상품목록'!K:K, 0)) * '발주서'!L${rowNumber} = 0, 
        "", 
        INDEX('상품목록'!L:L, MATCH('발주서'!G${rowNumber}, '상품목록'!K:K, 0)) * '발주서'!L${rowNumber}
      )
    )`,
        `IF(AND(A${rowNumber}="", B${rowNumber}="", C${rowNumber}="", D${rowNumber}="", J${rowNumber}=""), 
          "", 
          IF(OR(A${rowNumber}="", B${rowNumber}="", C${rowNumber}="", D${rowNumber}="", J${rowNumber}=""), 
            "필수입력사항 입력필요", 
              "정상입력"
            )
          )`,
        `=IFERROR(IF(LEN(G${rowNumber})=0,NA(), 1))`,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        `=IF(LEN(A${rowNumber})=0,"", ${orderNumberValue})`,
        "",
        "",
        "",
        "",
        `=IFERROR(VLOOKUP(G${rowNumber}, '상품목록'!K$6:M, 3, FALSE), "")`,
      ]);
    } else if (sheetName == "발주서매핑모드") {
      formulas.push([
        `=IFERROR(INDEX('상품목록'!C:C, MATCH(1, (E${rowNumber}='상품목록'!A:A) * (F${rowNumber}='상품목록'!B:B), 0)), "")`,
        `=IF(E${rowNumber}<>"", IF(G${rowNumber}<>"", "정상매핑", "매핑오류"), "")`,
        ``,
        `=IFERROR(
      IF(INDEX('상품목록'!L:L, MATCH(G${rowNumber}, '상품목록'!K:K, 0)) * L${rowNumber} = 0, 
        "", 
        INDEX('상품목록'!L:L, MATCH(G${rowNumber}, '상품목록'!K:K, 0)) * L${rowNumber}
      )
    )`,
        `=IF(ISNUMBER(SEARCH("정상매핑", H${rowNumber})),
      IF(AND(A${rowNumber}<>"", B${rowNumber}<>"", C${rowNumber}<>"", J${rowNumber}<>""), "정상입력", "필수입력사항 입력필요"),
         IF(H${rowNumber}="매핑오류", 
           "매핑 확인필요", 
           IF(OR(A${rowNumber}<>"", B${rowNumber}<>"", C${rowNumber}<>"", J${rowNumber}<>""), "매핑 확인필요", "")
         ))`,
        `=IFERROR(IF(LEN(G${rowNumber})=0,NA(), 1))`,
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        `=IF(LEN(A${rowNumber})=0,"", ${orderNumberValue})`,
        "",
        "",
        "",
        "",
        `=IFERROR(VLOOKUP(G${rowNumber}, '상품목록'!K$6:M, 3, FALSE), "")`,
      ]);
    }
  }

  // G열부터 Z열까지 수식을 설정
  sheet.getRange(lastRow + 1, 7, numRowsToAdd, 19).setFormulas(formulas);

  var optionsRange = SpreadsheetApp.getActiveSpreadsheet()
    .getSheetByName("상품목록")
    .getRange("K6:K940");

  // 데이터 유효성 검사 규칙 생성
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(optionsRange, true)
    .setAllowInvalid(true) // 경고 표시
    .setHelpText("올바른 값을 선택해주세요.")
    .build();

  // 발주서의 D12:D1000 범위에 데이터 유효성 검사 규칙 적용
  sheet.getRange("D12:D1000").setDataValidation(rule);
  sheet
    .getRange(`X${lastRow + 1}:X${lastRow + numRowsToAdd}`)
    .insertCheckboxes();
}

function handleJ7CheckOutputMoveSheetMapping() {
  var sheet1 = ss.getSheetByName("발주서매핑모드");
  var targetCellJ7 = sheet1.getRange("J7");
  targetCellJ7.setValue("FALSE");
  var targetCellK7 = sheet1.getRange("K7");
  targetCellK7.setValue("FALSE");
}

function handleK7CheckOutputMoveSheetMapping() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet1 = ss.getSheetByName("발주서매핑모드");
  sheet1.getRange("K7").setValue("발주 처리 중 \n최대 10초 소요...");
  var sheet2 = ss.getSheetByName("누적발주");
  var data = sheet1.getDataRange().getValues();
  var sheet3 = ss.getSheetByName("상품목록").getRange("K6:L940").getValues();

  var productMap = {};
  for (var j = 0; j < sheet3.length; j++) {
    var key = sheet3[j][0]; // K열 값
    var value = sheet3[j][1]; // L열 값
    productMap[key] = value;
  }

  try {
    if (!sheet1 || !sheet2) {
      Logger.log("시트1 또는 시트2를 찾을 수 없습니다.");
      return;
    }

    var rowsToMove = [];
    var rowsToDelete = [];

    for (var i = 11; i < data.length; i++) {
      if (data[i][10] == "정상입력") {
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

        var row = data[i];

        var key = row[6];
        if (productMap.hasOwnProperty(key)) {
          row[9] = productMap[key];
        }

        var newRow = [
          currentDate, // A: 발주일자
          row[6] +
            "-" +
            row[0] +
            "-" +
            currentDateFormatted +
            "-" +
            currentTime +
            "-" +
            (i + 1) +
            row[16] +
            "-" +
            row[19], // B: 발주번호
          row[24], // C: 택배사
          "", // D: 운송장번호
          "발주완료", // E: 배송현황
          "", // F: 취소요청시
          "", // G: 체크 취소요청 상태
          "입금확인중", // H: 입금확인
        ];

        newRow = newRow.concat(row.slice(0, 23));
        newRow = newRow.concat([true]); // 마지막 열 추가
        rowsToMove.push(newRow);
        rowsToDelete.push(i);
      }
    }

    if (rowsToMove.length > 0) {
      appendRows(sheet2, rowsToMove);
      deleteRowsInBatches(sheet1, rowsToDelete);
    } else {
      Logger.log("이동할 행이 없습니다. 정상입력 확인을 눌러주세요.");
      var ui = SpreadsheetApp.getUi();
      ui.alert(
        "확인",
        "이동할 행이 없습니다. 발주상태를 확인해주세요.",
        ui.ButtonSet.YES_NO
      );
    }
  } catch (error) {
    Logger.log("Error in copyCheckedRows: " + error.message);
  } finally {
    sheet1.getRange("K7").setValue(false);
    addRowsAndSetDefaultsOrderSheetMapping();
  }
}

function appendRows(sheet, rows) {
  if (rows.length > 0) {
    sheet
      .getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length)
      .setValues(rows);
  }
}

function deleteRowsInBatches(sheet, rowsToDelete) {
  rowsToDelete = rowsToDelete.map(function (row) {
    return Math.floor(row); // 모든 요소를 정수로 변환
  });

  // 내림차순으로 정렬
  rowsToDelete.sort(function (a, b) {
    return a - b;
  });

  var start = rowsToDelete[rowsToDelete.length - 1];
  var end = start;

  for (var i = rowsToDelete.length - 2; i >= 0; i--) {
    if (rowsToDelete[i] == start - 1) {
      // end = rowsToDelete[i];
      start = rowsToDelete[i];
    } else {
      sheet.deleteRows(start + 1, end - start + 1);
      end = rowsToDelete[i];
      start = end;
    }
  }
  sheet.deleteRows(start + 1, end - start + 1);
}

// function addRowsAndSetDefaults(sheet) {
//   var ss = SpreadsheetApp.getActiveSpreadsheet();
//   var sheet = ss.getSheetByName('발주서');
//   var lastRow = sheet.getLastRow();
//   var orderNumberValue = sheet.getRange("T4:T4").getValue();

//   if(lastRow < 12) {
//     var rangeA12 = sheet.getRange('A12:Y12');
//     rangeA12.setFontSize(10);
//     rangeA12.setBackground(null);
//     lastRow += 1;

//   };

//   if(lastRow > 1000) {
//     return
//   }

//   var numRowsToAdd = 1000 - lastRow;

//   // 행 추가
//   sheet.insertRowsAfter(lastRow, numRowsToAdd);
//   // 수식을 저장할 2차원 배열 생성
//   var formulas = [];
//   for (var i = 0; i < numRowsToAdd; i++) {
//     var rowNumber = lastRow + 1 + i;

//   formulas.push([
//     `=IF($A$8="매핑모드",
//       IFERROR(INDEX('상품목록'!C:C, MATCH(1, (E${rowNumber}='상품목록'!A:A) * (F${rowNumber}='상품목록'!B:B), 0)), ""),
//       IF($A$8="일반모드", D${rowNumber}, "")
//     )`,
//     `=IF($A$8="매핑모드", IF(E${rowNumber}<>"", IF(G${rowNumber}<>"", "정상매핑", "매핑오류"), ""), "")`,
//     '',
//     `=IFERROR(
//       IF(INDEX('상품목록'!L:L, MATCH('발주서'!G${rowNumber}, '상품목록'!K:K, 0)) * '발주서'!L${rowNumber} = 0,
//         "",
//         INDEX('상품목록'!L:L, MATCH('발주서'!G${rowNumber}, '상품목록'!K:K, 0)) * '발주서'!L${rowNumber}
//       )
//     )`,
//     `=IF($A$8="매핑모드",
//       IF(ISNUMBER(SEARCH("정상매핑", H${rowNumber})),
//         IF(AND(A${rowNumber}<>"", B${rowNumber}<>"", C${rowNumber}<>"", J${rowNumber}<>""), "정상입력", "필수입력사항 입력필요"),
//         IF(H${rowNumber}="매핑오류",
//           "매핑 확인필요",
//           IF(OR(A${rowNumber}<>"", B${rowNumber}<>"", C${rowNumber}<>"", J${rowNumber}<>""), "매핑 확인필요", "")
//         )
//       ),
//       IF($A$8="일반모드",
//         IF(AND(A${rowNumber}="", B${rowNumber}="", C${rowNumber}="", D${rowNumber}="", J${rowNumber}=""),
//           "",
//           IF(OR(A${rowNumber}="", B${rowNumber}="", C${rowNumber}="", D${rowNumber}="", J${rowNumber}=""),
//             "필수입력사항 입력필요",
//               "정상입력"
//             )
//           ),
//           ""
//         )
//       )`,
//       `=IFERROR(IF(LEN(G${rowNumber})=0,NA(), 1))`,
//       '','','','','','','',
//       `=IF(LEN(A${rowNumber})=0,"", ${orderNumberValue})`,
//       '','','','',
//       `=IFERROR(VLOOKUP(G${rowNumber}, '상품목록'!K$6:M, 3, FALSE), "")`,
//     ]);
//   }

//     // G열부터 Z열까지 수식을 설정
//     sheet.getRange(lastRow + 1, 7, numRowsToAdd, 19).setFormulas(formulas);

//     var optionsRange = ss.getSheetByName('상품목록').getRange('K6:K940');

//     // 데이터 유효성 검사 규칙 생성
//     var rule = SpreadsheetApp.newDataValidation()
//       .requireValueInRange(optionsRange, true)
//       .setAllowInvalid(true)  // 경고 표시
//       .setHelpText("올바른 값을 선택해주세요.")
//       .build();

//     // 발주서의 D12:D1000 범위에 데이터 유효성 검사 규칙 적용
//     sheet.getRange('D12:D1000').setDataValidation(rule);
// }

function addRowsAndSetDefaultsOrderSheetMapping(sheet) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("발주서매핑모드");
  var lastRow = sheet.getLastRow();
  var orderNumberValue = sheet.getRange("T4:T4").getValue();
  var numRowsToAdd = 1000;

  if (lastRow > 1000) {
    return;
  }

  if (lastRow < 12) {
    var rangeA12 = sheet.getRange("A12:Y12");
    rangeA12.setFontSize(10);
    rangeA12.setBackground(null);

    SpreadsheetApp.flush();
    sheet.insertRowsAfter(lastRow + 1, 1000 - (lastRow + 1));
    numRowsToAdd = numRowsToAdd - lastRow;
  } else {
    sheet.insertRowsAfter(lastRow, 1000 - lastRow);
    numRowsToAdd = numRowsToAdd - lastRow;
  }

  // 수식을 저장할 2차원 배열 생성
  var formulas = [];
  for (var i = 0; i < numRowsToAdd; i++) {
    var rowNumber = lastRow + 1 + i;

    formulas.push([
      `=IFERROR(INDEX('상품목록'!C:C, MATCH(1, (E${rowNumber}='상품목록'!A:A) * (F${rowNumber}='상품목록'!B:B), 0)), "")`,
      `=IF(E${rowNumber}<>"", IF(G${rowNumber}<>"", "정상매핑", "매핑오류"), "")`,
      ``,
      `=IFERROR(
      IF(INDEX('상품목록'!L:L, MATCH(G${rowNumber}, '상품목록'!K:K, 0)) * L${rowNumber} = 0, 
        "", 
        INDEX('상품목록'!L:L, MATCH(G${rowNumber}, '상품목록'!K:K, 0)) * L${rowNumber}
      )
    )`,
      `=IF(ISNUMBER(SEARCH("정상매핑", H${rowNumber})),
      IF(AND(A${rowNumber}<>"", B${rowNumber}<>"", C${rowNumber}<>"", J${rowNumber}<>""), "정상입력", "필수입력사항 입력필요"),
         IF(H${rowNumber}="매핑오류", 
           "매핑 확인필요", 
           IF(OR(A${rowNumber}<>"", B${rowNumber}<>"", C${rowNumber}<>"", J${rowNumber}<>""), "매핑 확인필요", "")
         ))`,
      `=IFERROR(IF(LEN(G${rowNumber})=0,NA(), 1))`,
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      `=IF(LEN(A${rowNumber})=0,"", ${orderNumberValue})`,
      "",
      "",
      "",
      "",
      `=IFERROR(VLOOKUP(G${rowNumber}, '상품목록'!K$6:M, 3, FALSE), "")`,
    ]);
  }

  sheet.getRange(lastRow + 1, 7, numRowsToAdd, 19).setFormulas(formulas);

  var optionsRange = ss.getSheetByName("상품목록").getRange("K6:K940");

  // 데이터 유효성 검사 규칙 생성
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(optionsRange, true)
    .setAllowInvalid(true) // 경고 표시
    .setHelpText("올바른 값을 선택해주세요.")
    .build();

  // 발주서의 D12:D1000 범위에 데이터 유효성 검사 규칙 적용
  sheet.getRange("D12:D1000").setDataValidation(rule);
  sheet
    .getRange(`X${lastRow + 1}:X${lastRow + numRowsToAdd}`)
    .insertCheckboxes();
}

function appendRows(sheet, rows) {
  if (rows.length > 0) {
    sheet
      .getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length)
      .setValues(rows);
  }
}

function deleteRowsInBatches(sheet, rowsToDelete) {
  rowsToDelete = rowsToDelete.map(function (row) {
    return Math.floor(row); // 모든 요소를 정수로 변환
  });

  // 내림차순으로 정렬
  rowsToDelete.sort(function (a, b) {
    return a - b;
  });

  var start = rowsToDelete[rowsToDelete.length - 1];
  var end = start;

  for (var i = rowsToDelete.length - 2; i >= 0; i--) {
    if (rowsToDelete[i] == start - 1) {
      // end = rowsToDelete[i];
      start = rowsToDelete[i];
    } else {
      sheet.deleteRows(start + 1, end - start + 1);
      end = rowsToDelete[i];
      start = end;
    }
  }
  sheet.deleteRows(start + 1, end - start + 1);
}

function clearOrderSheet(sheetName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return;

  // 12번 행부터 마지막 행까지 삭제
  var lastRow = sheet.getLastRow();
  if (lastRow > 12) {
    sheet.deleteRows(12, lastRow - 11);
  }
}

// function createK7AndK8(sheet) {
//   var rangeK6 = sheet.getRange('K6');
//   var rangeL6 = sheet.getRange('L6');
//   var rangeK7 = sheet.getRange('K7');
//   var rangeL7 = sheet.getRange('L7');

//   // K7, L7에 텍스트와 포맷 설정
//   rangeK6.setValue('예');
//   rangeL6.setValue('아니요');

//   var ranges6 = [rangeK6, rangeL6];
//   ranges6.forEach(function(range) {
//     range.setBackground('#FCE598');
//     range.setFontSize(13);
//     range.setFontWeight('bold');
//     range.setHorizontalAlignment('center');
//     range.setVerticalAlignment('middle');
//     range.setBorder(true, true, true, true, true, true);
//   });

//   var ranges7 = [rangeK7, rangeL7];

//   ranges7.forEach(function(range) {
//     // range.setBackground('#FFFF04');
//     range.setBackground(null);
//     range.setFontSize(13);
//     range.setFontColor('#000000');
//     range.setHorizontalAlignment('center');
//     range.setVerticalAlignment('middle');
//     range.setBorder(true, true, true, true, true, true);

//     range.insertCheckboxes();
//     range.insertCheckboxes();
//   });

//   // K8, L8에 체크박스 추가
//   // rangeK8.insertCheckboxes();
//   // rangeL8.insertCheckboxes();
// }
