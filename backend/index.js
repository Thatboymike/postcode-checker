const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 5050;

app.use(cors());

const postcodeData = JSON.parse(fs.readFileSync('postcodes.json', 'utf8'));

app.get('/api/check/:postcode', (req, res) => {
  const { postcode } = req.params;
  console.log('Received request for postcode:', postcode);
  const result = postcodeData[postcode];
  if (result) {
    res.json(result);
  } else {
    res.json({
      regional: false,
      remote: false,
      northern: false,
      bushfire: false,
      flood: false
    });
  }
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));