function importFilteredData() {
  // 발주대기상품이 있는 스프레드시트와 시트 ID
  var sourceSpreadsheetId = "1tRaty5BdhhVWrBvsx-SvMBHnnJaZZRekh2-4SJnFuqc";
  var sellerSheetName = "셀러발주서정보";

  try {
    // 셀러발주서정보 시트 데이터 가져오기
    var sellerSpreadsheet = SpreadsheetApp.openById(sourceSpreadsheetId);
    var sellerSheet = sellerSpreadsheet.getSheetByName(sellerSheetName);
    if (!sellerSheet) {
      throw new Error("셀러발주서정보 시트를 찾을 수 없습니다.");
    }
    var sheetIds = sellerSheet
      .getRange("C2:C")
      .getValues()
      .flat()
      .filter(String); // C열의 모든 시트 ID를 가져옴

    // 예금자 정보를 다 가져옴
    const depositObjectByOrderNumber = getAllDepositObjectByOrderNumber();
    Logger.log("depositObjectByOrderNumber");
    Logger.log(depositObjectByOrderNumber);

    // 초기 설정을 위해 속성 저장소에 데이터 저장
    PropertiesService.getScriptProperties().setProperty(
      "sheetIds",
      JSON.stringify(sheetIds)
    );
    PropertiesService.getScriptProperties().setProperty("currentSheetIndex", 0);
    PropertiesService.getScriptProperties().setProperty(
      "depositObjectByOrderNumber",
      JSON.stringify(depositObjectByOrderNumber)
    );

    processBatchImportFilteredData(); // 배치 처리 시작
  } catch (e) {
    Logger.log("Error: " + e.message);
  }
}

function processBatchImportFilteredData() {
  try {
    var sheetIds = JSON.parse(
      PropertiesService.getScriptProperties().getProperty("sheetIds")
    );
    var currentSheetIndex = parseInt(
      PropertiesService.getScriptProperties().getProperty("currentSheetIndex")
    );
    var depositObjectByOrderNumber = JSON.parse(
      PropertiesService.getScriptProperties().getProperty(
        "depositObjectByOrderNumber"
      )
    );

    Logger.log("sheetIds");
    Logger.log(sheetIds);
    if (currentSheetIndex < sheetIds.length) {
      var sheetId = sheetIds[currentSheetIndex];
      var targetSpreadsheet = SpreadsheetApp.openById(sheetId);
      var targetSheet = targetSpreadsheet.getSheetByName("누적발주");
      if (!targetSheet) {
        Logger.log("누적발주를 찾을 수 없습니다. 스프레드시트 ID: " + sheetId);
        currentSheetIndex++;
        PropertiesService.getScriptProperties().setProperty(
          "currentSheetIndex",
          currentSheetIndex
        );
        processBatchImportFilteredData();
        return;
      }

      var data = targetSheet.getDataRange().getValues();
      var filteredData = data.filter(function (row) {
        return row[4] == "발주완료";
      });

      Logger.log("filteredData");
      Logger.log(filteredData);

      var updatefilteredData = [];

      for (var i = 0; i < filteredData.length; i++) {
        var keyInFilteredData = filteredData[i][27];
        if (depositObjectByOrderNumber.hasOwnProperty(keyInFilteredData)) {
          var totalAmount =
            depositObjectByOrderNumber[keyInFilteredData].amount;
          let orderNumber = parseInt(keyInFilteredData);
          if (isNaN(keyInFilteredData)) {
            orderNumber = parseFloat(keyInFilteredData);
          }

          if (insertCheckOrderItem(filteredData[i], orderNumber, totalAmount)) {
            filteredData[i][4] = "상품준비중";
            filteredData[i][7] = "입금확인완료";
            var rowIndex = data.findIndex(function (originalRow) {
              return originalRow === filteredData[i];
            });
            targetSheet.getRange(rowIndex + 1, 5).setValue("상품준비중");
            targetSheet.getRange(rowIndex + 1, 8).setValue("입금확인완료");
            updatefilteredData.push(filteredData[i]);
          } else {
            filteredData[i][4] = "발주완료";
            filteredData[i][7] = "금액확인필요";
            var rowIndex = data.findIndex(function (originalRow) {
              return originalRow === filteredData[i];
            });
            targetSheet.getRange(rowIndex + 1, 5).setValue("발주완료");
            targetSheet.getRange(rowIndex + 1, 8).setValue("금액확인필요");
          }

          if (
            depositObjectByOrderNumber[keyInFilteredData].amount -
              filteredData[i][17] >=
            0
          ) {
            depositObjectByOrderNumber[keyInFilteredData].amount =
              insertCheckedDepositor(
                filteredData[i][27],
                filteredData[i][17],
                totalAmount
              );
          }
        }
      }

      var sourceSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
      var sourceSheet = sourceSpreadsheet.getSheetByName("발주대기상품");
      if (!sourceSheet) {
        throw new Error("발주대기상품 시트를 찾을 수 없습니다.");
      }

      var lastRow = sourceSheet.getLastRow();
      var startRow = lastRow + 1;

      if (updatefilteredData.length > 0) {
        sourceSheet
          .getRange(
            startRow,
            1,
            updatefilteredData.length,
            updatefilteredData[0].length
          )
          .setValues(updatefilteredData);
      }

      currentSheetIndex++;
      PropertiesService.getScriptProperties().setProperty(
        "currentSheetIndex",
        currentSheetIndex
      );
      processBatchImportFilteredData(); // 다음 배치 처리
    } else {
      Logger.log("All sheets processed");
    }
  } catch (e) {
    Logger.log("Error: " + e.message);
  }
}

function updateTrackingNumbers() {
  var sourceSpreadsheetId = "1tRaty5BdhhVWrBvsx-SvMBHnnJaZZRekh2-4SJnFuqc";
  var sourceSheetName = "발주확정상품";
  var sellerSheetName = "셀러발주서정보";

  try {
    var sellerSpreadsheet = SpreadsheetApp.openById(sourceSpreadsheetId);
    var sellerSheet = sellerSpreadsheet.getSheetByName(sellerSheetName);
    if (!sellerSheet) {
      throw new Error("셀러발주서정보 시트를 찾을 수 없습니다.");
    }
    var sheetIds = sellerSheet
      .getRange("C2:C")
      .getValues()
      .flat()
      .filter(String);

    var sourceSheet = sellerSpreadsheet.getSheetByName(sourceSheetName);
    if (!sourceSheet) {
      throw new Error("발주확정상품 시트를 찾을 수 없습니다.");
    }
    var sourceData = sourceSheet.getDataRange().getValues();

    var trackingData = {};
    for (var i = 1; i < sourceData.length; i++) {
      var orderCode = sourceData[i][1];
      var trackingValues = sourceData[i].slice(2, 5);
      if (orderCode) {
        trackingData[orderCode] = trackingValues;
      }
    }

    PropertiesService.getScriptProperties().setProperty(
      "trackingData",
      JSON.stringify(trackingData)
    );
    PropertiesService.getScriptProperties().setProperty(
      "currentTrackingSheetIndex",
      0
    );
    PropertiesService.getScriptProperties().setProperty(
      "trackingSheetIds",
      JSON.stringify(sheetIds)
    );

    processBatchUpdateTrackingNumbers(); // 배치 처리 시작
  } catch (e) {
    Logger.log("Error: " + e.message);
  }
}

function processBatchUpdateTrackingNumbers() {
  try {
    var trackingData = JSON.parse(
      PropertiesService.getScriptProperties().getProperty("trackingData")
    );
    var currentSheetIndex = parseInt(
      PropertiesService.getScriptProperties().getProperty(
        "currentTrackingSheetIndex"
      )
    );
    var sheetIds = JSON.parse(
      PropertiesService.getScriptProperties().getProperty("trackingSheetIds")
    );

    if (currentSheetIndex < sheetIds.length) {
      var sheetId = sheetIds[currentSheetIndex];
      var targetSpreadsheet = SpreadsheetApp.openById(sheetId);
      var targetSheet = targetSpreadsheet.getSheetByName("누적발주");
      if (!targetSheet) {
        Logger.log("누적발주를 찾을 수 없습니다. 스프레드시트 ID: " + sheetId);
        currentSheetIndex++;
        PropertiesService.getScriptProperties().setProperty(
          "currentTrackingSheetIndex",
          currentSheetIndex
        );
        processBatchUpdateTrackingNumbers();
        return;
      }

      var targetData = targetSheet.getDataRange().getValues();
      var updatedData = [];
      for (var j = 1; j < targetData.length; j++) {
        var targetOrderCode = targetData[j][1];
        if (trackingData[targetOrderCode]) {
          targetData[j].splice(2, 3, ...trackingData[targetOrderCode]);
        }
        updatedData.push(targetData[j]);
      }

      targetSheet
        .getRange(2, 1, updatedData.length, updatedData[0].length)
        .setValues(updatedData);

      currentSheetIndex++;
      PropertiesService.getScriptProperties().setProperty(
        "currentTrackingSheetIndex",
        currentSheetIndex
      );
      processBatchUpdateTrackingNumbers(); // 다음 배치 처리
    } else {
      Logger.log("All tracking numbers updated");
    }
  } catch (e) {
    Logger.log("Error: " + e.message);
  }
}

function getAllDepositObjectByOrderNumber() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("입금매칭대기");
  var sheetData = sheet.getDataRange().getValues();

  var completeDepositData = [];

  const orderNumberListByDepositList = sheetData.reduce((dict, data, index) => {
    if (index == 0) {
      return dict;
    }

    if (data[3]) {
      completeDepositData.push(data);
      return dict;
    }

    if (!data[3] && data[4]) {
      let amountThisRow = 0;
      if (data.length > 6 && data[6]) {
        amountThisRow += data[6];
      } else {
        amountThisRow += data[1];
      }
      const key = data[4];
      if (key && !data[3]) {
        if (!dict[key]) {
          dict[key] = {
            key: key,
            amount: amountThisRow,
          };
        } else {
          dict[key].amount += amountThisRow;
        }
      }
    }
    return dict;
  }, {});

  deleteCompleteRow(completeDepositData);

  return orderNumberListByDepositList;
}

function equals(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function deleteCompleteRow(array) {
  array.forEach(function (row) {
    var newSheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName("입금매칭대기");
    var newSheetData = newSheet.getDataRange().getValues();
    var rowIndex = newSheetData.findIndex(function (originalRow) {
      return equals(originalRow, row);
    });
    newSheet.deleteRow(rowIndex + 1);
  });
}

function insertCheckOrderItem(orderData, orderNumber, totalAmount) {
  var targetNumber = orderData[27];
  if (targetNumber === orderNumber && totalAmount >= orderData[17]) {
    return true;
  } else {
    return false;
  }
}

function insertCheckedDepositor(orderNumber, orderTotalAmount, totalAmount) {
  var orderSheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("입금매칭대기");
  var targetSheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("입금확정");
  var orderData = orderSheet.getDataRange().getValues();
  totalAmount -= orderTotalAmount;
  for (var i = 1; i < orderData.length; i++) {
    var targetNumber = parseInt(orderData[i][4]);
    if (targetNumber === orderNumber && !orderData[i][3]) {
      let considerPredepositValue =
        orderData[i].length > 6 && orderData[i][6]
          ? parseInt(orderData[i][6])
          : parseInt(orderData[i][1]);
      if (orderTotalAmount >= considerPredepositValue) {
        orderTotalAmount -= considerPredepositValue;
        orderSheet.getRange(i + 1, 4).setValue(true);
        orderSheet.getRange(i + 1, 7).setValue("");
        orderSheet.getRange(i + 1, 6).setValue("");
        var rowItemChangedSetTrue = [...orderData[i]];
        rowItemChangedSetTrue.splice(3, 1, true);
        targetSheet.appendRow(rowItemChangedSetTrue);
      } else {
        var preDepositedAmount = considerPredepositValue - orderTotalAmount;
        orderSheet.getRange(i + 1, 7).setValue(preDepositedAmount);
        orderSheet
          .getRange(i + 1, 6)
          .setValue(`입금내역 초과 예치금 ${preDepositedAmount}`);
        return totalAmount;
      }
    }
  }
  return totalAmount;
}

function deleteCompleteDepositor() {
  var orderSheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("입금매칭대기");
  var orderData = orderSheet.getDataRange().getValues();
  for (var i = 1; i < orderData.length; i++) {
    if (orderData[i][3]) {
      orderSheet.deleteRow(i + 1);
    }
  }
}

function deleteCompleteDepositorBeforeCalculate(indexList) {
  var orderSheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("입금매칭대기");
  var orderData = orderSheet.getDataRange().getValues();
  for (var i = 1; i < orderData.length; i++) {
    if (orderData[i][3]) {
      orderSheet.deleteRow(i + 1);
    }
  }
}
