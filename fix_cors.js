const fs = require('fs');
const file = 'C:/Users/Arun/OneDrive/Documents/AutopayX/apps/api/src/app.js';
let data = fs.readFileSync(file, 'utf8');

const corsRegex = /app\.use\(cors\(\{[\s\S]*?origin: function\(origin, callback\) \{[\s\S]*?\},/m;
const newCors = `app.use(cors({
    origin: function(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://192.168.') || origin.startsWith('http://10.')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS (Bank-level strict origin policy)'));
      }
    },`;

data = data.replace(corsRegex, newCors);
fs.writeFileSync(file, data);
