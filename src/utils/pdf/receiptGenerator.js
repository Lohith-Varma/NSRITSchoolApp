import Share from 'react-native-share';
import Toast from 'react-native-toast-message';
import {formatCurrency} from '../formatters/currency';
import {formatDateForDisplay} from '../helpers/dateHelpers';

let createPdfFromHtml;

const getPdfGenerator = () => {
  if (createPdfFromHtml) {
    return createPdfFromHtml;
  }

  try {
    const htmlToPdf = require('react-native-html-to-pdf');
    if (htmlToPdf) {
      createPdfFromHtml =
        htmlToPdf.generatePDF ||
        htmlToPdf.default?.generatePDF ||
        htmlToPdf.default?.convert ||
        htmlToPdf.convert;
    }
  } catch (error) {
    throw new Error(
      'PDF receipt sharing is not available in this app build. Rebuild and reinstall the app so the native HtmlToPdf module is included.',
    );
  }

  if (typeof createPdfFromHtml !== 'function') {
    throw new Error(
      'PDF receipt sharing is not available in this app build. Rebuild and reinstall the app so the native HtmlToPdf module is included.',
    );
  }

  return createPdfFromHtml;
};

// Helper to convert numbers to words in Indian numbering system
function numberToWords(num) {
  const value = Math.floor(Number(num || 0));
  if (value === 0) return 'zero';

  const a = [
    '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
    'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'
  ];
  const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  function convertLessThanThousand(n) {
    let temp = '';
    if (n >= 100) {
      temp += a[Math.floor(n / 100)] + ' hundred ';
      n %= 100;
    }
    if (n >= 20) {
      temp += b[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      temp += a[n] + ' ';
    }
    return temp.trim();
  }

  let words = '';
  let n = value;

  let crore = Math.floor(n / 10000000);
  n %= 10000000;
  let lakh = Math.floor(n / 100000);
  n %= 100000;
  let thousand = Math.floor(n / 1000);
  n %= 1000;
  let remaining = n;

  if (crore > 0) {
    words += convertLessThanThousand(crore) + ' crore ';
  }
  if (lakh > 0) {
    words += convertLessThanThousand(lakh) + ' lakh ';
  }
  if (thousand > 0) {
    words += convertLessThanThousand(thousand) + ' thousand ';
  }
  if (remaining > 0) {
    words += convertLessThanThousand(remaining);
  }

  // Capitalize first letter
  const formattedWords = words.trim();
  return formattedWords.charAt(0).toUpperCase() + formattedWords.slice(1) + ' Rupees';
}

export const generateAndShareReceipt = async (payment) => {
  try {
    Toast.show({
      type: 'info',
      text1: 'Generating Receipt',
      text2: 'Preparing PDF document...',
      position: 'bottom',
    });

    const receiptNo = payment.receiptNo || payment.receiptNumber || 'N/A';
    const rawDate = payment.date || payment.paymentDate || new Date();
    const date = formatDateForDisplay(rawDate) || 'N/A';
    const studentName = payment.studentName || payment.student?.fullName || 'N/A';
    const className = payment.className || payment.student?.academicClass?.name || 'N/A';
    const admissionNo = payment.student?.studentId || payment.admissionNumber || 'N/A';
    const amountCurrency = formatCurrency(payment.amount);
    const amountWords = numberToWords(payment.amount);
    
    let installment = 'School Fee';
    let receivedFrom = payment.studentName || payment.student?.fullName || 'Student';
    
    try {
      if (payment.remarks && payment.remarks.trim().startsWith('{')) {
        const parsed = JSON.parse(payment.remarks);
        installment = parsed.installment || 'School Fee';
        receivedFrom = parsed.paidBy || receivedFrom;
      } else if (payment.remarks) {
        installment = payment.remarks;
      }
    } catch (e) {
      if (payment.remarks) {
        installment = payment.remarks;
      }
    }

    const receivedBy = payment.collectedByName || payment.collectedBy?.fullName || 'Accountant';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Fee Receipt</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333;
            padding: 20px;
            margin: 0;
            background-color: #fff;
          }
          .container {
            border: 2px solid #0f5132;
            border-radius: 8px;
            padding: 25px;
            position: relative;
            background-color: #fff;
            box-sizing: border-box;
            min-height: 95vh;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          
          /* Header styling */
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #0f5132;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          .header-logo {
            width: 70px;
            height: 70px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .header-center {
            text-align: center;
            flex-grow: 1;
            padding: 0 10px;
          }
          .school-name {
            font-size: 16px;
            font-weight: bold;
            color: #0c2340;
            margin: 0;
            letter-spacing: 0.5px;
          }
          .school-sub {
            font-size: 12px;
            font-weight: bold;
            color: #0c2340;
            margin: 2px 0 5px 0;
            letter-spacing: 1px;
          }
          .motto-bar {
            font-size: 9px;
            font-weight: bold;
            color: #198754;
            margin: 3px 0;
          }
          .motto-sanskrit {
            font-size: 11px;
            font-weight: bold;
            color: #333;
            margin: 3px 0;
          }
          .motto-translation {
            font-size: 9px;
            font-style: italic;
            color: #198754;
            margin: 2px 0 0 0;
          }
          .header-right-decoration {
            width: 70px;
            display: flex;
            justify-content: flex-end;
          }

          /* Meta styling (Receipt No & Date) */
          .meta-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            font-size: 14px;
          }
          .meta-item {
            font-weight: bold;
          }
          .meta-value {
            font-weight: normal;
            border-bottom: 1px dotted #333;
            padding-bottom: 2px;
            padding-left: 5px;
            min-width: 120px;
            display: inline-block;
          }

          /* Heading Pill */
          .title-container {
            text-align: center;
            margin-bottom: 35px;
          }
          .title-badge {
            background-color: #1a2d42;
            color: white;
            padding: 8px 35px;
            border-radius: 18px;
            font-size: 16px;
            font-weight: bold;
            display: inline-block;
            letter-spacing: 1px;
            text-transform: uppercase;
          }

          /* Details Section */
          .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .details-row td {
            padding: 10px 0;
            vertical-align: bottom;
          }
          .details-label {
            font-weight: bold;
            font-size: 14px;
            width: 160px;
            white-space: nowrap;
          }
          .details-value {
            border-bottom: 1px dashed #333;
            padding-bottom: 2px;
            padding-left: 10px;
            font-size: 14px;
            width: 100%;
          }

          /* Paragraph details */
          .receipt-paragraph {
            font-size: 15px;
            line-height: 2.2;
            text-align: justify;
            margin-bottom: 40px;
          }
          .inline-underline {
            border-bottom: 1px dashed #333;
            padding: 0 10px;
            font-weight: bold;
            display: inline-block;
          }

          /* Signatures */
          .signature-section {
            display: flex;
            flex-direction: column;
            gap: 15px;
            margin-top: auto;
            margin-bottom: 30px;
          }
          .sig-row {
            display: flex;
            font-size: 14px;
            font-weight: bold;
            align-items: bottom;
          }
          .sig-label {
            width: 120px;
          }
          .sig-value {
            border-bottom: 1px dashed #333;
            width: 180px;
            display: inline-block;
            padding-left: 10px;
            font-weight: normal;
          }

          /* Footer Address and Contact */
          .footer {
            border-top: 2px solid #0f5132;
            padding-top: 10px;
            margin-top: auto;
          }
          .address-row {
            font-size: 9px;
            color: #333;
            text-align: center;
            margin-bottom: 8px;
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 5px;
          }
          .footer-bar {
            background: linear-gradient(90deg, #0c2340 0%, #0c2340 85%, #198754 100%);
            color: white;
            padding: 8px;
            border-radius: 4px;
            display: flex;
            justify-content: space-around;
            font-size: 9px;
            font-weight: bold;
          }
          .footer-item {
            display: flex;
            align-items: center;
            gap: 5px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div>
            <div class="header">
              <div class="header-logo">
                <svg viewBox="0 0 100 100" width="70" height="70">
                  <path d="M 50,5 L 85,25 L 85,65 L 50,85 L 15,65 L 15,25 Z" fill="none" stroke="#0f5132" stroke-width="3"/>
                  <path d="M 50,12 L 78,28 L 78,60 L 50,76 L 22,60 L 22,28 Z" fill="#0c2340" opacity="0.1"/>
                  <path d="M 25,35 L 50,22 L 75,35 L 50,48 Z" fill="#0f5132"/>
                  <path d="M 75,35 L 75,60" fill="none" stroke="#0f5132" stroke-width="2"/>
                  <path d="M 50,48 L 50,80" fill="none" stroke="#198754" stroke-width="2"/>
                  <circle cx="50" cy="40" r="8" fill="#fff" stroke="#0c2340" stroke-width="2"/>
                </svg>
              </div>
              
              <div class="header-center">
                <div class="school-name">NADIMPALLI SATYANARAYANA RAJU</div>
                <div class="school-sub">INTERNATIONAL TECHNO SCHOOL</div>
                <div class="motto-bar">UNITY • LEARNING • GROWTH</div>
                <div class="motto-sanskrit">ज्ञानं परमं बलम्</div>
                <div class="motto-translation">Knowledge is the supreme strength</div>
              </div>
              
              <div class="header-right-decoration">
                <svg viewBox="0 0 100 100" width="60" height="60">
                  <path d="M 10,10 C 50,10 90,50 90,90" fill="none" stroke="#198754" stroke-width="12" stroke-linecap="round"/>
                  <path d="M 30,10 C 60,10 90,40 90,70" fill="none" stroke="#0c2340" stroke-width="8" stroke-linecap="round"/>
                </svg>
              </div>
            </div>
            
            <div class="meta-row">
              <div>
                <span class="meta-item">Receipt No:</span>
                <span class="meta-value">${receiptNo}</span>
              </div>
              <div>
                <span class="meta-item">Date:</span>
                <span class="meta-value">${date}</span>
              </div>
            </div>
            
            <div class="title-container">
              <div class="title-badge">Fee Receipt</div>
            </div>
            
            <table class="details-table">
              <tr class="details-row">
                <td class="details-label">Name of the student:</td>
                <td class="details-value">${studentName}</td>
              </tr>
              <tr class="details-row">
                <td class="details-label">Class:</td>
                <td class="details-value">${className}</td>
              </tr>
              <tr class="details-row">
                <td class="details-label">Admission no. :</td>
                <td class="details-value">${admissionNo}</td>
              </tr>
            </table>
            
            <div class="receipt-paragraph">
              Received the sum of rupees 
              <span class="inline-underline" style="min-width: 250px;">${amountWords} (${amountCurrency})</span> 
              for the 
              <span class="inline-underline" style="min-width: 150px;">${installment}</span> 
              installment from 
              <span class="inline-underline" style="min-width: 150px;">${receivedFrom}</span> 
              on 
              <span class="inline-underline" style="min-width: 120px;">${date}</span>.
            </div>
          </div>
          
          <div class="footer">
            <div class="signature-section">
              <div class="sig-row">
                <span class="sig-label">Received by:</span>
                <span class="sig-value">${receivedBy}</span>
              </div>
              <div class="sig-row" style="margin-top: 10px;">
                <span class="sig-label">Signature:</span>
                <span class="sig-value"></span>
              </div>
            </div>

            <div class="address-row">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#333" style="display:inline-block; vertical-align:middle; margin-right:3px;">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              NSR International Techno School, Sontyam village, Visakhapatnam, Andhra Pradesh - 531173
            </div>
            
            <div class="footer-bar">
              <div class="footer-item">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#fff" style="display:inline-block; vertical-align:middle; margin-right:3px;">
                  <path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56a.977.977 0 0 0-1.01.24l-2.2 2.2a15.045 15.045 0 0 1-6.59-6.59l2.2-2.2c.28-.28.36-.67.25-1.02C8.79 6.35 8.59 5.16 8.59 3.93c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.58c0-.56-.45-1-1-1z"/>
                </svg>
                9100046515
              </div>
              <div class="footer-item">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="#fff" style="display:inline-block; vertical-align:middle; margin-right:3px;">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                nsritschoolprincipal@gmail.com
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const options = {
      html: htmlContent,
      fileName: `Receipt_${receiptNo}`,
      directory: 'Documents',
    };

    const generatePDF = getPdfGenerator();
    const file = await generatePDF(options);
    const pdfPath = file.filePath;

    // Use react-native-share to share the PDF
    await Share.open({
      title: `Fee Receipt - ${receiptNo}`,
      url: `file://${pdfPath}`,
      type: 'application/pdf',
      failOnCancel: false,
    });

    Toast.show({
      type: 'success',
      text1: 'Receipt Shared',
      text2: 'PDF shared successfully.',
      position: 'bottom',
    });
  } catch (err) {
    console.error('PDF Receipt Generation Error:', err);
    Toast.show({
      type: 'error',
      text1: 'Generation Failed',
      text2: err.message || 'Could not generate or share receipt.',
      position: 'bottom',
    });
  }
};
