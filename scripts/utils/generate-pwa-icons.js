const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const svgPath = path.join(__dirname, '../public/icon.svg');
const outputDir = path.join(__dirname, '../public/icons');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateIcons() {
  console.log('🎨 Gerando ícones PWA...\n');

  const svgBuffer = fs.readFileSync(svgPath);

  for (const size of sizes) {
    const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);

    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`✅ Gerado: icon-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Erro ao gerar icon-${size}x${size}.png:`, error.message);
    }
  }

  // Generate shortcut icons
  console.log('\n🎨 Gerando ícones de atalho...\n');

  const shortcuts = [
    { name: 'expense', color: '#ef4444', symbol: '−' },
    { name: 'transactions', color: '#10b981', symbol: '≡' },
    { name: 'chat', color: '#8b5cf6', symbol: '💬' }
  ];

  for (const shortcut of shortcuts) {
    const svg = `
      <svg width="96" height="96" xmlns="http://www.w3.org/2000/svg">
        <rect width="96" height="96" fill="${shortcut.color}" rx="20"/>
        <text x="48" y="66" font-family="Arial" font-size="48" font-weight="bold"
              fill="white" text-anchor="middle">${shortcut.symbol}</text>
      </svg>
    `;

    const outputPath = path.join(outputDir, `shortcut-${shortcut.name}.png`);

    try {
      await sharp(Buffer.from(svg))
        .resize(96, 96)
        .png()
        .toFile(outputPath);

      console.log(`✅ Gerado: shortcut-${shortcut.name}.png`);
    } catch (error) {
      console.error(`❌ Erro ao gerar shortcut-${shortcut.name}.png:`, error.message);
    }
  }

  console.log('\n✨ Todos os ícones foram gerados com sucesso!');
}

generateIcons().catch(console.error);
