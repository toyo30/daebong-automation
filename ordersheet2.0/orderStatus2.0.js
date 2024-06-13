function updateSheetStatus(sheet, rowIndex, columnIndex, newValue) {
  sheet.getRange(rowIndex + 1, columnIndex).setValue(newValue);
}

function appendRowToSheet(sheet, rowData) {
  sheet.appendRow(rowData);
}

function findRowByValue(data, columnIndex, value) {
  for (var i = 1; i < data.length; i++) {
    if (data[i][columnIndex - 1] == value) {
      return i;
    }
  }
  return -1;
}

function processBatchOrders() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var orderSheet = ss.getSheetByName("발주대기상품");
  var confirmedSheet = ss.getSheetByName("발주확정상품");
  var sellerOrderSheet = ss.getSheetByName("셀러발주서정보");
  var sellerData = sellerOrderSheet.getDataRange().getValues();

  var data = orderSheet.getDataRange().getValues();
  var rowsToProcess = [];
  // 삭제할 행 인덱스를 모아놓을 배열
  var rowsToDelete = [];
  var orderSheetUpdateSheetArrayIndex = [];
  var confirmedSheetUpdateSheetArray = [];
  var sellerSpreadsheetObject = {};

  for (var i = 1; i < data.length; i++) {
    if (data[i][4] == "상품준비중") {
      rowsToProcess.push(i);
    } else if (data[i][4] == "출고대기") {
      // E열이 "출고대기"인 경우
      rowsToDelete.push(i); // 행 번호는 1부터 시작하므로 +1
    }
  }
  PropertiesService.getScriptProperties().setProperty(
    "rowsToProcess",
    JSON.stringify(rowsToProcess)
  );
  PropertiesService.getScriptProperties().setProperty(
    "rowsToDelete",
    JSON.stringify(rowsToDelete)
  );
  PropertiesService.getScriptProperties().setProperty("currentBatch", 0);
  PropertiesService.getScriptProperties().setProperty(
    "data",
    JSON.stringify(data)
  );

  PropertiesService.getScriptProperties().setProperty(
    "orderSheetUpdateSheetArrayIndex",
    JSON.stringify(orderSheetUpdateSheetArrayIndex)
  );

  PropertiesService.getScriptProperties().setProperty(
    "confirmedSheetUpdateSheetArray",
    JSON.stringify(confirmedSheetUpdateSheetArray)
  );
  PropertiesService.getScriptProperties().setProperty(
    "sellerSpreadsheetObject",
    JSON.stringify(sellerSpreadsheetObject)
  );

  processOrders(orderSheet, confirmedSheet, sellerOrderSheet, sellerData);
}

function processOrders(
  orderSheet,
  confirmedSheet,
  sellerOrderSheet,
  sellerData
) {
  // var ss = SpreadsheetApp.getActiveSpreadsheet();
  // var orderSheet = ss.getSheetByName("발주대기상품");
  // var confirmedSheet = ss.getSheetByName("발주확정상품");
  // var sellerOrderSheet = ss.getSheetByName("셀러발주서정보");
  // var sellerData = sellerOrderSheet.getDataRange().getValues();

  var rowsToProcess = JSON.parse(
    PropertiesService.getScriptProperties().getProperty("rowsToProcess")
  );
  var rowsToDelete = JSON.parse(
    PropertiesService.getScriptProperties().getProperty("rowsToDelete")
  );
  var currentBatch = parseInt(
    PropertiesService.getScriptProperties().getProperty("currentBatch")
  );
  var data = JSON.parse(
    PropertiesService.getScriptProperties().getProperty("data")
  );

  var orderSheetUpdateSheetArrayIndex = JSON.parse(
    PropertiesService.getScriptProperties().getProperty(
      "orderSheetUpdateSheetArrayIndex"
    )
  );
  var confirmedSheetUpdateSheetArray = JSON.parse(
    PropertiesService.getScriptProperties().getProperty(
      "confirmedSheetUpdateSheetArray"
    )
  );
  var sellerSpreadsheetObject = JSON.parse(
    PropertiesService.getScriptProperties().getProperty(
      "sellerSpreadsheetObject"
    )
  );
  Logger.log("sellerSpreadsheetObject");
  Logger.log(sellerSpreadsheetObject);
  //  var orderSheetUpdateSheetArrayIndex = [];
  // var confirmedSheetUpdateSheetArray = [];
  // var sellerSpreadsheetObject = {};

  var batchSize = 100;
  var start = currentBatch * batchSize;
  var end = Math.min(start + batchSize, rowsToProcess.length);

  for (var i = start; i < end; i++) {
    var rowIndex = rowsToProcess[i];
    var rowData = data[rowIndex];

    // E열을 "출고대기"로 변경
    //여기서 인덱스를 기다리도록 대기했다가. 인덱스를 계속 기록해. 수정할 것들의 인덱스를 계속 기록해
    // updateSheetStatus(orderSheet, rowIndex, 5, "출고대기");
    var changedRowData = [
      ...rowData.slice(0, 4),
      "출고대기",
      ...rowData.slice(5),
    ];

    // // "발주확정상품" 시트에 추가
    // appendRowToSheet(confirmedSheet, changedRowData);

    orderSheetUpdateSheetArrayIndex.push([rowIndex, changedRowData]);
    confirmedSheetUpdateSheetArray.push(changedRowData);

    // AB열의 코드 가져오기
    var code = rowData[27]; // AB열의 인덱스는 27 (0부터 시작)
    Logger.log("code");
    // Logger.log(code);

    // 셀러발주서정보 시트에서 C열 아이디 가져오기

    // var sellerId = sellerData[parseInt(code)][2];
    // Logger.log("sellerData[parseInt(code)][2]");
    // Logger.log(sellerData[parseInt(code)][2]);

    if (code) {
      if (sellerSpreadsheetObject.hasOwnProperty(code)) {
        var sellerSpreadsheet =
          sellerSpreadsheetObject[code]["sellerSpreadsheet"];
        var cumulativeOrderSheet =
          sellerSpreadsheetObject[code]["cumulativeOrderSheet"];
        var cumulativeData = sellerSpreadsheetObject[code]["cumulativeData"];
      } else {
        var sellerId = sellerData[parseInt(code)][2];
        var sellerSpreadsheet = SpreadsheetApp.openById(sellerId);
        var cumulativeOrderSheet = sellerSpreadsheet.getSheetByName("누적발주");
        var cumulativeData = cumulativeOrderSheet.getDataRange().getValues();
        sellerSpreadsheetObject[code] = {
          code: code,
          sellerId: sellerId,
          sellerSpreadsheet: JSON.stringify(sellerSpreadsheet),
          cumulativeOrderSheet: JSON.stringify(cumulativeOrderSheet),
          cumulativeData: cumulativeData,
          rowToUpdateArray: [],
        };
      }

      // "누적발주" 시트에서 동일한 B열 값을 찾기
      var rowToUpdate = findRowByValue(cumulativeData, 2, rowData[1]); // B열은 2번째 컬럼
      if (rowToUpdate != -1) {
        if (cumulativeData[rowToUpdate][4] == "상품준비중") {
          // updateSheetStatus(cumulativeOrderSheet, rowToUpdate, 5, "출고대기");
          sellerSpreadsheetObject[code].rowToUpdateArray.push([
            rowToUpdate,
            changedRowData,
          ]);
        }
      }
    }
    if (!rowsToDelete.includes(rowIndex)) {
      // 이미 포함되어 있지 않은 경우에만 추가
      rowsToDelete.push(rowIndex); // 행 번호는 1부터 시작하므로 +1
    }
  }

  PropertiesService.getScriptProperties().setProperty(
    "rowsToDelete",
    JSON.stringify(rowsToDelete)
  );
  PropertiesService.getScriptProperties().setProperty(
    "orderSheetUpdateSheetArrayIndex",
    JSON.stringify(orderSheetUpdateSheetArrayIndex)
  );
  PropertiesService.getScriptProperties().setProperty(
    "confirmedSheetUpdateSheetArray",
    JSON.stringify(confirmedSheetUpdateSheetArray)
  );
  PropertiesService.getScriptProperties().setProperty(
    "sellerSpreadsheetObject",
    JSON.stringify(sellerSpreadsheetObject)
  );

  if (end < rowsToProcess.length) {
    PropertiesService.getScriptProperties().setProperty(
      "currentBatch",
      currentBatch + 1
    );
    Logger.log("다음으로");

    Logger.log("confirmedSheetUpdateSheetArray");
    // Logger.log(confirmedSheetUpdateSheetArray.slice(0, 5));
    // Logger.log("sellerSpreadsheetObject");
    // Logger.log(sellerSpreadsheetObject);
    // Logger.log("rowsToDelete");
    // Logger.log(rowsToDelete);
    Logger.log(sellerSpreadsheetObject["143"]["sellerId"]);
    Logger.log(sellerSpreadsheetObject["143"]["rowToUpdateArray"]);
    Logger.log(sellerSpreadsheetObject["143"]["cumulativeOrderSheet"]);
    processOrders(orderSheet, confirmedSheet, sellerOrderSheet, sellerData); // 다음 배치 처리
  } else {
    Logger.log("All batches processed");
    Logger.log("confirmedSheetUpdateSheetArray");
    Logger.log(confirmedSheetUpdateSheetArray);
    Logger.log(sellerSpreadsheetObject["143"]["sellerId"]);
    Logger.log(sellerSpreadsheetObject["143"]["rowToUpdateArray"]);
    Logger.log(sellerSpreadsheetObject["143"]["cumulativeOrderSheet"]);
    Logger.log("sellerSpreadsheetObject");
    Logger.log(sellerSpreadsheetObject);
    Logger.log("rowsToDelete");
    Logger.log(rowsToDelete);

    // appendRows(confirmedSheet, confirmedSheetUpdateSheetArray);
    // updateSellerSpreadsheets(sellerSpreadsheetObject);
    deleteRowsInBatches(orderSheet, rowsToDelete);
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

function appendRows(sheet, rows) {
  if (rows.length > 0) {
    sheet
      .getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length)
      .setValues(rows);
  }
}

function updateSellerSpreadsheets(sellerSpreadsheetObject) {
  for (var code in sellerSpreadsheetObject) {
    var obj = sellerSpreadsheetObject[code];
    // var cumulativeOrderSheet = JSON.parse(sellerSpreadsheet)
    var cumulativeOrderSheet = SpreadsheetApp.openById(
      sellerSpreadsheetObject[code].sellerId
    ).getSheetByName("누적발주");
    var rows = obj.rowToUpdateArray;

    if (rows.length > 0) {
      // 인덱스 순서대로 내림차순 정렬
      rows.sort(function (a, b) {
        return a[0] - b[0];
      });

      var start = parseInt(rows[0][0]);
      var end = start;
      var dataBatch = [rows[0][1]];

      for (var i = 1; i < rows.length; i++) {
        if (rows[i][0] == end + 1) {
          end = rows[i][0];
          dataBatch.push(rows[i][1]);
        } else {
          cumulativeOrderSheet
            .getRange(start + 1, 1, dataBatch.length, dataBatch[0].length)
            .setValues(dataBatch);
          start = rows[i][0];
          end = start;
          dataBatch = [rows[i][1]];
        }
      }

      // 마지막 배치 처리
      cumulativeOrderSheet
        .getRange(start + 1, 1, dataBatch.length, dataBatch[0].length)
        .setValues(dataBatch);
    }
  }
}
