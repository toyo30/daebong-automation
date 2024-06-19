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

let depositObjectByOrderNumber = {
  19: { key: 19, amount: 794800 },
  20: { key: 20, amount: 856100 },
  21: { key: 21, amount: 703700 },
  48: { key: 48, amount: 21000 },
  50: { key: 50, amount: 76400 },
  57: { key: 57, amount: 166200 },
  60: { key: 60, amount: 21900 },
  98: { key: 98, amount: 249000 },
  114: { key: 114, amount: 273700 },
  130: { key: 130, amount: 42500 },
  143: { key: 143, amount: 1380700 },
  171: { key: 171, amount: 65000 },
  180: { key: 180, amount: 38700 },
  189: { key: 189, amount: 25200 },
  195: { key: 195, amount: 175400 },
  208: { key: 208, amount: 52000 },
  209: { key: 209, amount: 32800 },
  226: { key: 226, amount: 62000 },
  230: { key: 230, amount: 20000 },
  276: { key: 276, amount: 19500 },
  330: { key: 330, amount: 71300 },
  335: { key: 335, amount: 70200 },
  337: { key: 337, amount: 17800 },
  339: { key: 339, amount: 121000 },
  343: { key: 343, amount: 111000 },
  367: { key: 367, amount: 51400 },
  387: { key: 387, amount: 351800 },
  436: { key: 436, amount: 11300 },
  438: { key: 438, amount: 106100 },
  442: { key: 442, amount: 19600 },
  461: { key: 461, amount: 9700 },
  464: { key: 464, amount: 299200 },
  475: { key: 475, amount: 44100 },
  485: { key: 485, amount: 103800 },
  489: { key: 489, amount: 159000 },
  502: { key: 502, amount: 286000 },
  504: { key: 504, amount: 88700 },
  514: { key: 514, amount: 2133300 },
  517: { key: 517, amount: 91700 },
  552: { key: 552, amount: 15700 },
  553: { key: 553, amount: 37300 },
  2: { key: 1, amount: 37300 },
};

if (depositObjectByOrderNumber.hasOwnProperty(1)) {
  console.log("--");
} else {
  console.log("222");
}
// console.log(Object.keys(depositObjectByOrderNumber));

// Object.keys(depositObjectByOrderNumber).forEach(function (keyValue) {
//   console.log(keyValue);
//   console.log(depositObjectByOrderNumber[keyValue]["key"]);
// });

var d = [
  [1, 2, 3, 4, 5],
  [1, 2, 3, 4, 5],
];

d.splice(3, 1, true);

console.log(d);

d.splice(5, 1, 6);

console.log(d);

d[1][3] = 10;
console.log(d);

console.log(null || false);

var qi = [1, 2, 3, 4];
console.log(qi.slice(0, 4));
