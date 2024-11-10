const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

console.log("Using Gemini API Key:", process.env.GEMINI_API_KEY);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.sendImageForPrediction = async (imagePath) => {
  try {
    // Check if API key is present
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API Key is missing');
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const prompt = "זיהוי פציעות בתמונה. אנא סרוק את התמונה המצורפת ודווח על: מספר האנשים בתמונה? מצב פיזי כללי של כל אדם(לרבות פציעות גלויות, דימומים, חוסר באיברים, תנוחות חשודות לפציעה). רמת דחיפות טיפול רפואי.";
    // const prompt = "האם יש בתמונה אנשים פצועים? אנא פרט את סוג הפציעה, מיקומה ומספר האנשים הפצועים. שימו לב: המערכת אינה תחליף לבדיקה רפואית.";
    // const prompt = "אנא בצע זיהוי האם האדם בתמונה חסר איברים כלשהם...";
    // const prompt = "Identify if the person in the image is missing any limbs.";
   
    console.log("Sending request to Gemini API...");

    const result = await model.generateContent({
      contents: [{ 
        role: 'user', 
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
        ]
      }]
    });

    const response = await result.response;
    const text = response.text();

    console.log("Gemini response received:", text);
    return { response: text };
  } catch (error) {
    console.error("Detailed Gemini API Error:", {
      message: error.message,
      status: error.status,
      errorDetails: error.errorDetails
    });

    // More specific error handling
    if (error.status === 400 && error.errorDetails) {
      const apiError = error.errorDetails.find(
        detail => detail.reason === 'API_KEY_INVALID'
      );
      
      if (apiError) {
        throw new Error('Invalid or Expired Gemini API Key. Please regenerate the key.');
      }
    }

    throw error;
  }
};