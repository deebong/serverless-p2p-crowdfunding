**FundFlow - P2P Crowdfunding Platform**

A decentralized, serverless Single Page Application (SPA) for crowdfunding that uses Google Sheets as a database and UPI for direct peer-to-peer payments.

**About**

**FundFlow** is a modern, mobile-first crowdfunding web application designed to connect creators directly with backers. Unlike traditional platforms that take a commission and hold funds, FundFlow facilitates **direct UPI transfers** (GPay, PhonePe, Paytm) from the backer to the creator.

The entire backend is powered by **Google Sheets** and **Google Apps Script**, making this a completely free-to-host solution with zero infrastructure costs.

**Key Features**

- **Mobile-First SPA**: Fully responsive design that works like a native app on mobile devices.
- **Serverless Backend**: Uses Google Sheets to store campaigns and donations.
- **Direct P2P Payments**: Generates dynamic UPI links and QR codes. Money goes directly to the creator's bank account.
- **Performance**: Implements localStorage caching (Stale-While-Revalidate) for instant page loads.
- **Security**: Includes client-side XSS sanitization and Math Captcha to prevent spam.
- **User Profiles**: Tracks user's created campaigns and fundraising stats locally without requiring a login system.
- **Modern UI**: Clean interface with category filtering and search.

**Tech Stack**

- **Frontend:** HTML5, CSS3 (Custom Variables), Vanilla JavaScript (ES6+).
- **Backend:** Google Apps Script (GAS).
- **Database:** Google Sheets.
- **Icons:** Inline SVG & Font styling.

**Installation & Setup**

Since this project relies on your own Google Account for the database, you need to set up the backend first.

**Step 1: The Database (Google Sheet)**

- Create a new [Google Sheet](https://sheets.google.com).
- Rename the first tab to Campaigns.
- In the first row (Header), add exactly these columns: id, title, description, target_amount, raised_amount, upi_id, creator_name, category, end_date, rewards
- Create a second tab named Donations with these headers: timestamp, campaign_id, donor_name, amount, transaction_ref

**Step 2: The API (Google Apps Script)**

- inside your Google Sheet, go to Extensions > Apps Script.
- Delete any code there and paste the following **backend.gs** code:

```
const SHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'; // Get this from your Sheet URL

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

```
- Replace YOUR_GOOGLE_SHEET_ID_HERE with the ID found in your Google Sheet URL.
- Click **Deploy** > **New Deployment**.
- Select type: **Web App**.
- Set "Execute as: **Me**" and "Who has access: **Anyone**".
- Click **Deploy** and copy the **Web App URL**.

**Step 3: Frontend Configuration**

- Open index.html in your code editor.
- Find the APPS_SCRIPT_URL constant at the bottom of the script section.
- Paste your Web App URL there:
- const APPS_SCRIPT_URL = '\[<https://script.google.com/macros/s/......./exec\>](<https://script.google.com/macros/s/......./exec>)';
- Open index.html in your browser. You are live!

**Contributing**

Contributions are welcome!

- Fork the project.
- Create your feature branch (git checkout -b feature/AmazingFeature).
- Commit your changes (git commit -m 'Add some AmazingFeature').
- Push to the branch (git push origin feature/AmazingFeature).
- Open a Pull Request.

**License**

Distributed under the GNU General Public License v3.0. See LICENSE for more information.

_Note: This project is a Proof of Concept (PoC) for P2P crowdfunding. Please ensure you comply with local financial regulations when using UPI for fundraising._
