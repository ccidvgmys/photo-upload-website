const { google } = require('googleapis');
const path = require('path');

// Google Drive API Configuration
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const MMEC_FOLDER_ID = '1bmyjaK642HxJxlD8cZBMdYewM5sZg9oV';
const SLU_FOLDER_ID = '1c3RppjMHTMGJdRmaQc4NzqZd3wr2z8_L';

// Service account credentials (you'll need to add these as environment variables)
const serviceAccountCredentials = {
  "type": "service_account",
  "project_id": "stationamenity",
  "private_key_id": process.env.PRIVATE_KEY_ID,
  "private_key": process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
  "client_email": process.env.CLIENT_EMAIL,
  "client_id": process.env.CLIENT_ID,
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": process.env.CLIENT_X509_CERT_URL,
  "universe_domain": "googleapis.com"
};

// Initialize Google Drive API
const auth = new google.auth.GoogleAuth({
  credentials: serviceAccountCredentials,
  scopes: SCOPES,
});

const drive = google.drive({ version: 'v3', auth });

// Create or get folder
async function createOrGetFolder(folderName, parentFolderId) {
  try {
    const response = await drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${parentFolderId}' in parents and trashed=false`,
      spaces: 'drive',
      fields: 'files(id, name)'
    });
    
    if (response.data.files.length > 0) {
      return response.data.files[0].id;
    }
    
    const folder = await drive.files.create({
      resource: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [parentFolderId]
      },
      fields: 'id'
    });
    
    return folder.data.id;
  } catch (error) {
    console.error('Error creating/getting folder:', error);
    throw new Error('Failed to create or access folder');
  }
}

exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' })
      };
    }

    const body = JSON.parse(event.body);
    const { folder, rakeName, photoDate, description, createFolder, fileData, fileName, mimeType } = body;

    if (!fileData || !fileName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No file data provided' })
      };
    }

    const baseFolderId = folder === 'SLU' ? SLU_FOLDER_ID : MMEC_FOLDER_ID;
    let targetFolderId = baseFolderId;

    // Create new folder if requested
    if (createFolder === true && rakeName && photoDate) {
      const newFolderName = `${rakeName}_${photoDate}`;
      targetFolderId = await createOrGetFolder(newFolderName, baseFolderId);
    }

    // Create filename with metadata
    let finalFileName = fileName;
    if (rakeName && photoDate) {
      const fileExtension = path.extname(fileName);
      const baseName = path.basename(fileName, fileExtension);
      finalFileName = `${rakeName}_${photoDate}_${baseName}${fileExtension}`;
    }

    // Convert base64 to buffer
    const fileBuffer = Buffer.from(fileData.split(',')[1], 'base64');

    // Upload to Google Drive
    const fileMetadata = {
      name: finalFileName,
      parents: [targetFolderId],
      description: description ? `Rake: ${rakeName}, Date: ${photoDate}, Description: ${description}` : undefined
    };

    const media = {
      mimeType: mimeType,
      body: fileBuffer
    };

    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id,name,webViewLink'
    });

    const folderName = createFolder && rakeName && photoDate ? `${rakeName}_${photoDate}` : folder;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: `File uploaded successfully to ${folderName} folder`,
        fileId: response.data.id,
        fileName: response.data.name,
        webViewLink: response.data.webViewLink,
        folderName: folderName,
        metadata: { rakeName, photoDate, description }
      })
    };

  } catch (error) {
    console.error('Upload error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to upload file',
        details: error.message
      })
    };
  }
}; 
