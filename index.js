const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'active')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'active', 'index.html'));
});

app.listen(port, () => {
  console.log(`PacFrame running at http://localhost:${port}`);
});