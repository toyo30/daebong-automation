function updateSheetStatus(sheet, rowIndex, columnIndex, newValue) {
  sheet.getRange(rowIndex + 1, columnIndex).setValue(newValue);
}

function appendRowToSheet(sheet, rowData) {
  sheet.appendRow(rowData);
}

function findRowByValue(sheet, columnIndex, value) {
  var data = sheet.getDataRange().getValues();
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

  var data = orderSheet.getDataRange().getValues();
  var rowsToProcess = [];
  // 삭제할 행 인덱스를 모아놓을 배열
  var rowsToDelete = [];

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
  processOrders();
}

function processOrders() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var orderSheet = ss.getSheetByName("발주대기상품");
  var confirmedSheet = ss.getSheetByName("발주확정상품");
  var sellerOrderSheet = ss.getSheetByName("셀러발주서정보");

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

  var batchSize = 100;
  var start = currentBatch * batchSize;
  var end = Math.min(start + batchSize, rowsToProcess.length);

  for (var i = start; i < end; i++) {
    var rowIndex = rowsToProcess[i];
    var rowData = data[rowIndex];

    // E열을 "출고대기"로 변경
    updateSheetStatus(orderSheet, rowIndex, 5, "출고대기");
    var changedRowData = [
      ...rowData.slice(0, 4),
      "출고대기",
      ...rowData.slice(5),
    ];

    // "발주확정상품" 시트에 추가
    appendRowToSheet(confirmedSheet, changedRowData);

    // AB열의 코드 가져오기
    var code = rowData[27]; // AB열의 인덱스는 27 (0부터 시작)
    Logger.log("code");
    Logger.log(code);

    // 셀러발주서정보 시트에서 C열 아이디 가져오기
    var sellerData = sellerOrderSheet.getDataRange().getValues();
    var sellerId = sellerData[parseInt(code)][2];
    Logger.log("sellerData[parseInt(code)][2]");
    Logger.log(sellerData[parseInt(code)][2]);
    if (sellerId) {
      // 아이디에 해당하는 스프레드시트 접근
      var sellerSpreadsheet = SpreadsheetApp.openById(sellerId);
      var cumulativeOrderSheet = sellerSpreadsheet.getSheetByName("누적발주");

      // "누적발주" 시트에서 동일한 B열 값을 찾기
      var rowToUpdate = findRowByValue(cumulativeOrderSheet, 2, rowData[1]); // B열은 2번째 컬럼
      if (rowToUpdate != -1) {
        var cumulativeData = cumulativeOrderSheet.getDataRange().getValues();
        if (cumulativeData[rowToUpdate][4] == "상품준비중") {
          updateSheetStatus(cumulativeOrderSheet, rowToUpdate, 5, "출고대기");
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

  if (end < rowsToProcess.length) {
    PropertiesService.getScriptProperties().setProperty(
      "currentBatch",
      currentBatch + 1
    );
    processBatchOrders(); // 다음 배치 처리
  } else {
    Logger.log("All batches processed");
    // 행을 뒤에서부터 삭제
    // for (var j = rowsToDelete.length - 1; j >= 0; j--) {
    //   orderSheet.deleteRow(rowsToDelete[j] + 1);
    // }
  }
}
