const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
const PORT = 5050;

app.use(cors());

const postcodeData = JSON.parse(fs.readFileSync('postcodes.json', 'utf8'));

app.get('/api/check/:postcode', (req, res) => {
  const { postcode } = req.params;
  const { visaType } = req.query;
  
  console.log(`Received request for postcode: ${postcode}, visa type: ${visaType}`);
  
  let result = postcodeData[postcode];
  
  // If postcode doesn't exist in our data, return all false
  if (!result) {
    result = {
      regional: false,
      remote: false,
      northern: false,
      bushfire: false,
      flood: false
    };
  }
  
  // Apply visa-specific rules
  if (visaType === '462') {
    // For 462 visa, northern Australia has special rules for hospitality/tourism
    // Example: Let's say 462 visa holders can work in tourism/hospitality in northern areas,
    // even if not technically "regional"
    if (result.northern) {
      result.regional = true;
    }
  }
  
  res.json(result);
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));