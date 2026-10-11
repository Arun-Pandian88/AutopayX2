const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/web/src/app/dashboard/layout.tsx';
let data = fs.readFileSync(file, 'utf8');

const navLinksRegex = /<div className="hidden md:flex items-center space-x-8">[\s\S]*?<\/div>/;
const replacement = `<div className="md:hidden flex items-center">
              <div className="w-8 h-8 bg-[#6C3FE2] rounded-xl flex items-center justify-center shrink-0 shadow-md">
                <img src="/autopayx-logo.png" alt="Logo" className="w-6 h-6 object-contain" />
              </div>
              <span className="ml-2 font-black text-[#1C1D22] dark:text-white text-lg tracking-tight">AutoPayX</span>
            </div>
            
            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#" className="flex items-center text-[#1C1D22] dark:text-white font-bold">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </div>`;

data = data.replace(navLinksRegex, replacement);

fs.writeFileSync(file, data);
