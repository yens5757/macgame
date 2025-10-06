const fs = require('fs');
const path = require('path');

// Adjust this path based on your Angular version's output structure
// For Angular 20, it's typically: dist/blackjack-game/browser
const distPath = path.join(__dirname, 'dist/blackjack-game/browser');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(/\$\{NG_APP_SUPABASE_URL\}/g, process.env.NG_APP_SUPABASE_URL || '');
  content = content.replace(/\$\{NG_APP_SUPABASE_KEY\}/g, process.env.NG_APP_SUPABASE_KEY || '');
  content = content.replace(/\$\{NG_APP_GEMINI_API_KEY\}/g, process.env.NG_APP_GEMINI_API_KEY || '');
  
  fs.writeFileSync(filePath, content);
}

// Check if dist directory exists
if (!fs.existsSync(distPath)) {
  console.error(`Error: ${distPath} does not exist`);
  process.exit(1);
}

// Find and replace in all JS files
const files = fs.readdirSync(distPath);
files.forEach(file => {
  if (file.endsWith('.js')) {
    console.log(`Processing ${file}...`);
    replaceInFile(path.join(distPath, file));
  }
});

console.log('Environment variables replaced successfully!');