require('dotenv').config({ path: '../.env' });
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

const generateQRCode = async () => {
  try {
    // Get frontend URL from environment or use default
    const frontendUrl = process.env.FRONTEND_URL || 'http://192.168.1.100:3000';
    
    console.log('Generating QR code for URL:', frontendUrl);
    
    // Generate QR code
    const qrCodeDataUrl = await QRCode.toDataURL(frontendUrl, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 1,
      margin: 2,
      width: 800,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    // Convert data URL to buffer
    const base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Save to file
    const outputPath = path.join(__dirname, '..', 'qr-code.png');
    fs.writeFileSync(outputPath, buffer);
    
    console.log('✅ QR code generated successfully!');
    console.log('📍 Location:', outputPath);
    console.log('🖨️  Print this QR code and place it at the entrance');
    console.log('');
    console.log('Instructions:');
    console.log('1. Print the qr-code.png file');
    console.log('2. Place it at the event entrance');
    console.log('3. Participants scan it to join and get paired');
    console.log('');
    console.log('🔗 QR code points to:', frontendUrl);
    
    // Also generate an HTML file for easy printing
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Event QR Code</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 20px;
      background: white;
    }
    .container {
      text-align: center;
      max-width: 800px;
    }
    h1 {
      color: #667eea;
      margin-bottom: 10px;
    }
    .subtitle {
      color: #666;
      margin-bottom: 30px;
      font-size: 1.2em;
    }
    img {
      max-width: 100%;
      border: 10px solid #667eea;
      border-radius: 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    .instructions {
      margin-top: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 10px;
      text-align: left;
    }
    .instructions h2 {
      color: #667eea;
      margin-top: 0;
    }
    .instructions ol {
      line-height: 1.8;
    }
    .stations {
      margin-top: 20px;
      padding: 20px;
      background: #e3f2fd;
      border-radius: 10px;
    }
    .stations h3 {
      color: #1976d2;
      margin-top: 0;
    }
    .stations ul {
      list-style: none;
      padding: 0;
    }
    .stations li {
      padding: 8px 0;
      font-size: 1.1em;
    }
    .stations li:before {
      content: "🎨 ";
    }
    @media print {
      body {
        background: white;
      }
      .instructions {
        page-break-before: always;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎨 Arts & Crafts Event</h1>
    <div class="subtitle">Scan to Join & Get Paired</div>
    <img src="data:image/png;base64,${base64Data}" alt="Event QR Code">
    
    <div class="stations">
      <h3>Available Stations:</h3>
      <ul>
        <li>Tote bag decoration</li>
        <li>Origami crafts</li>
        <li>Bead bracelets</li>
        <li>Keychain painting</li>
      </ul>
    </div>

    <div class="instructions">
      <h2>How It Works:</h2>
      <ol>
        <li><strong>Scan the QR code</strong> when you arrive at the entrance</li>
        <li><strong>Receive your unique ID</strong> (like "happy-turtle")</li>
        <li><strong>Get paired</strong> with another participant automatically</li>
        <li><strong>Meet your partner</strong> at the entrance</li>
        <li><strong>Visit stations together</strong> and create gifts for each other!</li>
      </ol>
    </div>
  </div>
</body>
</html>
    `;
    
    const htmlPath = path.join(__dirname, '..', 'qr-code.html');
    fs.writeFileSync(htmlPath, htmlContent);
    
    console.log('📄 Also generated printable HTML file:', htmlPath);
    console.log('   Open this in a browser to print a nice formatted version');
    
  } catch (error) {
    console.error('❌ Error generating QR code:', error);
    process.exit(1);
  }
};

generateQRCode();
