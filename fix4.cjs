const fs = require('fs');
let file = fs.readFileSync('components/invoice/InvoiceForm.tsx', 'utf8');

// I am just going to fix the JSX structure because rewriting it from scratch takes too long and I know exactly what is wrong.
// Error 1: TS17008: JSX element 'div' has no corresponding closing tag at 363.

// Wait let's just use regex to count div tags.
let openDivs = (file.match(/<div/g) || []).length;
let closeDivs = (file.match(/<\/div>/g) || []).length;
console.log("Open Divs: " + openDivs);
console.log("Close Divs: " + closeDivs);

// Same for section
let openSection = (file.match(/<section/g) || []).length;
let closeSection = (file.match(/<\/section>/g) || []).length;
console.log("Open Section: " + openSection);
console.log("Close Section: " + closeSection);

