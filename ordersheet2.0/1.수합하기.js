function importFilteredData() {
  // 발주대기상품이 있는 스프레드시트와 시트 ID
  var sourceSpreadsheetId = "1tRaty5BdhhVWrBvsx-SvMBHnnJaZZRekh2-4SJnFuqc";
  var sellerSheetName = "셀러발주서정보";
  var sourceSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var depositWatingSheet = sourceSpreadsheet.getSheetByName("입금매칭대기");
  var depositWatingSheetData = depositWatingSheet.getDataRange().getValues();

  //지금 이걸 반복해서 쓰게하지 않으려고 하고 있어. insertCheckedDepositor에 파라미터를 만들어줄거야.
  var checkedWatingSheet = sourceSpreadsheet.getSheetByName("입금확정");
  var sourceSheet = sourceSpreadsheet.getSheetByName("발주대기상품");
  var depositWatingSheetData = depositWatingSheet.getDataRange().getValues();
  var copiedDepositWatingSheetData = [...depositWatingSheetData];
  var updatefilteredData = [];
  //입금확정 업데이트데이터
  var updateCheckedDepositerData = [];
  //입금매칭대기 업데이터 데이터
  var depositRowsToUpdate = [];

  try {
    // 셀러발주서정보 시트 데이터 가져오기
    var sellerSpreadsheet = SpreadsheetApp.openById(sourceSpreadsheetId);
    var sellerSheet = sellerSpreadsheet.getSheetByName(sellerSheetName);
    if (!sellerSheet) {
      throw new Error("셀러발주서정보 시트를 찾을 수 없습니다.");
    }
    var sheetIds = sellerSheet.getRange("C1:C").getValues().flat();

    //예금자 정보를 다 가져옴 {[발주서 코드] : {key: 발주서 코드, amount: 금액}}
    const depositObjectByOrderNumber = getAllDepositObjectByOrderNumber(
      depositWatingSheetData
    );
    // Object.keys(depositObjectByOrderNumber).forEach(function (keyValue)

    for (
      var index = 0;
      index < Object.keys(depositObjectByOrderNumber).length;
      index++
    ) {
      var keyValue = Object.keys(depositObjectByOrderNumber)[index];
      var keyNumber = parseInt(depositObjectByOrderNumber[keyValue]["key"]);
      Logger.log("keyValue");
      Logger.log(keyValue);
      Logger.log("keyNumber");
      Logger.log(keyNumber);
      try {
        if (!sheetIds[keyNumber]) {
          continue;
        }

        var sheetId = sheetIds[keyNumber] || "";
        depositObjectByOrderNumber[keyValue]["sellerId"] = sheetId || "";
        var targetSpreadsheet = SpreadsheetApp.openById(sheetId);
        var targetSheet = targetSpreadsheet.getSheetByName("누적발주");
        if (!targetSheet) {
          Logger.log(
            "누적발주를 찾을 수 없습니다. 스프레드시트 ID: " + sheetId
          );
          continue;
        }
        var data = targetSheet.getDataRange().getValues();
        // var filteredData = data.filter(function (row) {
        //   return row[4] == "발주완료"; // E열은 인덱스 4
        // });
        // Logger.log(targetSheet.getLastRow());
        // break;
        var filteredUpdateArray = [];
        for (var k = 3; k < data.length; k++) {
          if (data[k][4] === "발주완료") {
            filteredUpdateArray.push([k, data[k]]);
          }
        }
        // var filtredUpdateArray = data.reduce((array, currentRow, currentIndex) => {
        //   Logger.log("currentIndex" + currentIndex);
        //   Logger.log("currentRow" + currentRow);
        //   Logger.log("array" + array);
        //   if(currentIndex > 3) {
        //     return array;
        //   }
        //   if(currentRow[4] === "발주완료") {
        //     array.push([currentIndex, currentRow]);
        //   }
        //   return array;
        // }, [])
        Logger.log("filteredUpdateArray");
        Logger.log(filteredUpdateArray);

        for (var i = 0; i < filteredUpdateArray.length; i++) {
          var filteredData = filteredUpdateArray[i][1];
          Logger.log("filteredData");
          Logger.log(filteredData);

          var keyInFilteredData = filteredData[27];
          if (depositObjectByOrderNumber.hasOwnProperty(keyInFilteredData)) {
            var totalAmount =
              depositObjectByOrderNumber[keyInFilteredData].amount;
            let orderNumber = parseInt(keyInFilteredData);
            // 금액이 숫자인지 확인
            if (isNaN(keyInFilteredData)) {
              orderNumber = parseFloat(keyInFilteredData); // K열: 금액
            }

            if (insertCheckOrderItem(filteredData, orderNumber, totalAmount)) {
              filteredData[4] = "상품준비중"; // E열을 인덱스 4로 접근하여 값 변경
              filteredData[7] = "입금확인완료";
              // var rowIndex = data.findIndex(function (originalRow) {
              //   return originalRow === filteredData;
              // });

              depositObjectByOrderNumber[keyNumber]["filteredUpdateArray"].push(
                filteredUpdateArray[i]
              );

              //여기서 업데이트 할 필요가 없음.
              //저장해서 나중에 다 업데이트하면 됌
              //누적발주에서 업데이트는 시트 index rowIndex + 1을 저장하면 끝

              //누적발주 업데이트를 위해서 상품 준비중이랑, 입금확인 필요를 따로 모으기
              //여기서 인덱스랑 데이터를 같이 전해줬다면>
              // {key: {filteredData: [[index, data]...]}}
              // targetSheet.getRange(rowIndex + 1, 5).setValue("상품준비중"); // E열은 인덱스 4+1
              // targetSheet.getRange(rowIndex + 1, 8).setValue("입금확인완료"); // H열은 인덱스 7+1
              updatefilteredData.push(filteredData);
            } else {
              filteredData[4] = "발주완료"; // E열을 인덱스 4로 접근하여 값 변경
              filteredData[7] = "입금확인필요";

              // var rowIndex = data.findIndex(function (originalRow) {
              //   return originalRow === filteredData;
              // });

              //인덱스랑 데이터를 filteredData에 같이 넣어줬다면?
              // targetSheet.getRange(rowIndex + 1, 5).setValue("발주완료"); // E열은 인덱스 4+1
              // targetSheet.getRange(rowIndex + 1, 8).setValue("입금확인필요"); // H열은 인덱스 7+1
              depositObjectByOrderNumber[keyNumber]["filteredUpdateArray"].push(
                filteredUpdateArray[i]
              );
            }

            if (
              depositObjectByOrderNumber[keyInFilteredData].amount -
                filteredData[17] >=
              0
            ) {
              //여기도 파라미터로 저장해야 하는 것을 하나 넣어줬다면? 바로 개선가능
              //// {key: {filteredData: [[index, data]...]}}
              depositObjectByOrderNumber[keyInFilteredData].amount =
                insertCheckedDepositor(
                  filteredData[27],
                  filteredData[17],
                  totalAmount,
                  copiedDepositWatingSheetData,
                  updateCheckedDepositerData,
                  depositRowsToUpdate
                );
            }
          }
        }
      } catch (e) {
        Logger.log("Error: " + e.message);
      }
    }

    // //예는 forEach 바깥에서 처리해도 됨
    // if (updatefilteredData.length > 0) {
    //   // appendRowsImportFilteredData(sourceSheet,updatefilteredData);
    //   Logger.log("updatefilteredData 발주대기상품");
    //   Logger.log(updatefilteredData);

    //   // sourceSheet
    //   //   .getRange(
    //   //     startRow,
    //   //     1,
    //   //     updatefilteredData.length,
    //   //     updatefilteredData[0].length
    //   //   )
    //   //   .setValues(updatefilteredData);
    // }

    Logger.log("updatefilteredData 발주대기상품");
    Logger.log(updatefilteredData);
    Logger.log(updatefilteredData.length);
    appendRowsImportFilteredData(sourceSheet, updatefilteredData);

    Logger.log("updateCheckedDepositerData 입금확정");
    Logger.log(updateCheckedDepositerData);
    appendRowsImportFilteredData(
      checkedWatingSheet,
      updateCheckedDepositerData
    );

    Logger.log("depositRowsToUpdate 입금매칭대기 업데이트");
    Logger.log(depositRowsToUpdate);
    appendRowsInBatchesImportFilteredData(
      depositWatingSheet,
      depositRowsToUpdate
    );

    Logger.log("depositObjectByOrderNumber 셀러별 발주서 업데이트");
    Logger.log(depositObjectByOrderNumber);
    updateSellerSpreadsheetsImportFilteredData(depositObjectByOrderNumber);
  } catch (e) {
    Logger.log("Error: " + e.message);
  } finally {
    // deleteCompleteDepositor();
  }
}

function appendRowsImportFilteredData(sheet, rows) {
  if (rows.length > 0) {
    sheet
      .getRange(sheet.getLastRow() + 1, 1, rows.length, rows[0].length)
      .setValues(rows);
  }
}

function getAllDepositObjectByOrderNumber(sheetData) {
  var completeDepositData = [];

  const orderNumberListByDepositList = sheetData.reduce((dict, data, index) => {
    if (index == 0) {
      return dict;
    }

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
            sellerId: "",
            filteredUpdateArray: [],
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

function insertCheckedDepositor(
  orderNumber,
  orderTotalAmount,
  totalAmount,
  orderData,
  updateCheckedDepositerData,
  depositRowsToUpdate
) {
  // //파라미터로 내려줘서 한번에 가져오기 가능
  // var orderSheet =
  //   SpreadsheetApp.getActiveSpreadsheet().getSheetByName("입금매칭대기");
  // //파라미터로 내려줘서 한번에 가져오기 가능
  // var targetSheet =
  //   SpreadsheetApp.getActiveSpreadsheet().getSheetByName("입금확정");
  // //예는 계속 바뀌는 값을 가져와야 하는 건가?
  // var orderData = orderSheet.getDataRange().getValues();
  totalAmount -= orderTotalAmount;

  //어차피 고정된 값이니까, 한번에 값을 저장해놓다가, 인덱스 기록하고 처리가능

  for (var i = 1; i < orderData.length; i++) {
    var targetNumber = parseInt(orderData[i][4]); //E열 발주서 번호
    if (targetNumber === orderNumber && !orderData[i][3]) {
      let considerPredepositValue =
        orderData[i].length > 6 && orderData[i][6]
          ? parseInt(orderData[i][6])
          : parseInt(orderData[i][1]);
      if (orderTotalAmount >= considerPredepositValue) {
        //이걸 개선해야겠다.
        orderTotalAmount -= considerPredepositValue;

        //결국 바꾸고 싶은 로우하나 정해서 한번에 넣기
        //로우하나 만들기
        //입금 대기 시트의 false,
        //입금 대기 시트의 true
        //[[index, data ]]
        // orderSheet.getRange(i + 1, 4).setValue(true);
        // orderSheet.getRange(i + 1, 7).setValue("");
        // orderSheet.getRange(i + 1, 6).setValue("");
        orderData[i][3] = true;
        orderData[i][6] = "";
        orderData[i][7] = "";
        var rowItemChangedSetTrue = [...orderData[i]];
        rowItemChangedSetTrue.splice(3, 1, true);

        // depositRowsToUpdate.push([i, rowItemChangedSetTrue]);
        updateOrAddRows(depositRowsToUpdate, i, [i, rowItemChangedSetTrue]);
        //특정 배열에 그냥 다 넣어주며 끝 []
        updateCheckedDepositerData.push(rowItemChangedSetTrue);
        // targetSheet.appendRow(rowItemChangedSetTrue);
        //이 상황일 때, 입금대기시트를 바꿔주고, targetSheet도 바꿔줌.
      } else {
        var preDepositedAmount = considerPredepositValue - orderTotalAmount;
        //이 상황일 때, 입금대기시트를 바꿔줌
        orderData[i][6] = preDepositedAmount;
        orderData[i][5] = `입금내역 초과 예치금 ${preDepositedAmount}`;
        // orderData[i][3] = true;
        // orderSheet.getRange(i + 1, 7).setValue(preDepositedAmount);
        // orderSheet
        //   .getRange(i + 1, 6)
        //   .setValue(`입금내역 초과 예치금 ${preDepositedAmount}`);

        var rowItemChangedSetTrue = [...orderData[i]];
        // rowItemChangedSetTrue.splice(3, 1, true);
        rowItemChangedSetTrue.splice(
          5,
          1,
          `입금내역 초과 예치금 ${preDepositedAmount}`
        );
        rowItemChangedSetTrue.splice(6, 1, preDepositedAmount);

        // depositRowsToUpdate.push([i, rowItemChangedSetTrue]);
        updateOrAddRows(depositRowsToUpdate, i, [i, rowItemChangedSetTrue]);

        return totalAmount;
        // }
      }
    }
  }
  return totalAmount;
}

function updateOrAddRows(array, targetNumber, newRow) {
  var found = false;
  Logger.log("updateOrAddRows array");
  Logger.log(array);
  // 배열을 순회하면서 targetNumber와 같은 요소를 찾음
  for (var i = 0; i < array.length; i++) {
    if (array[i][0] === targetNumber) {
      array[i] = newRow; // 요소를 대체
      found = true;
      break;
    }
  }

  // targetNumber와 같은 요소가 없으면 새 요소를 추가
  if (!found) {
    array.push(newRow);
  }
}

function updateSellerSpreadsheetsImportFilteredData(sellerSpreadsheetObject) {
  for (var code in sellerSpreadsheetObject) {
    Logger.log("code");
    Logger.log(code);
    var obj = sellerSpreadsheetObject[code];
    Logger.log(obj.sellerId);
    Logger.log(obj.filteredUpdateArray);
    if (
      (!obj.sellerId || obj.sellerId !== "") &&
      obj.filteredUpdateArray.length > 0
    ) {
      Logger.log("obj");
      Logger.log(obj);
      // var cumulativeOrderSheet = JSON.parse(sellerSpreadsheet)
      var cumulativeOrderSheet = SpreadsheetApp.openById(
        sellerSpreadsheetObject[code].sellerId
      ).getSheetByName("누적발주");
      var rows = obj.filteredUpdateArray;
      Logger.log("rows");
      Logger.log(rows);

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
}

function deleteRowsInBatchesImportFilteredData(sheet, rowsToDelete) {
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

function appendRowsInBatchesImportFilteredData(sheet, rowsToUpdate) {
  if (rowsToUpdate.length > 0) {
    // 인덱스 순서대로 내림차순 정렬
    rowsToUpdate.sort(function (a, b) {
      return a[0] - b[0];
    });

    var start = parseInt(rowsToUpdate[0][0]);
    var end = start;
    var dataBatch = [rowsToUpdate[0][1]];

    //start end가 중요하기 때문에 1번부터 돈다.
    for (var i = 1; i < rowsToUpdate.length; i++) {
      if (rowsToUpdate[i][0] == end + 1) {
        end = rowsToUpdate[i][0];
        dataBatch.push(rowsToUpdate[i][1]);
      } else {
        sheet
          .getRange(start + 1, 1, dataBatch.length, dataBatch[0].length)
          .setValues(dataBatch);
        start = rowsToUpdate[i][0];
        end = start;
        dataBatch = [rowsToUpdate[i][1]];
      }
    }

    // 마지막 배치 처리
    sheet
      .getRange(start + 1, 1, dataBatch.length, dataBatch[0].length)
      .setValues(dataBatch);
  }
}

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
