data = [
  [
    "입금자명",
    "금액",
    "날짜",
    "입금확인",
    "발주서번호",
    "특이사항",
    "예치금",
    "총남은금액",
  ],
  [
    "백민기",
    3000.0,
    "Sat Jun 01 22:10:12 GMT+09:00 2024",
    false,
    2.0,
    ,
    ,
    3000.0,
  ],
  [
    "최재혁",
    6000.0,
    "Sat Jun 01 22:10:12 GMT+09:00 2024",
    false,
    3.0,
    "입금내역 초과 예치금",
    2994,
    2994.0,
    2994.0,
  ],
  [
    "504_팜브릿지",
    2.0,
    "Tue Jun 04 14:31:02 GMT+09:00 2024",
    false,
    504.0,
    ,
    ,
    2.0,
  ],
  [
    "57.0",
    1.0,
    "Mon Apr 15 15:03:01 GMT+09:00 2024",
    true,
    ,
    "입금자명찾지못함",
    ,
    0.0,
  ],
  [
    "57.0",
    1.0,
    "Mon Apr 15 15:03:01 GMT+09:00 2024",
    true,
    ,
    "입금자명찾지못함",
    ,
    0.0,
  ],
  [
    "57.0",
    1.0,
    "Mon Apr 15 15:03:01 GMT+09:00 2024",
    true,
    ,
    "입금자명찾지못함",
    ,
    0.0,
  ],
  ["143.0", 1.0, "Tue Jun 04 15:21:39 GMT+09:00 2024", false, 143.0, , , 1.0],
];

myData = [
  "57.0",
  1.0,
  "Mon Apr 15 15:03:01 GMT+09:00 2024",
  true,
  ,
  "입금자명찾지못함",
  ,
  0.0,
];

// const a = data.findIndex(myData);

const equals = (a, b) => JSON.stringify(a) === JSON.stringify(b);

var rowIndex = data.findIndex(function (originalRow) {
  console.log(originalRow);
  console.log(myData);
  console.log(originalRow == myData);
  console.log(equals(originalRow, myData));
  return equals(originalRow, myData);
});

console.log("------------------");
console.log(rowIndex);

console.log(data[rowIndex]);

const a = [0, 1, 2, 3, 4, 5];

const b = a.splice(4, 1, "4");
const c = [...a];
c.splice(4, 1, "4");
console.log(b);
console.log(a);
console.log(c);
