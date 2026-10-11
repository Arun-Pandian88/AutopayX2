const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/web/src/app/dashboard/layout.tsx';
let data = fs.readFileSync(file, 'utf8');

// Import MobileBottomNav
if (!data.includes('MobileBottomNav')) {
  data = data.replace(
    "import ThemeToggle from '@/components/ThemeToggle';",
    "import ThemeToggle from '@/components/ThemeToggle';\nimport MobileBottomNav from '@/components/MobileBottomNav';"
  );
}

// Fix aside classes
data = data.replace(
  "className=\"w-[88px] hover:w-[260px] transition-all duration-300 ease-in-out bg-[#6C3FE2] flex flex-col py-8 z-50 rounded-r-[40px] group absolute h-full md:relative md:h-auto overflow-hidden shadow-2xl md:shadow-none\"",
  "className=\"hidden md:flex w-[88px] hover:w-[260px] transition-all duration-300 ease-in-out bg-[#6C3FE2] flex-col py-8 z-50 rounded-r-[40px] group relative h-auto overflow-hidden shadow-none\""
);

// Fix main classes
data = data.replace(
  "className=\"flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-br from-[#FAFAFC] to-[#F0F2F8] dark:from-[#0A0A0B] dark:to-[#1C1D22] pl-[88px] md:pl-0 transition-colors\"",
  "className=\"flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-br from-[#FAFAFC] to-[#F0F2F8] dark:from-[#0A0A0B] dark:to-[#1C1D22] pb-24 md:pb-0 transition-colors relative\""
);

// Fix header layout
data = data.replace(
  "header className=\"h-24 px-10 flex items-center justify-between\"",
  "header className=\"h-20 md:h-24 px-4 md:px-10 flex items-center justify-between\""
);

data = data.replace(
  "<div className=\"flex items-center space-x-8\">",
  "<div className=\"hidden md:flex items-center space-x-8\">"
);

data = data.replace(
  "<div className=\"flex-1 max-w-md mx-8\">",
  "<div className=\"hidden md:block flex-1 max-w-md mx-8\">"
);

// Replace children with MobileBottomNav
data = data.replace(
  "{children}\n          </div>",
  "{children}\n          </div>\n          <MobileBottomNav />"
);

fs.writeFileSync(file, data);
