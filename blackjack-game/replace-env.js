const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, 'dist/blackjack-game/browser');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  const replacements = {
    '${NG_APP_SUPABASE_URL}': process.env.NG_APP_SUPABASE_URL || '',
    '${NG_APP_SUPABASE_KEY}': process.env.NG_APP_SUPABASE_KEY || '',
    '${NG_APP_GEMINI_API_KEY}': process.env.NG_APP_GEMINI_API_KEY || ''
  };
  
  for (const [placeholder, value] of Object.entries(replacements)) {
    if (content.includes(placeholder)) {
      content = content.replaceAll(placeholder, value);
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✓ Replaced variables in ${path.basename(filePath)}`);
  }
}

function walkDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDirectory(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.mjs')) {
      replaceInFile(filePath);
    }
  });
}

if (!fs.existsSync(distPath)) {
  console.error(`Error: ${distPath} does not exist`);
  process.exit(1);
}

console.log('Replacing environment variables...');
walkDirectory(distPath);
console.log('Done!');