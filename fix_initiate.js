const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/web/src/app/pay/[slug]/page.tsx';
let data = fs.readFileSync(file, 'utf8');

const oldHandleInitiate = /async function handleInitiate\(overrideName, overrideEmail\) \{[\s\S]*?body: JSON\.stringify\(\{ customer_name: overrideName \|\| customerName, customer_email: overrideEmail \|\| customerEmail \}\)[\s\S]*?\} catch \{/m;

const newHandleInitiate = `async function handleInitiate(overrideName, overrideEmail) {
      const finalName = typeof overrideName === 'string' ? overrideName : customerName;
      const finalEmail = typeof overrideEmail === 'string' ? overrideEmail : customerEmail;
      
      setState('loading'); // Show loading while generating order
      try {
        const res = await fetch(\`\${API}/api/pay/\${slug}/initiate\`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customer_name: finalName, customer_email: finalEmail })
        });
        const json = await res.json();
        if (json.success) {
          setTxnId(json.data.txn_id);
          setState('paying'); // Now show the QR code and start polling
        } else {
          setError(json.message || 'Payment initiation failed');
          setState('failed');
        }
      } catch (err) {
        console.error("Initiate error:", err);`;

data = data.replace(oldHandleInitiate, newHandleInitiate);
fs.writeFileSync(file, data);
