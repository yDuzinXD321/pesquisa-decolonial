const SHEET_NAME = "Respostas";

function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, message: "API da pesquisa online funcionando." }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        "Data/Hora",
        "Q1","Q2","Q3","Q4","Q5","Q6","Q7","Q8","Q9","Q10"
      ]);
    }

    const answers = data.answers || [];
    if (answers.length !== 10) {
      return json({ ok: false, error: "É necessário enviar 10 respostas." });
    }

    sheet.appendRow([new Date(), ...answers]);
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doOptions() {
  return ContentService.createTextOutput("");
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
