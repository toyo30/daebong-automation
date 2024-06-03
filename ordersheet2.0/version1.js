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
      var targetSheet = targetSpreadsheet.getSheetByName("시트2");
      if (!targetSheet) {
        Logger.log("시트2를 찾을 수 없습니다. 스프레드시트 ID: " + sheetId);
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

    sheetIds.forEach(function (sheetId) {
      try {
        var targetSpreadsheet = SpreadsheetApp.openById(sheetId);
        var targetSheet = targetSpreadsheet.getSheetByName("시트2");
        if (!targetSheet) {
          Logger.log("시트2를 찾을 수 없습니다. 스프레드시트 ID: " + sheetId);
          return;
        }

        var data = targetSheet.getDataRange().getValues();
        // E열이 "발주완료"인 행만 필터링
        var filteredData = data.filter(function (row) {
          return row[4] == "발주완료"; // E열은 인덱스 4
        });

        for (var i = 0; i < filteredData.length; i++) {
          filteredData[i][4] = "상품준비중"; // E열을 인덱스 4로 접근하여 값 변경
          filteredData[i][7] = "입금매칭";
        }

        filteredData.forEach(function (row) {
          var rowIndex = data.findIndex(function (originalRow) {
            return originalRow === row;
          });
          targetSheet.getRange(rowIndex + 1, 5).setValue("상품준비중"); // E열은 인덱스 4+1
          targetSheet.getRange(rowIndex + 1, 8).setValue("입금매칭"); // H열은 인덱스 7+1
        });

        // 발주대기상품 시트에 필터링된 데이터 붙여넣기
        var sourceSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
        var sourceSheet = sourceSpreadsheet.getSheetByName("발주대기상품");
        if (!sourceSheet) {
          throw new Error("발주대기상품 시트를 찾을 수 없습니다.");
        }

        var lastRow = sourceSheet.getLastRow();
        var startRow = lastRow + 1;

        if (filteredData.length > 0) {
          sourceSheet
            .getRange(startRow, 1, filteredData.length, filteredData[0].length)
            .setValues(filteredData);
        }
      } catch (e) {
        Logger.log("Error: " + e.message);
      }
    });
  } catch (e) {
    Logger.log("Error: " + e.message);
  }
}

function insertCheckInDepositPriceRowTest(orderNumber, totalAmount) {
  var orderSheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("금일발주내역");
  var orderData = orderSheet.getDataRange().getValues();
  var mappingSheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("금일매핑주문");

  // 첫 행은 헤더로 가정하고 두 번째 행부터 시작
  for (var i = 1; i < orderData.length; i++) {
    var targetNumber = orderData[i][9]; // J열: 발주서번호
    if (
      targetNumber === orderNumber &&
      !orderData[i][14] &&
      totalAmount >= orderData[i][10]
    ) {
      totalAmount = totalAmount - orderData[i][10];
      var row = orderData[i];
      var nextColumnIndex = row.length; // 다음 열 인덱스는 현재 행의 길이와 동일
      orderSheet.getRange(i + 1, 15).setValue(true);
      mappingSheet.appendRow(orderData[i].slice(0, 12));
    }
  }
  return totalAmount;
}

function insertCheckInDepositRowOverTotalPriceTest(
  orderNumber,
  orderTotalAmount,
  totalAmount
) {
  var orderSheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("금일입금내역");
  var targetSheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("입금확정");
  var orderData = orderSheet.getDataRange().getValues();
  //지금까지 더한 입금내역, 나중에 예치금계산할 때 쓰임
  let currentAmount = 0;
  let preDepositedAmount = totalAmount - orderTotalAmount;

  for (var i = 1; i < orderData.length; i++) {
    var targetNumber = parseInt(orderData[i][4]); // J열: 발주서번호

    if (targetNumber === orderNumber && !orderData[i][3]) {
      let considerPredepositValue =
        orderData[i].length > 6 && orderData[i][7]
          ? parseInt(orderData[i][7])
          : parseInt(orderData[i][1]);
      if (orderTotalAmount >= considerPredepositValue) {
        Logger.log(orderData[i]);
        orderTotalAmount -= considerPredepositValue;
        orderSheet.getRange(i + 1, 4).setValue(true);
        var rowItemChangedSetTrue = orderData[i].splice(3, 1, true);
        targetSheet.appendRow(rowItemChangedSetTrue); // E열은 인덱스 4+1
      } else {
        orderSheet.getRange(i + 1, 4).setValue(false);
        if (preDepositedAmount >= considerPredepositValue) {
          preDepositedAmount -= considerPredepositValue;
        } else {
          orderSheet.getRange(i + 1, 7).setValue(preDepositedAmount);
          orderSheet
            .getRange(i + 1, 6)
            .setValue(`입금내역 초과 예치금 ${preDepositedAmount}`);
          break;
        }
      }
    }
  }
}

function checkDepositActionAllTest() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("입금매칭대기");
  var sheetData = sheet.getDataRange().getValues();

  const orderNumberListByDepositList = sheetData.reduce((dict, data, index) => {
    if (index == 0) {
      return dict;
    }
    if (!data[3] || !data[4] || !(data[4] == "")) {
      let amountThisRow = 0;
      if (data.length > 6 && data[6]) {
        amountThisRow += data[6];
      } else {
        amountThisRow += data[1];
      }

      const key = data[4]; // 4번 인덱스를 키로 사용
      if (key) {
        // 키가 유효한지 확인
        if (!dict[key]) {
          dict[key] = {
            key: key,
            amount: data[1],
          }; // 키가 없으면 빈 배열을 초기화
        } else {
          dict[key].amount += amountThisRow;
        }
      }
    }
    return dict;
  }, {});

  for (const key in orderNumberListByDepositList) {
    if (orderNumberListByDepositList.hasOwnProperty(key)) {
      var totalAmount = orderNumberListByDepositList[key].amount;
      let orderNumber = parseInt(key);
      // 금액이 숫자인지 확인
      if (isNaN(key)) {
        orderNumber = parseFloat(key); // K열: 금액
      }
    }
  }
}
