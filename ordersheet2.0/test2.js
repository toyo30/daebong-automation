function processPaymentsAndOrders(payments, orders) {
  // 결과를 저장할 배열
  let results = payments.map((payment) => ({
    amount: payment,
    isChecked: false,
  }));

  // 현재 처리 중인 입금 금액의 인덱스
  let paymentIndex = 0;
  // 현재 처리 중인 주문 금액의 인덱스
  let orderIndex = 0;

  // 남은 입금 금액과 주문 금액
  let remainingPayment = payments[paymentIndex];
  let remainingOrder = orders[orderIndex];

  while (orderIndex < orders.length && paymentIndex < payments.length) {
    if (remainingPayment === remainingOrder) {
      results[paymentIndex].isChecked = true;
      paymentIndex++;
      orderIndex++;
      if (paymentIndex < payments.length)
        remainingPayment = payments[paymentIndex];
      if (orderIndex < orders.length) remainingOrder = orders[orderIndex];
    } else if (remainingPayment > remainingOrder) {
      results[paymentIndex].isChecked = true;
      remainingPayment -= remainingOrder;
      orderIndex++;
      if (orderIndex < orders.length) remainingOrder = orders[orderIndex];
    } else {
      remainingOrder -= remainingPayment;
      results[paymentIndex].isChecked = true;
      paymentIndex++;
      if (paymentIndex < payments.length)
        remainingPayment = payments[paymentIndex];
    }
  }

  // 체크된 결과 반환
  return results;
}

// 예시 사용
let payments = [1000, 2000, 3000];
let orders = [2000, 4000];
console.log(processPaymentsAndOrders(payments, orders));

payments = [1000, 5000, 2000];
orders = [1000, 2000];
console.log(processPaymentsAndOrders(payments, orders));
