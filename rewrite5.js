const fs = require('fs');
let content = fs.readFileSync('src/app/admin/products/page.tsx', 'utf8');

const regexes = [
  // Inputs (Product Name, Price, Original Price, Material, Weight)
  {
    regex: /className="w-full bg-ivory\/30 border border-burgundy\/10 rounded-xl px-4 py-3 font-body text-burgundy focus:border-burgundy\/30 outline-none transition-colors"/g,
    replacement: 'className="w-full bg-ivory/30 border border-burgundy/10 rounded-xl px-4 h-12 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors"'
  },
  // DropdownMenuTrigger
  {
    regex: /className="w-full flex justify-between items-center bg-ivory\/30 border border-burgundy\/10 rounded-xl px-4 py-3 font-body text-burgundy focus:border-burgundy\/30 outline-none transition-colors cursor-pointer data-\[state=open\]:border-burgundy\/30"/g,
    replacement: 'className="w-full flex justify-between items-center bg-ivory/30 border border-burgundy/10 rounded-xl px-4 h-12 font-body text-burgundy focus:border-burgundy/30 outline-none transition-colors cursor-pointer data-[state=open]:border-burgundy/30"'
  },
  // In Stock checkbox container
  {
    regex: /className="flex items-center gap-3 bg-ivory\/30 px-4 py-3 rounded-xl border border-burgundy\/10"/g,
    replacement: 'className="flex items-center gap-3 bg-ivory/30 px-4 h-12 rounded-xl border border-burgundy/10"'
  }
];

regexes.forEach(({regex, replacement}) => {
  content = content.replace(regex, replacement);
});

fs.writeFileSync('src/app/admin/products/page.tsx', content);
console.log('Done standardizing heights');
