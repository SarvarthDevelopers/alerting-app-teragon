const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/data/mockData.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Replace serialNumber: 'SN-XXXXX' with serialNumber: 'SN-XXXXX-SN-XXXXX-SN-XXXXX'
content = content.replace(/(serialNumber:\s*'SN-\d+')(,?)/g, (match, p1, p2) => {
  const snVal = p1.match(/'([^']+)'/)[1];
  const newSn = `${snVal}-${snVal}-${snVal}`;
  return `serialNumber: '${newSn}'${p2}`;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated mockData.ts with tripled serial numbers.');
