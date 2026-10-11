const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/web/src/app/dashboard/payment-links/page.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  '<table className="w-full text-left">',
  '<div className="overflow-x-auto w-full"><table className="w-full text-left min-w-[600px]">'
);

data = data.replace(
  '</table>\n      </div>\n    );\n  }',
  '</table></div>\n      </div>\n    );\n  }'
);

fs.writeFileSync(file, data);
