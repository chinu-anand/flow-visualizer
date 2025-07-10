const fs = require('fs');
const path = require('path');

// Path to the JSON file with the error
const inputFilePath = path.join(__dirname, 'testjson.json');
const outputFilePath = path.join(__dirname, 'testjson_fixed.json');

try {
  // Read the file content
  const fileContent = fs.readFileSync(inputFilePath, 'utf8');
  
  // Split the content at each standalone JSON object
  // This regex looks for a closing brace followed by an opening brace
  // with optional whitespace between them
  const jsonObjects = fileContent.split(/}\s*{/);
  
  if (jsonObjects.length > 1) {
    // Add the missing braces back that were removed by the split
    for (let i = 1; i < jsonObjects.length; i++) {
      jsonObjects[i] = '{' + jsonObjects[i];
    }
    jsonObjects[jsonObjects.length - 1] = jsonObjects[jsonObjects.length - 1];
    
    if (!jsonObjects[0].startsWith('{')) {
      jsonObjects[0] = '{' + jsonObjects[0];
    }
    
    if (!jsonObjects[jsonObjects.length - 1].endsWith('}')) {
      jsonObjects[jsonObjects.length - 1] += '}';
    }
    
    // Wrap the objects in an array
    const jsonArray = '[' + jsonObjects.join(',') + ']';
    
    // Write the fixed JSON to a new file
    fs.writeFileSync(outputFilePath, jsonArray);
    
    console.log(`Fixed JSON has been written to ${outputFilePath}`);
  } else {
    console.log('No JSON syntax error of the expected type was found.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
}
