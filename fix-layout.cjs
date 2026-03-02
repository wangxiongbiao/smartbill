const fs = require('fs');

let fileStr = fs.readFileSync('.backup/InvoiceForm.tsx', 'utf8');

// We want to extract the "Summary & Totals" grid and split it.
// Right now, inside "Line Items & Totals Card":
// <section className="pt-8 mt-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-12">
// Left col: <div className="space-y-8"> ... Notes ... Payment Info ... </div>
// Right col: <div className="space-y-8"> ... Subtotal Box ... Signature ... Disclaimer ... </div>
// </section>

// Find the start of Summary & Totals
let summaryStartIdx = fileStr.indexOf('{/* Summary & Totals */}');
let endIdx = fileStr.indexOf('</section>', summaryStartIdx);

let oldSummarySection = fileStr.substring(summaryStartIdx, endIdx + '</section>'.length);

// Left col is inside `<div className="space-y-8">` right after `{/* Notes & payment toggle */}`
let leftColStart = oldSummarySection.indexOf('<div className="space-y-8">');
let leftColEnd = oldSummarySection.indexOf('</div>\n\n                        {/* Totals & Signature */}');
let leftColContent = oldSummarySection.substring(leftColStart, leftColEnd + '</div>'.length);

let rightColStart = oldSummarySection.indexOf('<div className="space-y-8">', leftColEnd);
let rightColSubtotalStart = oldSummarySection.indexOf('<div className="bg-slate-50', rightColStart);
let rightColSubtotalEnd = oldSummarySection.indexOf('</div>\n\n                            {/* Signature area */}');
let subtotalBox = oldSummarySection.substring(rightColSubtotalStart, rightColSubtotalEnd) + '</div>';

let signatureAndDisclaimer = oldSummarySection.substring(rightColSubtotalEnd + '</div>'.length);
let sigStartIdx = signatureAndDisclaimer.indexOf('{/* Signature area */}');
if (sigStartIdx !== -1) {
    signatureAndDisclaimer = signatureAndDisclaimer.substring(sigStartIdx);
} else {
    // fallback
    sigStartIdx = signatureAndDisclaimer.indexOf('<div className="space-y-4">');
    signatureAndDisclaimer = signatureAndDisclaimer.substring(sigStartIdx);
}

// Ensure signatureAndDisclaimer doesn't include the trailing `</div>` of right col and `</section>`
let cleanSig = signatureAndDisclaimer;
let sEnd = cleanSig.lastIndexOf('</section>');
if (sEnd !== -1) cleanSig = cleanSig.substring(0, sEnd);
let dEnd = cleanSig.lastIndexOf('</div>');
if (dEnd !== -1) cleanSig = cleanSig.substring(0, dEnd);
cleanSig = cleanSig.trim();


// Now construct the new layout
// 1. Subtotal goes directly under Line Items (inside the same card)

let newLayout = `
                    {/* Subtotal */}
                    <div className="flex justify-end pt-8 mt-8 border-t border-slate-100">
                        <div className="w-full md:w-1/2 lg:w-1/3">
                            ${subtotalBox}
                        </div>
                    </div>
                </div>

                {/* Additional Info Card */}
                <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-sm mt-6">
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-12">
${leftColContent}
                        <div className="space-y-8">
                            ${cleanSig}
                        </div>
                    </section>
                </div>`;

fileStr = fileStr.replace(oldSummarySection + '\n                </div>', newLayout);

fs.writeFileSync('components/invoice/InvoiceForm.tsx', fileStr);
