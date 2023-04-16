const express = require('express');
const serveStatic = require('serve-static');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(serveStatic(path.join(__dirname)));

// index.html 파일 제공
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
