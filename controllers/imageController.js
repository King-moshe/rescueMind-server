const fs = require('fs');
const geminiService = require('../services/geminiService');

exports.predictImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }

  try {
    const imagePath = req.file.path;
    console.log("Image path:", imagePath);

    const result = await geminiService.sendImageForPrediction(imagePath);
    console.log("Prediction result:", result);

    // Delete the uploaded file after processing
    fs.unlink(imagePath, (unlinkError) => {
      if (unlinkError) {
        console.error("Failed to delete uploaded image:", unlinkError);
      }
    });

    res.json(result);
  } catch (error) {
    console.error("Error in predicting image:", error);
    
    // More specific error responses
    if (error.message.includes('API Key')) {
      return res.status(401).json({ 
        message: 'Authentication failed', 
        error: error.message 
      });
    }

    // Attempt to delete the file in case of an error
    if (req.file) {
      fs.unlink(req.file.path, (unlinkError) => {
        if (unlinkError) {
          console.error("Failed to delete uploaded image after error:", unlinkError);
        }
      });
    }

    res.status(500).json({ 
      message: 'Failed to predict image', 
      error: error.message || 'Unknown error occurred' 
    });
  }
};