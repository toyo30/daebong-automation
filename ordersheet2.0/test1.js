var mockDepositorSheetData = [
  ["이름", "금액", "날짜", "상태", "발주서 번호", "기타", "예치금"],
  ["최재혁", 4000, "2024. 6. 1 오후 10:10:12", false, "1", "", ""],
  ["최재혁", 4000, "2024. 6. 1 오후 10:10:12", false, "1", "", ""],
  ["최재혁", 4000, "2024. 6. 1 오후 10:10:12", false, "1", "", ""],
  ["홍길동", 4000, "2024. 6. 1 오후 10:10:12", false, "2", "", ""],
];

function getAllDepositObjectByOrderNumber() {
  return {
    1: { key: "1", amount: 12000 },
    2: { key: "2", amount: 4000 },
  };
}

var mockTargetSheetData = [];

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

insertCheckedDepositor(
  1,
  3000,
  getAllDepositObjectByOrderNumber()["1"]["amount"]
);

console.log("mockDepositorSheetData", mockDepositorSheetData);
console.log("mockTargetSheetData", mockTargetSheetData);

insertCheckedDepositor(
  1,
  3000,
  getAllDepositObjectByOrderNumber()["1"]["amount"]
);

console.log("mockDepositorSheetData", mockDepositorSheetData);
console.log("mockTargetSheetData", mockTargetSheetData);

insertCheckedDepositor(
  1,
  3000,
  getAllDepositObjectByOrderNumber()["1"]["amount"]
);

console.log("mockDepositorSheetData", mockDepositorSheetData);
console.log("mockTargetSheetData", mockTargetSheetData);

insertCheckedDepositor(
  1,
  5000,
  getAllDepositObjectByOrderNumber()["1"]["amount"]
);

console.log("mockDepositorSheetData", mockDepositorSheetData);
console.log("mockTargetSheetData", mockTargetSheetData);
