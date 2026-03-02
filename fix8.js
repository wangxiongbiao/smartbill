// Read the backup file
const fs = require('fs');
let content = fs.readFileSync('.backup/InvoiceForm.tsx', 'utf8');

// I will just use regex to fix the missing tags
// At the end of the DndContext we are missing some </div>'s that got eaten when we refactored the Sections.
// Let's count again where the unbalanced tags are exactly
console.log("DndContext bounds: ", content.indexOf('<DndContext'), content.indexOf('</DndContext>'));

let afterDnd = content.slice(content.indexOf('</DndContext>'), content.indexOf('{/* Summary & Totals */}'));
console.log("AFTER DND:\n" + afterDnd);
