// scripts/build_sprite.mjs (versão minimal-card)
import fs from "fs";
import path from "path";
import { PNG } from "pngjs";

// ==== Config ====
const FRAMES_JSON = "pixelart_frames_72x56_full.json";
const OUTPUT_SVG  = "card.svg";

// velocidade do loop (ex.: "2.4s", "1.8s", "3s")
const DURATION = process.env.DURATION || "5s";

// fator de escala do frame (↑ tamanho do sprite no card)
const SCALE = parseInt(process.env.SCALE || "4", 10);

// fundo do card (radial gradient parecido com o seu)
const BG_COLORS = ["#101115", "#0a0b0e", "#050608"]; // stops 0%, 55%, 100%

// paleta (igual ao projeto)
const PALETTE = {
  "k": "#0b0b10",
  "P": "#b66bff",
  "p": "#a455f7",
  "B": "#77c7ff",
  "b": "#5bb1ef",
  "G": "#8ef1a0",
  "W": "#ffffff",
  ".": null
};

// ===== 1) Carrega frames =====
const framesPath = path.join(process.cwd(), FRAMES_JSON);
if (!fs.existsSync(framesPath)) {
  console.error(`Arquivo não encontrado: ${FRAMES_JSON}`);
  process.exit(1);
}
const frames = JSON.parse(fs.readFileSync(framesPath, "utf8"));
const frameH = frames[0].length;
const frameW = frames[0][0].length;
const frameCount = frames.length;

if (!frameW || !frameH || !frameCount) {
  console.error("JSON de frames inválido.");
  process.exit(1);
}

// ===== 2) Spritesheet PNG =====
const sheetW = frameW * frameCount;
const sheetH = frameH;
const png = new PNG({ width: sheetW, height: sheetH, colorType: 6 });

function hexToRGBA(hex) {
  const h = hex.slice(1);
  return [
    parseInt(h.slice(0,2),16),
    parseInt(h.slice(2,4),16),
    parseInt(h.slice(4,6),16),
    255
  ];
}

for (let f=0; f<frameCount; f++){
  const frame = frames[f];
  for (let y=0; y<frameH; y++){
    for (let x=0; x<frameW; x++){
      const sym = frame[y][x];
      const color = PALETTE[sym];
      const dx = f*frameW + x;
      const idx = (sheetW*y + dx) << 2;
      if (!color) { png.data[idx+3] = 0; continue; }
      const [r,g,b,a] = hexToRGBA(color);
      png.data[idx] = r; png.data[idx+1] = g; png.data[idx+2] = b; png.data[idx+3] = a;
    }
  }
}
const buffer = PNG.sync.write(png);
const sheetDataUri = `data:image/png;base64,${buffer.toString("base64")}`;

// ===== 3) SVG minimal (fundo + animação) =====
// dimensões do sprite “exibido”
const dispW = frameW * SCALE;
const dispH = frameH * SCALE;

// padding sutil para respir
const PAD = 16;

// dimensões do card
const cardW = dispW + PAD*2;
const cardH = dispH + PAD*2;

// deslocamento para centralizar o frame
const imgX = Math.floor((cardW - dispW) / 2);
const imgY = Math.floor((cardH - dispH) / 2);

// quanto o strip deve “andar” para mostrar todos os frames
const travel = (frameCount - 1) * dispW;

const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${cardW}" height="${cardH}" viewBox="0 0 ${cardW} ${cardH}"
     xmlns="http://www.w3.org/2000/svg" role="img" aria-label="ArtPixel animation">
  <defs>
    <radialGradient id="bg" cx="50%" cy="35%" r="80%">
      <stop offset="0%"   stop-color="${BG_COLORS[0]}"/>
      <stop offset="55%"  stop-color="${BG_COLORS[1]}"/>
      <stop offset="100%" stop-color="${BG_COLORS[2]}"/>
    </radialGradient>
    <clipPath id="frame">
      <rect x="${imgX}" y="${imgY}" width="${dispW}" height="${dispH}" rx="8" ry="8"/>
    </clipPath>
  </defs>

  <style><![CDATA[
    #strip{ animation: play ${DURATION} steps(${frameCount}) infinite; image-rendering: pixelated; }
    @keyframes play { to { transform: translateX(-${travel}px); } }
  ]]></style>

  <!-- Fundo do card -->
  <rect x="0" y="0" width="${cardW}" height="${cardH}" fill="url(#bg)"/>

  <!-- Janela/viewport do frame -->
  <g clip-path="url(#frame)">
    <g id="strip" transform="translate(0,0)">
      <image x="${imgX}" y="${imgY}"
             width="${sheetW * SCALE}" height="${sheetH * SCALE}"
             href="${sheetDataUri}" />
    </g>
  </g>
</svg>`;

fs.writeFileSync(path.join(process.cwd(), OUTPUT_SVG), svg, "utf8");
console.log(`✔ Gerado ${OUTPUT_SVG} (frame ${frameW}x${frameH}, frames: ${frameCount}, scale: ${SCALE})`);
