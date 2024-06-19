// function onEdit(e) {
//   orderAutomation.onEdit(e);
// }

function onEdit(e) {
  var sheet = e.source.getActiveSheet();
  handleEditForSheet1(e);
  var range = e.range;
  // var editedColumn = range.getColumn()''

  // var sheet1 = ss.getSheetByName('발주서');

  // if (sheet.getName() === '발주서' && editedColumn === 10) { // 열번호 10은 'L' 열입니다.

  //   // var lastRow = sheet.getLastRow();
  //   // var productSheet = e.source.getSheetByName('상품목록');
  //   // var productData = productSheet.getRange('K:L').getValues();

  //   // for (var row = 1; row <= lastRow; row++) {
  //   //   var gValue = sheet.getRange('G' + row).getValue();
  //   //   var lValue = sheet.getRange('L' + row).getValue();
  //   //   var productPrice = 0;

  //   //   for (var i = 0; i < productData.length; i++) {
  //   //     if (productData[i][0] == gValue) {
  //   //       productPrice = productData[i][1];
  //   //       break;
  //   //     }
  //   //   }
  //   //----------

  //   //   if (productPrice * lValue == 0) {
  //   //     sheet.getRange('L' + row).setValue('');
  //   //   } else {
  //   //     sheet.getRange('L' + row).setValue(productPrice * lValue);
  //   //   }
  //   // }

  //   // for (var row = 1; row <= lastRow; row++) {
  //   //   var formula = '=IFERROR(IF(INDEX(\'상품목록\'!L:L, MATCH(G' + row + ', \'상품목록\'!K:K, 0))*L' + row + '=0, "", INDEX(\'상품목록\'!L:L, MATCH(G' + row + ', \'상품목록\'!K:K, 0))*L' + row + '))';
  //   //   sheet.getRange('L' + row).setFormula(formula);

  //   //   // 디버깅을 위해 로그를 출력
  //   //   Logger.log('Row: ' + row + ', Formula: ' + formula);
  //   // }
  // }

  if (
    sheet.getName() === "발주서" &&
    e.range.getA1Notation() === "J7" &&
    e.value === "TRUE"
  ) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet1 = ss.getSheetByName("발주서");
    sheet1.getRange("J7").setValue("가격 계산 중");
    var productSheet = ss.getSheetByName("상품목록");
    var data = sheet1.getDataRange().getValues();
    var productData = productSheet.getDataRange().getValues();
    handleJ7Check(sheet1, productSheet, data, productData);
    writeNormalInput(sheet1, data);
  }

  if (
    sheet.getName() === "발주서" &&
    e.range.getA1Notation() === "K7" &&
    e.value === "TRUE"
  ) {
    var ui = SpreadsheetApp.getUi(); // UI 서비스 사용;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet1 = ss.getSheetByName("발주서");
    var productSheet = ss.getSheetByName("상품목록");
    var data = sheet1.getDataRange().getValues();
    var productData = productSheet.getDataRange().getValues();
    // K7 셀에 "발주 처리 중" 메시지 표시
    sheet1.getRange("K7").setValue("발주 처리 중");

    try {
      var allTotalPrice = handleJ7Check(
        sheet1,
        productSheet,
        data,
        productData
      );
      // 즉시 적용
      SpreadsheetApp.flush();

      // var alertMessage = "총 공급금액은 " +  allTotalPrice + '원 입니다. 입금하셨습니까?'
      var alertMessage = "J7열을 눌러서 정상입력 확인을 하셨나요";
      var response = ui.alert("확인", alertMessage, ui.ButtonSet.YES_NO);
      // 'YES' 버튼을 클릭했을 때의 로직
      if (response == ui.Button.YES) {
        handleK7Check();
      }
      // 'NO' 버튼을 클릭했을 때의 로직
      else if (response == ui.Button.NO) {
        sheet1.getRange("K7").setValue(false);
      }
    } finally {
      sheet1.getRange("K7").setValue(false);
    }
  }
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

function handleK7Check() {
  // var ss = SpreadsheetApp.getActiveSpreadsheet();
  // var sheet1 = ss.getSheetByName('발주서');

  // var data = sheet1.getDataRange().getValues();
  // var rowsUpdated = 0;

  // var targetSpreadsheet = SpreadsheetApp.openById(sheetId);
  // var targetSheet = targetSpreadsheet.getSheetByName("누적발주");

  // for (var i = 0; i < data.length; i++) {
  //   if (data[i][10] === "정상입력") { // K열이 "정상 발주"인 경우 (0-index로 10번째)
  //     data[i][23] = true; // X열을 true로 설정 (0-index로 23번째)
  //     rowsUpdated++;
  //   }
  // }

  // // 업데이트된 데이터를 시트에 반영
  // if (rowsUpdated > 0) {
  //   sheet1.getRange(1, 1, data.length, data[0].length).setValues(data);
  //   Logger.log('X열을 true로 변경한 행 수: ' + rowsUpdated);
  // }

  // copyCheckedRows 함수 호출
  // var scriptProperties = PropertiesService.getScriptProperties();
  // scriptProperties.deleteProperty('rowsToMove');
  // scriptProperties.deleteProperty('currentBatch');
  // scriptProperties.deleteProperty('rowsToDelete');
  copyCheckedRows();
}

function copyCheckedRows() {
  try {
    var cacheKey = "rowsToMove";
    var deleteCacheKey = "rowsToDelete";
    clearCache(cacheKey); // 필요한 경우 캐시를 삭제합니다.
    clearCache(deleteCacheKey); // 삭제할 행에 대한 캐시를 삭제합니다.

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet1 = ss.getSheetByName("발주서");
    var sheet2 = ss.getSheetByName("누적발주");

    if (!sheet1 || !sheet2) {
      Logger.log("시트1 또는 시트2를 찾을 수 없습니다.");
      return;
    }

    var data = sheet1.getDataRange().getValues();
    var rowsToMove = [];
    var rowsToDelete = [];

    for (var i = 11; i < data.length; i++) {
      if (isNormalInput(data, i)) {
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

        newRow = newRow.concat(row.slice(0, 23));
        newRow = newRow.concat([true]); // 마지막 열 추가
        rowsToMove.push(newRow);
        rowsToDelete.push(i);
      }
    }

    if (rowsToMove.length > 0) {
      // Logger.log("rowsToMove");
      // Logger.log(rowsToMove);
      storeRowsInCache(rowsToMove, cacheKey);

      CacheService.getScriptCache().put(
        deleteCacheKey,
        JSON.stringify(rowsToDelete),
        21600
      ); // 6시간 동안 캐시에 저장
      // CacheService.getScriptCache().put(cacheKey, JSON.stringify(rowsToMove), 21600); // 6시간 동안 캐시에 저장

      // 배치를 100개씩 나누어 트리거 설정
      var batchCount = Math.ceil(rowsToMove.length / 100);
      Logger.log("batchCount" + batchCount);
      Logger.log("batchCount.toString()" + batchCount.toString());
      CacheService.getScriptCache().put(
        "batchCount",
        batchCount.toString(),
        21600
      );
      CacheService.getScriptCache().put("currentBatch", (0).toString(), 21600);

      for (var i = 0; i < batchCount; i++) {
        // scheduleBatch(i);
        processBatch();
      }
      Logger.log("Rows to move set in CacheService and triggers scheduled");
    } else {
      Logger.log("이동할 행이 없습니다.");
      sheet1.getRange("K7").setValue("FALSE");
    }
  } catch (error) {
    Logger.log("Error in copyCheckedRows: " + error.message);
    SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName("발주서")
      .getRange("K7")
      .setValue("FALSE");
  }
}

function storeRowsInCache(rows, cacheKey) {
  var batchSize = 100; // 한번에 저장할 데이터 크기
  var cache = CacheService.getScriptCache();
  for (var i = 0; i < rows.length; i += batchSize) {
    var batch = rows.slice(i, i + batchSize);
    // Logger.log("batch");
    // Logger.log(batch);
    cache.put(cacheKey + "_" + i / batchSize, JSON.stringify(batch), 21600); // 6시간 동안 캐시에 저장
  }
  cache.put(cacheKey + "_count", Math.ceil(rows.length / batchSize), 21600); // 6시간 동안 캐시에 저장
}

function loadRowsFromCache(cacheKey) {
  var cache = CacheService.getScriptCache();
  var batchCount = parseInt(cache.get(cacheKey + "_count"));
  var rows = [];
  for (var i = 0; i < batchCount; i++) {
    var batch = JSON.parse(cache.get(cacheKey + "_" + i));
    rows = rows.concat(batch);
  }
  return rows;
}

function clearCache(cacheKey) {
  var cache = CacheService.getScriptCache();
  var batchCount = parseInt(cache.get(cacheKey + "_count"));
  for (var i = 0; i < batchCount; i++) {
    cache.remove(cacheKey + "_" + i);
  }
  cache.remove(cacheKey + "_count");
}

function processBatch() {
  try {
    var cache = CacheService.getScriptCache();
    var cacheKey = "rowsToMove";
    var deleteCacheKey = "rowsToDelete";
    var batchIndex = parseInt(cache.get("currentBatch"));
    var batchCount = parseInt(cache.get("batchCount"));

    // Logger.log("currentBatch");
    // Logger.log(cache.get('currentBatch'));
    // Logger.log(typeof(cache.get('currentBatch')));
    var rowsToMove = JSON.parse(cache.get(cacheKey + "_" + batchIndex));
    // var rowsToMove = JSON.parse(cache.get(cacheKey));
    var rowsToDelete = JSON.parse(cache.get(deleteCacheKey));
    var sheet2 =
      SpreadsheetApp.getActiveSpreadsheet().getSheetByName("누적발주");
    var sheet1 = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("발주서");
    // Logger.log("batchIndex");
    // Logger.log(batchIndex);
    // Logger.log("rowsToMove");
    // Logger.log(rowsToMove);
    // // 데이터 검증 및 형 변환 예외 처리
    // rowsToMove = rowsToMove.map(row => {
    //   return row.map(cell => {
    //     if (typeof cell === 'string' && cell.match(/^\d+$/)) {
    //       return parseInt(cell, 10);
    //     }
    //     return cell;
    //   });
    // });
    Logger.log("rowsToMove");
    Logger.log(rowsToMove);
    sheet2
      .getRange(
        sheet2.getLastRow() + 1,
        1,
        rowsToMove.length,
        rowsToMove[0].length
      )
      .setValues(rowsToMove);
    Logger.log("Processed batch " + batchIndex);

    // 다음 배치를 위한 설정
    var batchCount = parseInt(cache.get("batchCount"));
    if (batchIndex < batchCount - 1) {
      cache.put("currentBatch", (batchIndex + 1).toString(), 21600); // 다음 배치 인덱스를 설정
      // scheduleNextBatch();
      processBatch();
    } else {
      // 마지막 배치인지 확인하고 캐시 정리
      deleteRowsInBatches(sheet1, rowsToDelete);
      SpreadsheetApp.flush();
      clearCache(cacheKey);
      cache.remove("currentBatch");
      cache.remove("batchCount");
      clearCache(deleteCacheKey);
    }
  } catch (error) {
    Logger.log("Error in processBatch: " + error.message);
    SpreadsheetApp.getActiveSpreadsheet()
      .getSheetByName("발주서")
      .getRange("K7")
      .setValue("FALSE");
  }
}

// function scheduleBatch(batchIndex) {
//   ScriptApp.newTrigger('processBatch')
//     .timeBased()
//     .after(1000) // 1초 후에 배치를 실행
//     .create();
// }

// function scheduleNextBatch() {
//   ScriptApp.newTrigger('processBatch')
//     .timeBased()
//     .after(1000) // 1초 후에 다음 배치를 실행
//     .create();
// }

function deleteRowsInBatches(sheet, rowsToDelete) {
  rowsToDelete.sort(function (a, b) {
    return a - b;
  }); // 오름차순 정렬

  var start = rowsToDelete[0];
  var end = start;

  Logger.log("rowsToDelete");
  Logger.log(rowsToDelete);
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

function handleJ7Check(sheet1, productSheet, data, productData) {
  var changeOrderList = [];
  // J7 셀에 "가격 계산 중" 메시지 표시

  var allTotalPrice = calculateAllTotalPrice(
    data,
    productData,
    changeOrderList
  );
  appendRowsInBatchesImportFilteredData(sheet1, changeOrderList);

  // J7 셀에 메시지 제거
  sheet1.getRange("J7").setValue(false);
  return allTotalPrice;
}

function calculateAllTotalPrice(orderData, productData, changeOrderList) {
  var allTotalPrice = 0;
  var lastRow = orderData.length;

  for (var i = 11; i < lastRow; i++) {
    if (!orderData[i][6]) {
      continue;
    }
    var itemPriceValue = getProductPriceFromEqulProductName(
      orderData[i],
      productData
    );
    orderData[i][9] = itemPriceValue; // 업데이트된 가격을 설정
    changeOrderList.push([i, orderData[i]]);
    allTotalPrice += itemPriceValue;
  }
  return allTotalPrice;
}

function getProductPriceFromEqulProductName(rowData, productData) {
  var productCode = rowData[6]; // Assuming the product code is in column G (index 6)
  var quantity = rowData[11]; // Assuming the quantity is in column L (index 11)

  for (var i = 1; i < productData.length; i++) {
    // Assuming the first row is the header
    if (productData[i][10] == productCode) {
      // Assuming the product code is in column K (index 10)
      var productPrice = productData[i][11]; // Assuming the product price is in column L (index 11)
      return productPrice * quantity || 0;
    }
  }
  return 0; // If no matching product code is found
}

function appendRowsInBatchesImportFilteredData(sheet, rowsToUpdate) {
  if (rowsToUpdate.length > 0) {
    rowsToUpdate.sort(function (a, b) {
      return a[0] - b[0];
    });

    var batchSize = 100; // 한번에 처리할 행 수
    for (var i = 0; i < rowsToUpdate.length; i += batchSize) {
      var batch = rowsToUpdate.slice(i, i + batchSize);
      var start = parseInt(batch[0][0]);
      var end = start + batch.length - 1;
      var dataBatch = batch.map(function (item) {
        return item[1];
      });

      sheet
        .getRange(start + 1, 1, dataBatch.length, dataBatch[0].length)
        .setValues(dataBatch);
    }
  }
}

function appendRows(sheet, rows) {
  if (rows.length > 0) {
    sheet
      .getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length)
      .setValues(rows);
  }
}

function writeNormalInput(sheet, data) {
  var normalInputList = [];
  for (var i = 11; i < data.length; i++) {
    if (isNormalInput(data, i)) {
      var newRow = [...data[i]];
      newRow[10] = "정상입력";
      normalInputList.push([i, newRow]);
    }
  }
  appendRowsInBatchesImportFilteredData(sheet, normalInputList);
}

function isNormalInput(data, rowIndex) {
  var mode = data[7][0]; // Assuming the mode is in A8
  var hValue = data[rowIndex][7]; // H 열 값
  var aValue = data[rowIndex][0]; // A 열 값
  var bValue = data[rowIndex][1]; // B 열 값
  var cValue = data[rowIndex][2]; // C 열 값
  var dValue = data[rowIndex][3]; // D 열 값
  var jValue = data[rowIndex][9]; // J 열 값

  if (mode === "매핑모드") {
    if (hValue.includes("정상매핑")) {
      if (aValue !== "" && bValue !== "" && cValue !== "" && jValue !== "") {
        return true;
      } else {
        return false; // "필수입력사항 입력필요"
      }
    } else if (hValue === "매핑오류") {
      return false; // "매핑 확인필요"
    } else {
      if (aValue !== "" || bValue !== "" || cValue !== "" || jValue !== "") {
        return false; // "매핑 확인필요"
      } else {
        return false; // ""
      }
    }
  } else if (mode === "일반모드") {
    if (
      aValue === "" &&
      bValue === "" &&
      cValue === "" &&
      dValue === "" &&
      jValue === ""
    ) {
      return false; // ""
    } else {
      if (
        aValue === "" ||
        bValue === "" ||
        cValue === "" ||
        dValue === "" ||
        jValue === ""
      ) {
        return false; // "필수입력사항 입력필요"
      } else {
        return true; // "정상입력"
      }
    }
  }
  return false;
}
