const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');

console.log("Using Gemini API Key:", process.env.GEMINI_API_KEY);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.sendImageForPrediction = async (imagePath) => {
  try {
    // וידוא ש-API Key קיים
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API Key is missing');
    }

    // בדיקת קובץ התמונה
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found at path: ${imagePath}`);
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');

    // הגדרת מודל
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      סרוק את התמונה המצורפת ובצע את הפעולות הבאות:
      1. זיהוי אנשים ופציעות - קבע את מספר האנשים בתמונה, עבור כל אדם ציין אם הוא פצוע או לא.
      2. סיווג דרגות פציעה - עבור כל פצוע סווג את דרגת הפציעה (קלה, בינונית, חמורה).
      3. הערכת דחיפות הטיפול - עבור כל פצוע, קבע את רמת הדחיפות בטיפול נדרש.
      4. הנחיות לטיפול ראשוני, כולל - בדיקות הכרה, בדיקות נשימה, איתור פציעות ודימומים, עצירת דימומים, פעולות נוספות לפי צורך.
      הצג את המידע בצורה מסודרת וברורה עבור כל אדם בתמונה.
    `;

    console.log("Sending request to Gemini API...");

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
          ]
        }
      ]
    });

    // קבלת התשובה
    const response = await result.response;
    const text = response.text();

    console.log("Gemini response received:", text);

    // עיצוב התגובה לצורת JSON ברורה
    return { 
      status: 'success',
      data: {
        analysis: text
      }
    };

  } catch (error) {
    console.error("Detailed Gemini API Error:", {
      message: error.message,
      status: error.status,
      errorDetails: error.errorDetails || null
    });

    if (error.status === 400 && error.errorDetails) {
      const apiError = error.errorDetails.find(
        detail => detail.reason === 'API_KEY_INVALID'
      );

      if (apiError) {
        throw new Error('Invalid or Expired Gemini API Key. Please regenerate the key.');
      }
    }

    // שגיאה כללית
    throw {
      status: 'error',
      message: error.message || 'An unexpected error occurred while processing the image.'
    };
  }
};
