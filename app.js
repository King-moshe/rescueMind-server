require('dotenv').config();
const express = require('express');
const cors = require('cors');
const imageRoutes = require('./routes/imageRoutes');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads')); // מאפשר גישה לתמונות שהועלו

// Routes
app.use('/api/images', imageRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
