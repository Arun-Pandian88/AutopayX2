const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('C:/Users/Arun/OneDrive/Documents/AutopayX/apps/web/src');
const API_VAR = "API_URL"; // for some files
const REGEX_1 = /\$\{process\.env\.NEXT_PUBLIC_API_URL \|\| 'http:\/\/localhost:8000'\}/g;
const REGEX_2 = /\$\{API_URL\}/g;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  if (content.match(REGEX_1)) {
    content = content.replace(REGEX_1, "");
    changed = true;
  }
  
  // also check if they did const API_URL = process.env.NEXT_PUBLIC_API_URL...
  if (content.includes('const API_URL =')) {
    content = content.replace(/const API_URL = [^;]+;/, "const API_URL = '';");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log("Updated: " + file);
  }
});
