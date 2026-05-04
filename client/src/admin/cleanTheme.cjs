const fs = require('fs');
const path = require('path');
const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jsx'));

const replacements = [
  // Heavy headers
  { p: /bg-\[#2E1A12\] text-\[#F5F5F5\]/g, r: "bg-slate-50 text-slate-500 border-b border-slate-200" },
  { p: /bg-\[#2E1A12\]/g, r: "bg-slate-50" },
  
  // Text colors
  { p: /text-\[#2E1A12\]/g, r: "text-slate-800" },
  { p: /text-\[#F5F5F5\]/g, r: "text-slate-500" },
  
  // Prices
  { p: /text-\[#D84315\]/g, r: "text-emerald-600" },
  
  // Buttons
  { p: /bg-\[#D84315\] hover:bg-\[#bf3910\]/g, r: "bg-slate-800 hover:bg-slate-900" },
  { p: /bg-\[#D84315\]/g, r: "bg-slate-800" },
  
  // Backgrounds / borders from hero config
  { p: /bg-\[#C89B3C\]\/10/g, r: "bg-amber-50" },
  { p: /text-\[#C89B3C\]/g, r: "text-amber-500" },
  { p: /bg-\[#C89B3C\]/g, r: "bg-amber-500" },
  { p: /ring-\[#C89B3C\]/g, r: "ring-amber-500" },
  { p: /hover:bg-\[#b08833\]/g, r: "hover:bg-amber-600" },
  { p: /hover:file:bg-\[#C89B3C\]\/20/g, r: "hover:file:bg-amber-100" },
  
  // Fix order status colors
  { p: /bg-\[#C89B3C\]\/20 text-\[#2E1A12\] border-\[#C89B3C\]/g, r: "bg-amber-100 text-amber-800 border-amber-200" }
];

let changedCount = 0;
files.forEach(f => {
  const file = path.join(dir, f);
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  replacements.forEach(({p, r}) => {
    content = content.replace(p, r);
  });
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    changedCount++;
    console.log('Updated: ' + f);
  }
});
console.log('Done! Files updated: ' + changedCount);
