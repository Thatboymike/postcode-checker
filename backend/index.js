const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 5050;

app.use(cors());

// Load postcode data using absolute path to avoid any directory issues
const postcodeFilePath = path.join(__dirname, 'postcodes.json');
console.log(`Loading postcode data from: ${postcodeFilePath}`);
let postcodeData;

try {
  const rawData = fs.readFileSync(postcodeFilePath, 'utf8');
  postcodeData = JSON.parse(rawData);
  console.log(`Successfully loaded data for ${Object.keys(postcodeData).length} postcodes`);
  // Log a sample to verify data integrity
  console.log('Sample data for postcode 2550:', postcodeData['2550']);
} catch (error) {
  console.error(`Error loading postcode data: ${error.message}`);
  postcodeData = {}; // Initialize with empty object in case of failure
}

app.get('/api/check/:postcode', (req, res) => {
  const { postcode } = req.params;
  const { visaType } = req.query;
  
  console.log(`Received request for postcode: ${postcode}, visa type: ${visaType}`);
  
  let result = postcodeData[postcode];
  console.log(`Data found for postcode ${postcode}:`, result);
  
  // If postcode doesn't exist in our data, return all false
  if (!result) {
    console.log(`No data found for postcode ${postcode}, returning default values`);
    result = {
      regional: false,
      remote: false,
      northern: false,
      bushfire: false,
      disaster: false
    };
  }
  
  // Convert any legacy 'flood' field to 'disaster' for consistency
  if (result.hasOwnProperty('flood')) {
    result.disaster = result.flood;
    delete result.flood;
  }
  
  // Apply visa-specific rules
  if (visaType === '462') {
    // For 462 visa, northern Australia has special rules for hospitality/tourism
    if (result.northern) {
      console.log(`Applying 462 visa rule: Northern Australia -> Regional = true`);
      result.regional = true;
    }
  }
  
  console.log(`Sending response for postcode ${postcode}:`, result);
  res.json(result);
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));