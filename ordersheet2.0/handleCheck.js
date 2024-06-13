function onEdit(e) {
  var sheet = e.source.getActiveSheet();
  handleEditForSheet1(e);
  if (
    sheet.getName() === "발주서" &&
    e.range.getA1Notation() === "K7" &&
    e.value === "TRUE"
  ) {
    handleK7Check();
  }
}

function handleK7Check() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet1 = ss.getSheetByName("발주서");

  // K7 셀에 "발주 처리 중" 메시지 표시
  sheet1.getRange("K7").setValue("발주 처리 중");

  var data = sheet1.getDataRange().getValues();
  var rowsUpdated = 0;

  for (var i = 0; i < data.length; i++) {
    if (data[i][10] === "정상입력") {
      // K열이 "정상 발주"인 경우 (0-index로 10번째)
      data[i][23] = true; // X열을 true로 설정 (0-index로 23번째)
      rowsUpdated++;
    }
  }

  // 업데이트된 데이터를 시트에 반영
  if (rowsUpdated > 0) {
    sheet1.getRange(1, 1, data.length, data[0].length).setValues(data);
    Logger.log("X열을 true로 변경한 행 수: " + rowsUpdated);
  }

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
  var rowsToMove = [];

  for (var i = 0; i < data.length; i++) {
    if (data[i][23] === true) {
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
      newRow = newRow.concat(row.slice(0, 24));
      rowsToMove.push(newRow);
      // rowsToMove.push(data[i]);
    }
  }

  if (rowsToMove.length > 0) {
    // rowsToMove를 PropertiesService에 저장
    PropertiesService.getScriptProperties().setProperty(
      "rowsToMove",
      JSON.stringify(rowsToMove)
    );
    PropertiesService.getScriptProperties().setProperty("currentBatch", 0);
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
    var batchSize = 100; // 한 번에 처리할 행 수
    var sheet2 =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName("누적발주");

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
      clearSheet1();
    }
  } catch (error) {
    Logger.log("Error in processBatch: " + error.message);
    // 에러 발생 시 "발주 처리 중" 메시지를 빈 체크박스로 변경
    SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName("발주서")
      .getRange("K7")
      .setValue("FALSE");
  }
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
