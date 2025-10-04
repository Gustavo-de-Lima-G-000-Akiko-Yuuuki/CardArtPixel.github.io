import fs from "fs";
import path from "path";
import { PNG } from "pngjs";

/*
 * Gera um cartão SVG animado a partir dos quadros de pixel art
 * descritos em `pixelart_frames_72x56_full.json`. O cartão utiliza um
 * spritesheet PNG embutido via data URI e animação CSS `steps()`.
 *
 * As configurações do tema e da duração podem ser passadas via
 * variáveis de ambiente: `CARD_THEME` e `DURATION`. Caso contrário,
 * são utilizados valores padrão.
 */

// Arquivo JSON com os quadros de pixel art
const FRAMES_JSON = "pixelart_frames_72x56_full.json";
// Nome do arquivo de saída
const OUTPUT_SVG = "card.svg";
// Duração padrão da animação
const DURATION = process.env.DURATION || "2.4s";
// Tema padrão (dark, light, transparent, emerald)
const THEME = (process.env.CARD_THEME || "dark").toLowerCase();

// Paleta de cores usada nos quadros (símbolo -> cor)
const PALETTE = {
  k: "#0b0b10", // preto
  P: "#b66bff", // roxo claro
  p: "#a455f7", // roxo escuro
  B: "#77c7ff", // azul claro
  b: "#5bb1ef", // azul escuro
  G: "#8ef1a0", // verde
  W: "#ffffff", // branco
  ".": null     // transparente
};

// Temas para o cartão (fundo, borda, texto)
const THEMES = {
  transparent: { bg: "transparent", border: "#E5E7EB", text: "#111827" },
  light:       { bg: "#FFFFFF",     border: "#E5E7EB", text: "#111827" },
  dark:        { bg: "#0B1020",     border: "#2D3748", text: "#E5E7EB" },
  emerald:     { bg: "#06281E",     border: "#10B98166", text: "#ECFDF5" }
};

const theme = THEMES[THEME] || THEMES.dark;

// Caminho para o arquivo de quadros
const framesPath = path.join(process.cwd(), FRAMES_JSON);
if (!fs.existsSync(framesPath)) {
  console.error(`Arquivo não encontrado: ${FRAMES_JSON}`);
  process.exit(1);
}

// Lê e analisa os quadros
const frames = JSON.parse(fs.readFileSync(framesPath, "utf8"));
const frameH = frames[0].length;
const frameW = frames[0][0].length;
const frameCount = frames.length;

if (!frameW || !frameH || !frameCount) {
  console.error("JSON de quadros inválido.");
  process.exit(1);
}

// Dimensões do spritesheet (frames lado a lado)
const sheetW = frameW * frameCount;
const sheetH = frameH;
const png = new PNG({ width: sheetW, height: sheetH, colorType: 6 }); // RGBA

// Converte cor hex para RGBA
function hexToRGBA(hex) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return [r, g, b, 255];
}

// Preenche o spritesheet com todos os quadros
for (let f = 0; f < frameCount; f++) {
  const frame = frames[f];
  for (let y = 0; y < frameH; y++) {
    for (let x = 0; x < frameW; x++) {
      const sym = frame[y][x];
      const color = PALETTE[sym];
      const dx = f * frameW + x;
      const idx = (sheetW * y + dx) << 2; // índice RGBA

      if (!color) {
        // Transparente
        png.data[idx + 3] = 0;
      } else {
        const [r, g, b, a] = hexToRGBA(color);
        png.data[idx + 0] = r;
        png.data[idx + 1] = g;
        png.data[idx + 2] = b;
        png.data[idx + 3] = a;
      }
    }
  }
}

// Converte o spritesheet em buffer PNG e depois para data URI
const buffer = PNG.sync.write(png);
const sheetDataUri = `data:image/png;base64,${buffer.toString("base64")}`;

// Layout do cartão
const pad = 16;
const titleY = 28;
const imgY = 40;

const cardW = frameW + pad * 2;
const cardH = frameH + pad + imgY + 12;

// Distância total percorrida na animação (spritesheet)
const travel = (frameCount - 1) * frameW;

// Monta o SVG com animação CSS
const svg = `<?xml version="1.0" encoding="UTF-8"?>\n` +
`<svg width="${cardW}" height="${cardH}" viewBox="0 0 ${cardW} ${cardH}"\n` +
`     xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ArtPixel card">\n` +
`  <style><![CDATA[\n` +
`    #strip { \n` +
`      animation: play ${DURATION} steps(${frameCount}) infinite; \n` +
`      image-rendering: pixelated; \n` +
`      transform: translateX(0);\n` +
`    }\n` +
`    @keyframes play { \n` +
`      to { transform: translateX(-${travel}px); } \n` +
`    }\n` +
`    text { font-family: Inter, Segoe UI, Roboto, Arial, sans-serif; }\n` +
`  ]]></style>\n\n` +
`  <rect x="0.5" y="0.5" width="${cardW - 1}" height="${cardH - 1}" rx="12" ry="12"\n` +
`        fill="${theme.bg}" stroke="${theme.border}" />\n\n` +
`  <text x="${pad}" y="${titleY}" font-size="16" font-weight="600" fill="${theme.text}">🎨 ArtPixel</text>\n\n` +
`  <!-- Área da animação -->\n` +
`  <clipPath id="frameClip">\n` +
`    <rect x="${pad}" y="${imgY}" width="${frameW}" height="${frameH}" rx="4" ry="4"/>\n` +
`  </clipPath>\n\n` +
`  <g clip-path="url(#frameClip)">\n` +
`    <g id="strip" transform="translate(0,0)">\n` +
`      <image x="${pad}" y="${imgY}" width="${sheetW}" height="${sheetH}"\n` +
`             href="${sheetDataUri}" preserveAspectRatio="xMinYMin meet" />\n` +
`    </g>\n` +
`  </g>\n\n` +
`  <text x="${pad}" y="${cardH - 10}" font-size="12" fill="${theme.text}" opacity="0.7">\n` +
`    Made by Gustavo_Lima_G (AKIKO_YUUKI)\n` +
`  </text>\n` +
`</svg>`;

// Escreve o SVG
fs.writeFileSync(path.join(process.cwd(), OUTPUT_SVG), svg, "utf8");
console.log(`✔ Gerado ${OUTPUT_SVG} (${frameW}x${frameH}, ${frameCount} frames).`);
