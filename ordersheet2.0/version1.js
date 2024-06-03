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
          return row[4] === "발주완료"; // E열은 인덱스 4
        });

        for (var i = 0; i < filteredData.length; i++) {
          filteredData[i][4] = "상품준비중"; // E열을 인덱스 4로 접근하여 값 변경
        }

        // 시트2의 E열 업데이트
        filteredData.forEach(function (row) {
          var rowIndex = data.findIndex(function (originalRow) {
            return originalRow === row;
          });
          targetSheet.getRange(rowIndex + 1, 5).setValue("상품준비중"); // E열은 인덱스 5
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
