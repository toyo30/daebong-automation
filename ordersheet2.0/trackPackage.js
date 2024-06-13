function fetchCarrierId(searchText) {
  var API_URL = "https://apis.tracker.delivery/graphql";
  var CLIENT_ID = "1uja2e6bh8q4s7qf272ae88s5s";
  var CLIENT_SECRET = "dgce4ft20dogp8i05dtqi2di5dvl0tkjvlnn5nne7fik225tkao";

  var query = `query CarrierList(
    $searchText: String!,
    $after: String
  ) {
    carriers(
      searchText: $searchText,
      first: 10,
      after: $after
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          name
        }
      }
    }
  }`;

  var payload = {
    query: query,
    variables: {
      searchText: searchText,
      after: null,
    },
  };

  var options = {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: "TRACKQL-API-KEY " + CLIENT_ID + ":" + CLIENT_SECRET,
    },
    payload: JSON.stringify(payload),
  };

  try {
    var response = UrlFetchApp.fetch(API_URL, options);
    var responseCode = response.getResponseCode();
    var responseContent = response.getContentText();

    Logger.log("HTTP Status Code: " + responseCode);
    Logger.log("Response Content: " + responseContent);

    if (responseCode === 200) {
      var json = JSON.parse(responseContent);
      if (
        json.data &&
        json.data.carriers &&
        json.data.carriers.edges.length > 0
      ) {
        Logger.log("Carrier ID retrieved successfully");
        return json.data.carriers.edges[0].node.id; // Return the first matching carrier ID
      } else {
        Logger.log("No carrier found for search text: " + searchText);
      }
    } else {
      Logger.log("HTTP request failed with status code " + responseCode);
    }
  } catch (e) {
    Logger.log("Error during fetch: " + e.message);
  }
  return null;
}

function batchTrackPackage() {
  var sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("발주확정상품");
  var lastRow = sheet.getLastRow();
  var data = sheet.getDataRange().getValues();
  var rowsToMove = [...data];
  Logger.log("data");
  Logger.log(data);
  var batchSize = 100; // 한 번에 처리할 행 수
  // 배치 프로세스 초기화
  PropertiesService.getScriptProperties().setProperty(
    "rowsToMove",
    JSON.stringify(rowsToMove)
  );
  PropertiesService.getScriptProperties().setProperty("currentBatch", 0);
  PropertiesService.getScriptProperties().setProperty("lastRow", lastRow);
  trackPackage();
}

function trackPackage() {
  var data = JSON.parse(
    PropertiesService.getScriptProperties().getProperty("rowsToMove")
  );
  var currentBatch = parseInt(
    PropertiesService.getScriptProperties().getProperty("currentBatch")
  );
  var lastRow = parseInt(
    PropertiesService.getScriptProperties().getProperty("lastRow")
  );
  var batchSize = 100;
  var start = currentBatch * batchSize;
  var end = Math.min(start + batchSize, lastRow);
  var sheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("발주확정상품");

  for (var i = start; i < end; i++) {
    var trackingNumber = data[i][3];
    var statusCode = data[i][4];

    // D열의 값이 "DELIVERED"인 경우 건너뛰기
    if (!trackingNumber || trackingNumber === "") {
      continue;
    }
    Logger.log("data[i]");
    Logger.log(data[i]);

    try {
      var carrierName = data[i][2];
      var carrierId = fetchCarrierId(carrierName);

      if (carrierId && trackingNumber) {
        var API_URL = "https://apis.tracker.delivery/graphql";
        var CLIENT_ID = "1uja2e6bh8q4s7qf272ae88s5s";
        var CLIENT_SECRET =
          "dgce4ft20dogp8i05dtqi2di5dvl0tkjvlnn5nne7fik225tkao";

        var query =
          "query Track($carrierId: ID!, $trackingNumber: String!) { track(carrierId: $carrierId, trackingNumber: $trackingNumber) { lastEvent { time status { code name } description } } }";

        var payload = {
          query: query,
          variables: {
            carrierId: carrierId,
            trackingNumber: String(trackingNumber),
          },
        };

        var options = {
          method: "post",
          contentType: "application/json",
          headers: {
            Authorization: "TRACKQL-API-KEY " + CLIENT_ID + ":" + CLIENT_SECRET,
          },
          payload: JSON.stringify(payload),
        };

        var response = UrlFetchApp.fetch(API_URL, options);
        var json = JSON.parse(response.getContentText());

        Logger.log(json);
        var lastEvent = null;
        var statusDescription = "미출고";
        var statusCode = "No code available";
        if (json.hasOwnProperty("errors")) {
          Logger.log("미출고");
          sheet.getRange(i + 1, 5).setValue(statusDescription);
        } else if (
          json.hasOwnProperty("data") &&
          json.data.hasOwnProperty("track") &&
          json.data.track.hasOwnProperty("lastEvent")
        ) {
          lastEvent = json.data.track.lastEvent;
          statusDescription = lastEvent.status.name;
          statusCode = lastEvent.status.code;
          Logger.log("statusDescription");
          Logger.log(statusDescription);
          Logger.log("statusCode");
          Logger.log(statusCode);
          sheet.getRange(i + 1, 5).setValue(statusDescription);
        }

        updateRowWhileOrderTracking(data[i], statusDescription, trackingNumber);

        // sheet.getRange(i, 4).setValue(statusCode);
      }
    } catch (e) {
      Logger.log("Error on row " + i + ": " + e.message);
      // sheet.getRange(i, 3).setValue('상품준비중');
      sheet.getRange(i + 1, 5).setValue("출고대기");
    }
  }

  Logger.log("end < lastRow");
  Logger.log(end < lastRow);

  if (end < lastRow) {
    PropertiesService.getScriptProperties().setProperty(
      "currentBatch",
      currentBatch + 1
    );
    Logger.log("currentBatch");
    Logger.log(currentBatch);
    trackPackage(); // 다음 배치 처리
  } else {
    Logger.log("All batches processed");
  }
}

function updateRowWhileOrderTracking(
  rowData,
  statusDescription,
  trackingNumber
) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sellerOrderSheet = ss.getSheetByName("셀러발주서정보");
  // 셀러발주서정보 시트에서 C열 아이디 가져오기
  // AB열의 코드 가져오기
  var code = rowData[27]; // AB열의 인덱스는 27 (0부터 시작)

  var sheetIds = sellerOrderSheet.getRange("C1:C").getValues().flat();
  var sellerId = sheetIds[parseInt(code)];

  Logger.log("updateRowWhileOrderTracking");
  Logger.log(updateRowWhileOrderTracking);
  Logger.log(rowData);
  Logger.log(sellerId);

  if (sellerId) {
    // 아이디에 해당하는 스프레드시트 접근
    var sellerSpreadsheet = SpreadsheetApp.openById(sellerId);
    var cumulativeOrderSheet = sellerSpreadsheet.getSheetByName("누적발주");
    var cumulativeOrderData = cumulativeOrderSheet.getDataRange().getValues();

    // "누적발주" 시트에서 동일한 B열 값을 찾기
    var rowToUpdate = findRowByValueInBatchTrackPackage(
      cumulativeOrderData,
      rowData[1]
    ); // B열은 2번째 컬럼
    if (rowToUpdate != -1) {
      updateSheetStatusInBatchTrackPackage(
        cumulativeOrderSheet,
        rowToUpdate,
        5,
        statusDescription
      );
      if (
        !cumulativeOrderData[rowToUpdate][3] ||
        cumulativeOrderData[rowToUpdate][3] == ""
      ) {
        updateSheetStatusInBatchTrackPackage(
          cumulativeOrderSheet,
          rowToUpdate,
          4,
          trackingNumber
        );
      }
      // var cumulativeData = cumulativeOrderSheet.getDataRange().getValues();
      // if (cumulativeData[rowToUpdate][4] == "출고대기") {
      //   updateSheetStatusInBatchTrackPackage(cumulativeOrderSheet, rowToUpdate, 5, "statusDescription");
      // }
    }
  }
}

function updateSheetStatusInBatchTrackPackage(
  sheet,
  rowIndex,
  columnIndex,
  newValue
) {
  sheet.getRange(rowIndex + 1, columnIndex).setValue(newValue);
}

function findRowByValueInBatchTrackPackage(data, value) {
  for (var i = 1; i < data.length; i++) {
    if (data[i][1] == value) {
      return i;
    }
  }
  return -1;
}
