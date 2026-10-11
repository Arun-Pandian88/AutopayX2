const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/web/src/app/dashboard/settings/page.tsx';
let data = fs.readFileSync(file, 'utf8');

// Insert logout function
const insertLogoutFunc = `  const handleLogout = async () => {
    try {
      await fetch(\`\${API_URL}/api/dashboard/logout\`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        credentials: 'include',
      });
    } catch (e) {}
    document.cookie = 'user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    window.location.href = '/login';
  };`;

data = data.replace(
  "const handleUpdatePassword = async () => {",
  insertLogoutFunc + "\n\n  const handleUpdatePassword = async () => {"
);

// Insert logout button
const insertLogoutButton = `
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-[#2d2e33]">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-sm font-bold rounded-xl text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </button>
          </div>
`;

data = data.replace(
  "          </button>\n        </aside>",
  "          </button>\n" + insertLogoutButton + "        </aside>"
);

// Add LogOut import
if (!data.includes('LogOut')) {
  data = data.replace(
    "import { User, Bell, Shield, CreditCard, Camera, Check, X, Loader2 } from 'lucide-react';",
    "import { User, Bell, Shield, CreditCard, Camera, Check, X, Loader2, LogOut } from 'lucide-react';"
  );
}

fs.writeFileSync(file, data);
