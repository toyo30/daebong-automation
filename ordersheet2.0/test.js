function importFilteredData() {
  // Mock data 대신 스프레드시트 데이터를 사용
  var mockSellerSheetData = [
    ["셀러발주서정보1", "셀러발주서정보2", "1", "셀러발주서정보4"],
    ["셀러발주서정보1", "셀러발주서정보2", "2", "셀러발주서정보4"],
  ];
  var mockOrderSheetData = [
    [
      "2024-06-03",
      "딸기-백민기-240603-1933-13",
      "",
      "발주완료",
      "",
      "",
      "",
      "입금확인중",
      "백민기1-3",
      "010-123",
      "시그니엘",
      "딸기",
      "",
      "",
      "딸기",
      "",
      "",
      3000,
      "정상입력",
      "",
      "",
      "",
      "",
      "",
      "",
      "1",
      "",
      "",
      "",
      "",
      "",
      "TRUE",
    ],
    [
      "2024-06-03",
      "딸기-백민기-240603-1933-13",
      "",
      "발주완료",
      "",
      "",
      "",
      "입금확인완료",
      "백민기1-3",
      "010-123",
      "시그니엘",
      "딸기",
      "",
      "",
      "딸기",
      "",
      "",
      3000,
      "정상입력",
      "",
      "",
      "",
      "",
      "",
      "",
      "2",
      "",
      "",
      "",
      "",
      "",
      "TRUE",
    ],
    [
      "2024-06-03",
      "딸기-백민기-240603-1933-13",
      "",
      "발주완료",
      "",
      "",
      "",
      "입금확인중",
      "백민기1-3",
      "010-123",
      "시그니엘",
      "딸기",
      "",
      "",
      "딸기",
      "",
      "",
      3000,
      "정상입력",
      "",
      "",
      "",
      "",
      "",
      "",
      "1",
      "",
      "",
      "",
      "",
      "",
      "TRUE",
    ],
    [
      "2024-06-03",
      "딸기-백민기-240603-1933-13",
      "",
      "발주완료",
      "",
      "",
      "",
      "입금확인완료",
      "백민기1-3",
      "010-123",
      "시그니엘",
      "딸기",
      "",
      "",
      "딸기",
      "",
      "",
      3000,
      "정상입력",
      "",
      "",
      "",
      "",
      "",
      "",
      "2",
      "",
      "",
      "",
      "",
      "",
      "TRUE",
    ],
    [
      "2024-06-03",
      "딸기-백민기-240603-1933-13",
      "",
      "발주완료",
      "",
      "",
      "",
      "입금확인중",
      "백민기1-3",
      "010-123",
      "시그니엘",
      "딸기",
      "",
      "",
      "딸기",
      "",
      "",
      3000,
      "정상입력",
      "",
      "",
      "",
      "",
      "",
      "",
      "1",
      "",
      "",
      "",
      "",
      "",
      "TRUE",
    ],
    [
      "2024-06-03",
      "딸기-백민기-240603-1933-13",
      "",
      "발주완료",
      "",
      "",
      "",
      "입금확인완료",
      "백민기1-3",
      "010-123",
      "시그니엘",
      "딸기",
      "",
      "",
      "딸기",
      "",
      "",
      3000,
      "정상입력",
      "",
      "",
      "",
      "",
      "",
      "",
      "2",
      "",
      "",
      "",
      "",
      "",
      "TRUE",
    ],
  ];

  var mockTargetSheetData = [];

  var mockFilteredData = [];

  // Mock function to get all deposit objects by order number
  function getAllDepositObjectByOrderNumber() {
    return {
      1: { key: "1", amount: 12000 },
      2: { key: "2", amount: 4000 },
    };
  }

  //   // Mock function to check and process order item
  //   function insertCheckOrderItem(orderData, orderNumber, totalAmount) {
  //     var targetNumber = orderData[27]; // AB열: 발주서번호
  //     return targetNumber == orderNumber && totalAmount >= orderData[17];
  //   }

  var mockDepositorSheetData = [
    ["이름", "금액", "날짜", "상태", "발주서 번호", "기타", "예치금"],
    ["최재혁", 4000, "2024. 6. 1 오후 10:10:12", false, "1", "", ""],
    ["최재혁", 4000, "2024. 6. 1 오후 10:10:12", false, "1", "", ""],
    ["최재혁", 4000, "2024. 6. 1 오후 10:10:12", false, "1", "", ""],
    ["홍길동", 4000, "2024. 6. 1 오후 10:10:12", false, "2", "", ""],
  ];

  function insertCheckedDepositor(orderNumber, orderTotalAmount, totalAmount) {
    totalAmount -= orderTotalAmount;
    for (var i = 1; i < mockDepositorSheetData.length; i++) {
      var targetNumber = parseInt(mockDepositorSheetData[i][4]); // E열 발주서 번호
      if (targetNumber === orderNumber && !mockDepositorSheetData[i][3]) {
        let considerPredepositValue =
          mockDepositorSheetData[i].length > 6 && mockDepositorSheetData[i][6]
            ? parseInt(mockDepositorSheetData[i][6])
            : parseInt(mockDepositorSheetData[i][1]);
        if (orderTotalAmount >= considerPredepositValue) {
          orderTotalAmount -= considerPredepositValue;
          mockDepositorSheetData[i][3] = true;
          var rowItemChangedSetTrue = [...mockDepositorSheetData[i]];
          rowItemChangedSetTrue.splice(3, 1, true);
          mockTargetSheetData.push(rowItemChangedSetTrue);
        } else {
          var preDepositedAmount = considerPredepositValue - orderTotalAmount;
          mockDepositorSheetData[i][6] = preDepositedAmount;
          mockDepositorSheetData[
            i
          ][5] = `입금내역 초과 예치금 ${preDepositedAmount}`;
          return totalAmount;
        }
      }
    }
    return totalAmount;
  }

  //   // Mock function to insert checked depositor
  //   function insertCheckedDepositor(orderNumber, orderTotalAmount, totalAmount) {
  //     return totalAmount - orderTotalAmount;
  //   }

  // Main logic using mock data
  try {
    var sheetIds = mockSellerSheetData
      .map(function (row) {
        return row[2];
      })
      .filter(Boolean);

    sheetIds.forEach(function (sheetId) {
      try {
        var data = mockOrderSheetData;
        var filteredData = data.filter(function (row) {
          console.log(row);
          return row[3] == "발주완료"; // E열은 인덱스 3
        });

        console.log("filteredData", filteredData);
        const depositObjectByOrderNumber = getAllDepositObjectByOrderNumber();

        for (var i = 0; i < filteredData.length; i++) {
          var keyInFilteredData = filteredData[i][27];
          if (depositObjectByOrderNumber.hasOwnProperty(keyInFilteredData)) {
            var totalAmount =
              depositObjectByOrderNumber[keyInFilteredData].amount;
            let orderNumber = parseInt(keyInFilteredData);

            if (isNaN(orderNumber)) {
              orderNumber = parseFloat(keyInFilteredData); // K열: 금액
            }

            if (
              insertCheckOrderItem(filteredData[i], orderNumber, totalAmount)
            ) {
              filteredData[i][3] = "상품준비중"; // E열을 인덱스 3로 접근하여 값 변경
              filteredData[i][7] = "입금확인완료"; // H열을 인덱스 7로 접근하여 값 변경
            } else {
              filteredData[i][3] = "발주완료"; // E열을 인덱스 3로 접근하여 값 변경
              filteredData[i][7] = "금액확인필요"; // H열을 인덱스 7로 접근하여 값 변경
            }

            if (
              depositObjectByOrderNumber[keyInFilteredData].amount -
              filteredData[i][17]
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

        mockFilteredData.push(filteredData);
      } catch (e) {
        console.error("Error: " + e.message);
      }
    });
  } catch (e) {
    console.error("Error: " + e.message);
  } finally {
    console.log("mockFilteredData", mockFilteredData);
    console.log("mockTargetSheetData", mockOrderSheetData);
    console.log("Process complete");
  }
}

// Mock data instead of SpreadsheetApp data

// Run the function
importFilteredData();
