/**
 * Comprehensive verification script to identify and fix inconsistencies
 * in the postcode database according to official immigration categories
 */
const fs = require('fs');
const path = require('path');

console.log('Running comprehensive postcode data verification...');

// Load current postcode data
const postcodeFile = path.join(__dirname, 'postcodes.json');
const postcodes = JSON.parse(fs.readFileSync(postcodeFile, 'utf8'));

// Get statistics
const stats = {
  total: Object.keys(postcodes).length,
  regional: 0,
  remote: 0,
  northern: 0,
  bushfire: 0,
  disaster: 0,
  remoteNotRegional: 0,
  northernNotRegional: 0,
  inconsistentNT: 0,
  missingFields: 0
};

// Official NT postcode range (should all be Northern AND Remote according to immigration)
const ntPostcodes = [];
for (let i = 800; i <= 899; i++) {
  ntPostcodes.push(i.toString().padStart(4, '0'));
}

// Official critical postcodes with verified classifications
const criticalPostcodes = {
  '6161': {  // Rottnest Island - verified from immigration site as Remote only
    regional: false,
    remote: true,
    northern: false,
    bushfire: false,
    disaster: false
  },
  '4550': {  // Sunshine Coast - verified from disaster declarations
    regional: true,
    remote: false,
    northern: false,
    bushfire: true,
    disaster: true
  },
  '0800': {  // Darwin - verified from immigration site as Remote and Northern
    regional: true,
    remote: true,
    northern: true,
    bushfire: false,
    disaster: false
  },
  '4870': {  // Cairns - verified as Northern and Regional
    regional: true,
    remote: false,
    northern: true,
    bushfire: false,
    disaster: false
  },
  '6721': {  // Port Hedland - verified as Remote and Northern
    regional: true,
    remote: true,
    northern: true,
    bushfire: false,
    disaster: false
  }
};

// Function to identify and fix issues
function fixIssues() {
  const inconsistencies = [];
  const fixed = [];
  
  // Analyze and fix each postcode
  Object.entries(postcodes).forEach(([code, data]) => {
    // Check for missing fields
    const requiredFields = ['regional', 'remote', 'northern', 'bushfire', 'disaster'];
    const missingFields = requiredFields.filter(field => data[field] === undefined);
    
    if (missingFields.length > 0) {
      stats.missingFields++;
      // Add missing fields
      missingFields.forEach(field => {
        data[field] = false;
      });
      fixed.push(`Added missing fields to ${code}: ${missingFields.join(', ')}`);
    }
    
    // Convert any legacy 'flood' field to 'disaster'
    if ('flood' in data) {
      data.disaster = data.flood;
      delete data.flood;
      fixed.push(`Converted 'flood' to 'disaster' in ${code}`);
    }
    
    // Update statistics
    if (data.regional) stats.regional++;
    if (data.remote) stats.remote++;
    if (data.northern) stats.northern++;
    if (data.bushfire) stats.bushfire++;
    if (data.disaster) stats.disaster++;
    
    // Check for inconsistencies based on official rules
    // Official rule: All NT postcodes should be Northern AND Remote
    if (ntPostcodes.includes(code)) {
      if (!data.northern || !data.remote) {
        stats.inconsistentNT++;
        inconsistencies.push(`NT Postcode ${code} is not correctly marked as Northern AND Remote`);
        // Fix NT postcode
        data.northern = true;
        data.remote = true;
        data.regional = true; // Regional by definition
        fixed.push(`Fixed NT postcode ${code}`);
      }
    }
    
    // Apply critical overrides from verified cases
    if (code in criticalPostcodes) {
      const correct = criticalPostcodes[code];
      const incorrect = Object.keys(correct).filter(key => data[key] !== correct[key]);
      
      if (incorrect.length > 0) {
        inconsistencies.push(`Critical postcode ${code} has incorrect values for: ${incorrect.join(', ')}`);
        // Apply the correct values
        Object.assign(data, correct);
        fixed.push(`Fixed critical postcode ${code}`);
      }
    }
    
    // Check for logical inconsistencies
    // Remote and Northern areas should be Regional unless explicitly overridden
    // Rottnest Island (6161) is the only exception we know of
    if (data.remote && !data.regional && code !== '6161') {
      stats.remoteNotRegional++;
      inconsistencies.push(`Postcode ${code} is Remote but not Regional`);
      // Fix inconsistency
      data.regional = true;
      fixed.push(`Fixed: Made Remote postcode ${code} also Regional`);
    }
    
    if (data.northern && !data.regional) {
      stats.northernNotRegional++;
      inconsistencies.push(`Postcode ${code} is Northern but not Regional`);
      // Fix inconsistency
      data.regional = true;
      fixed.push(`Fixed: Made Northern postcode ${code} also Regional`);
    }
  });
  
  // Print analysis
  console.log('\nPOSTCODE DATABASE ANALYSIS:');
  console.log(`Total postcodes: ${stats.total}`);
  console.log(`Regional Australia: ${stats.regional}`);
  console.log(`Remote and Very Remote Australia: ${stats.remote}`);
  console.log(`Northern Australia: ${stats.northern}`);
  console.log(`Bushfire declared areas: ${stats.bushfire}`);
  console.log(`Natural disaster declared areas: ${stats.disaster}`);
  
  console.log('\nINCONSISTENCIES FOUND:');
  console.log(`Postcodes with missing fields: ${stats.missingFields}`);
  console.log(`Remote but not Regional postcodes: ${stats.remoteNotRegional}`);
  console.log(`Northern but not Regional postcodes: ${stats.northernNotRegional}`);
  console.log(`Inconsistent NT postcodes: ${stats.inconsistentNT}`);
  
  if (inconsistencies.length > 0) {
    console.log('\nSample inconsistencies:');
    inconsistencies.slice(0, 10).forEach(item => console.log(`- ${item}`));
  }
  
  if (fixed.length > 0) {
    console.log('\nFIXES APPLIED:');
    console.log(`Fixed ${fixed.length} issues`);
    if (fixed.length > 10) {
      console.log('Sample fixes:');
      fixed.slice(0, 10).forEach(item => console.log(`- ${item}`));
    } else {
      fixed.forEach(item => console.log(`- ${item}`));
    }
  }
  
  return fixed.length > 0;
}

// Run the verification and fix
const hasChanges = fixIssues();

if (hasChanges) {
  // Create backup before saving
  const backupFile = path.join(__dirname, `postcodes_backup_${Date.now()}.json`);
  fs.writeFileSync(backupFile, fs.readFileSync(postcodeFile));
  console.log(`\nCreated backup at ${backupFile}`);
  
  // Save updated data
  fs.writeFileSync(postcodeFile, JSON.stringify(postcodes, null, 2));
  console.log('Saved updated database with fixes');
} else {
  console.log('\nNo changes needed, database is consistent');
}

console.log('\nVerification complete. Please restart your backend server to apply changes.');
