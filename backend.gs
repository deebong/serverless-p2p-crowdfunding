// Google Apps Script - backend.gs

const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'; // <--- PASTE YOUR SHEET ID HERE

function doGet(e) {
  const op = e.parameter.op;
  const ss = SpreadsheetApp.openById(SHEET_ID);

  if (op === 'getCampaigns') {
    const sheet = ss.getSheetByName('Campaigns');
    const data = sheet.getDataRange().getValues();
    const headers = data.shift();
    
    const campaigns = data.map(row => {
      let temp = {};
      headers.forEach((header, i) => temp[header] = row[i]);
      return temp;
    });
    return response(campaigns);
  }
}

function doPost(e) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const data = JSON.parse(e.postData.contents);

  if (data.action === 'createCampaign') {
    const sheet = ss.getSheetByName('Campaigns');
    const id = 'CMP-' + Math.floor(Math.random() * 100000); 
    // New fields added: category, end_date, rewards
    sheet.appendRow([
      id, data.title, data.desc, data.target, 0, data.upi, 
      data.creator, data.category, data.endDate, data.rewards
    ]);
    return response({status: 'success', id: id});
  }

  if (data.action === 'donate') {
    const donSheet = ss.getSheetByName('Donations');
    donSheet.appendRow([new Date(), data.campId, data.donor, data.amount, data.ref]);
    
    const campSheet = ss.getSheetByName('Campaigns');
    const rows = campSheet.getDataRange().getValues();
    // Assuming ID is column 0 (index 0) and Raised Amount is column 4 (index 4)
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === data.campId) { 
        let currentRaised = parseFloat(rows[i][4]) || 0;
        let newTotal = currentRaised + parseFloat(data.amount);
        campSheet.getRange(i + 1, 5).setValue(newTotal); 
        break;
      }
    }
    return response({status: 'success'});
  }
}

function response(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
