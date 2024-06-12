function updateTrackingNumbers() {
  // 발주확정상품 시트를 포함하는 스프레드시트와 시트 ID
  var sourceSpreadsheetId = "1tRaty5BdhhVWrBvsx-SvMBHnnJaZZRekh2-4SJnFuqc";
  var sourceSheetName = "발주확정상품";
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

    // 발주확정상품 시트 데이터 가져오기
    var sourceSheet = sellerSpreadsheet.getSheetByName(sourceSheetName);
    if (!sourceSheet) {
      throw new Error("발주확정상품 시트를 찾을 수 없습니다.");
    }
    var sourceData = sourceSheet.getDataRange().getValues();

    // 발주번호와 택배사, 운송장 번호, 배송 현황을 딕셔너리로 저장
    var trackingData = {};
    for (var i = 1; i < sourceData.length; i++) {
      var orderCode = sourceData[i][1]; // B열 (발주번호)
      var trackingValues = sourceData[i].slice(2, 5); // C, D, E열 데이터
      if (orderCode) {
        trackingData[orderCode] = trackingValues;
      }
    }

    sheetIds.forEach(function (sheetId) {
      var targetSpreadsheet = SpreadsheetApp.openById(sheetId);
      var targetSheet = targetSpreadsheet.getSheetByName("누적발주");
      if (!targetSheet) {
        Logger.log("누적발주를 찾을 수 없습니다. 스프레드시트 ID: " + sheetId);
        return;
      }
      var targetData = targetSheet.getDataRange().getValues();

      var updatedData = [];
      for (var j = 1; j < targetData.length; j++) {
        var targetOrderCode = targetData[j][1]; // B열 (발주번호)
        if (trackingData[targetOrderCode]) {
          targetData[j].splice(2, 3, ...trackingData[targetOrderCode]); // C, D, E열 데이터 업데이트
        }
        updatedData.push(targetData[j]);
      }

      // 변경된 데이터 한 번에 업데이트
      targetSheet
        .getRange(2, 1, updatedData.length, updatedData[0].length)
        .setValues(updatedData);
    });
  } catch (e) {
    Logger.log("Error: " + e.message);
  }
}

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

    //예금자 정보를 다 가져옴 {[발주서 코드] : {key: 발주서 코드, amount: 금액}}
    const depositObjectByOrderNumber = getAllDepositObjectByOrderNumber();

    Object.keys(depositObjectByOrderNumber).forEach(function (keyValue) {
      try {
        var sheetId =
          sheetIds[parseInt(depositObjectByOrderNumber[keyValue]["key"]) - 1];
        Logger.log('depositObjectByOrderNumber[keyValue]["key"]');
        Logger.log(depositObjectByOrderNumber[keyValue]["key"]);
        Logger.log("sheetIds");
        Logger.log(sheetIds);
        var targetSpreadsheet = SpreadsheetApp.openById(sheetId);
        var targetSheet = targetSpreadsheet.getSheetByName("누적발주");
        if (!targetSheet) {
          Logger.log(
            "누적발주를 찾을 수 없습니다. 스프레드시트 ID: " + sheetId
          );
          return;
        }

        var data = targetSheet.getDataRange().getValues();

        Logger.log("data");
        Logger.log(data);
        // E열이 "발주완료"인 행만 필터링
        var filteredData = data.filter(function (row) {
          return row[4] == "발주완료"; // E열은 인덱스 4
        });

        var updatefilteredData = [];

        for (var i = 0; i < filteredData.length; i++) {
          Logger.log(
            "depositObjectByOrderNumber" +
              JSON.stringify(depositObjectByOrderNumber)
          );

          var keyInFilteredData = filteredData[i][27];
          Logger.log("keyInFilteredData");
          Logger.log(keyInFilteredData);
          if (depositObjectByOrderNumber.hasOwnProperty(keyInFilteredData)) {
            var totalAmount =
              depositObjectByOrderNumber[keyInFilteredData].amount;
            let orderNumber = parseInt(keyInFilteredData);
            // 금액이 숫자인지 확인
            if (isNaN(keyInFilteredData)) {
              orderNumber = parseFloat(keyInFilteredData); // K열: 금액
            }

            if (
              insertCheckOrderItem(filteredData[i], orderNumber, totalAmount)
            ) {
              filteredData[i][4] = "상품준비중"; // E열을 인덱스 4로 접근하여 값 변경
              filteredData[i][7] = "입금확인완료";
              var rowIndex = data.findIndex(function (originalRow) {
                return originalRow === filteredData[i];
              });
              targetSheet.getRange(rowIndex + 1, 5).setValue("상품준비중"); // E열은 인덱스 4+1
              targetSheet.getRange(rowIndex + 1, 8).setValue("입금확인완료"); // H열은 인덱스 7+1
              updatefilteredData.push(filteredData[i]);
            } else {
              filteredData[i][4] = "발주완료"; // E열을 인덱스 4로 접근하여 값 변경
              filteredData[i][7] = "금액확인필요";

              var rowIndex = data.findIndex(function (originalRow) {
                return originalRow === filteredData[i];
              });
              targetSheet.getRange(rowIndex + 1, 5).setValue("발주완료"); // E열은 인덱스 4+1
              targetSheet.getRange(rowIndex + 1, 8).setValue("금액확인필요"); // H열은 인덱스 7+1
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
        // 발주대기상품 시트에 필터링된 데이터 붙여넣기
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
      } catch (e) {
        Logger.log("Error: " + e.message);
      }
    });
  } catch (e) {
    Logger.log("Error: " + e.message);
  } finally {
    // deleteCompleteDepositor();
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

    Logger.log("index");
    Logger.log(index);

    Logger.log("data");
    Logger.log(data);

    if (data[3] || data[3] === true || data[3] === true) {
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
      const key = data[4]; // 4번 인덱스를 키로 사용
      if (key && !data[3]) {
        // 키가 유효한지 확인
        if (!dict[key]) {
          dict[key] = {
            key: key,
            amount: amountThisRow,
          }; // 키가 없으면 빈 배열을 초기화
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
  Logger.log("array");
  Logger.log(array);

  array.forEach(function (row) {
    var newSheet =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName("입금매칭대기");
    var newSheetData = newSheet.getDataRange().getValues();
    Logger.log(newSheetData);
    var rowIndex = newSheetData.findIndex(function (originalRow) {
      return equals(originalRow, row);
    });
    Logger.log("row");
    Logger.log(row);
    Logger.log("newSheetData[rowIndex]");
    Logger.log(newSheetData[rowIndex]);
    // newSheet.deleteRow(rowIndex);
    newSheet.deleteRow(rowIndex + 1);
  });
}

function insertCheckOrderItem(orderData, orderNumber, totalAmount) {
  var targetNumber = orderData[27]; // AB열: 발주서번호
  if (targetNumber === orderNumber && totalAmount >= orderData[17]) {
    return true;
  } else {
    return false;
  }
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

function insertCheckedDepositor(orderNumber, orderTotalAmount, totalAmount) {
  var orderSheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("입금매칭대기");
  var targetSheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("입금확정");
  var orderData = orderSheet.getDataRange().getValues();
  totalAmount -= orderTotalAmount;
  for (var i = 1; i < orderData.length; i++) {
    var targetNumber = parseInt(orderData[i][4]); //E열 발주서 번호
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
        // }
      }
    }
  }
  return totalAmount;
}
