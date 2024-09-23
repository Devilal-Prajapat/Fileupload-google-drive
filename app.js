// Function to handle POST request and save or append to files in Google Drive
function doPost(e) {
    try {
      // Parse the JSON data from the request
      var jsonData = JSON.parse(e.postData.contents);
  
      var folderName = jsonData.folderName;
      var fileName = jsonData.fileName;
      var fileContent = jsonData.fileContent;
      var userEmail = jsonData.userEmail; // Add user email field
  
      // Check for missing fields
      if (!folderName || !fileName || !fileContent || !userEmail) {
        throw new Error("Missing folderName, fileName, content, or userEmail in the request");
      }
  
      // Create or find the folder in Google Drive
      var folder;
      var folders = DriveApp.getFoldersByName(folderName);
      if (folders.hasNext()) {
        folder = folders.next();
      } else {
        // If folder doesn't exist, create it
        folder = DriveApp.createFolder(folderName);
      }
  
      // Check if the file already exists in the folder
      var files = folder.getFilesByName(fileName);
      var file;
      if (files.hasNext()) {
        // If the file exists, append the new content
        file = files.next();
        var existingContent = file.getBlob().getDataAsString(); // Read the existing content
        var newContent = existingContent + "\n" + fileContent;  // Append new content with a newline
        file.setContent(newContent);                            // Overwrite the file with appended content
      } else {
        // If the file does not exist, create a new file
        file = folder.createFile(fileName, fileContent);
      }
  
      // Make the file editable and generate a link
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT);
      var fileLink = file.getUrl();
  
      // Send an email notification to the user with the link to edit the file
      var subject = "File Upload Successful - Edit Link";
      var message = "Your file '" + fileName + "' was uploaded/updated successfully in folder '" + folderName + "'.\n" +
                    "You can edit the file using this link: " + fileLink;
      MailApp.sendEmail(userEmail, subject, message);
  
      // Return a success response
      var jsonResponse = {
        "status": "success",
        "message": "File created/updated successfully."
    }
      return ContentService.createTextOutput(res);
    } catch (error) {
      // Send an email notification to the user in case of an error
      var errorSubject = "File Upload Failed";
      var errorMessage = "There was an error during your file upload: " + error.message;
  
      // Check if userEmail is provided to send error notification
      if (jsonData && jsonData.userEmail) {
        MailApp.sendEmail(jsonData.userEmail, errorSubject, errorMessage);
      }
      var jsonResponse = {
        "status": "error",
        "message": error.message
    }
      // Return a failure response
      return ContentService.createTextOutput(JSON.stringify(jsonResponse))
      .setMimeType(ContentService.MimeType.JSON);
    }
  }
  