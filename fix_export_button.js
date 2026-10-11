const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/web/src/components/ExportButton.tsx';
let data = fs.readFileSync(file, 'utf8');

// Add usePathname import
if (!data.includes('usePathname')) {
  data = data.replace(
    "import { useState, useRef, useEffect } from 'react';",
    "import { useState, useRef, useEffect } from 'react';\nimport { usePathname } from 'next/navigation';"
  );
}

// Add pathname check logic
const hookStartRegex = /const \[isOpen, setIsOpen\] = useState\(false\);/;
const injectLogic = `const pathname = usePathname();
  const restrictedPaths = ['/dashboard/settings', '/dashboard/connect', '/dashboard/plans', '/dashboard/config', '/docs'];
  
  const [isOpen, setIsOpen] = useState(false);`;

data = data.replace(hookStartRegex, injectLogic);

// Add early return
const returnRegex = /return \(\s*<div className="relative" ref=\{dropdownRef\}\>/;
const earlyReturn = `if (restrictedPaths.includes(pathname)) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>`;

data = data.replace(returnRegex, earlyReturn);

fs.writeFileSync(file, data);
