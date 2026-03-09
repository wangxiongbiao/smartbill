const fs = require('fs');
const file = 'app/dashboard/templates/page.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStart = '{/* Preview Block - Representing the template style */}';
const targetEnd = '                  {/* Gradient bottom fade */}\n                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent"></div>\n                </div>';

const startIndex = content.indexOf(targetStart);
const endIndex = content.indexOf(targetEnd) + targetEnd.length;

if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
  const replacement = `{/* Preview Block - Realistic Miniature Render */}
              <div className="aspect-4/3 bg-slate-50 relative group border-b border-gray-50 flex items-center justify-center overflow-hidden">
                {/* Scaled down actual invoice preview */}
                <div 
                  className="bg-white shadow-sm border border-slate-100 origin-top transform group-hover/card:-translate-y-2 transition-transform duration-500 ease-out absolute pointer-events-none"
                  style={{ 
                    width: '210mm',
                    minWidth: '210mm',
                    transform: 'scale(0.35)',
                    top: '8%'
                  }}
                >
                  <InvoicePreview
                    invoice={previewInvoice}
                    template={template.id}
                  />
                </div>
                
                {/* Gradient bottom fade to hide the cut-off */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none z-0"></div>
              </div>`;

  const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  fs.writeFileSync(file, newContent);
  console.log("Replaced successfully!");
} else {
  console.log("Could not find target content boundaries.");
  console.log("startIndex: ", startIndex, "endIndex: ", endIndex);
}
