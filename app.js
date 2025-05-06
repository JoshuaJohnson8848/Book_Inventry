const express = require('express');
const bodyParser = require('body-parser');
const bookRoutes = require('./routes/books.js');

const app = express();
app.use(bodyParser.json());
app.use('/api/books', bookRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Book Inventory API running on port ${PORT}`);
});
