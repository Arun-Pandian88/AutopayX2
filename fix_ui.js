const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/web/src/app/pay/[slug]/page.tsx';
let data = fs.readFileSync(file, 'utf8');

const simulateFunction = `  const handleSimulatePayment = async () => {
    try {
      const res = await fetch(\`\${API}/api/pay/\${slug}/simulate/\${txnId}\`, {
        method: 'POST'
      });
      const json = await res.json();
      if (json.success) {
        // Polling will automatically pick it up in 5 seconds and transition to success
        alert('Simulated! Waiting for next poll...');
      }
    } catch (err) {
      console.error(err);
    }
  };`;

data = data.replace(
  "const CheckoutPage = () => {",
  "const CheckoutPage = () => {\n" + simulateFunction
);

data = data.replace(
  "export default function CheckoutPage() {",
  "export default function CheckoutPage() {\n" + simulateFunction
);


const buttonHtml = `                {/* Test Mode Button */}
                <div className="mt-4 pt-4 border-t border-gray-100 border-dashed">
                  <button
                    onClick={handleSimulatePayment}
                    className="w-full py-2.5 bg-yellow-50 text-yellow-700 text-sm font-semibold rounded-lg hover:bg-yellow-100 transition-colors border border-yellow-200"
                  >
                    Simulate Payment (Dev Testing)
                  </button>
                  <p className="text-[10px] text-gray-400 text-center mt-2 leading-relaxed">
                    Clicking this will instantly bypass the IMAP email verification<br/>and mark this transaction as paid.
                  </p>
                </div>`;

data = data.replace(
  "</p>\n              </div>\n            </div>\n          </div>\n        )}",
  "</p>\n              </div>\n" + buttonHtml + "\n            </div>\n          </div>\n        )}"
);

fs.writeFileSync(file, data);
