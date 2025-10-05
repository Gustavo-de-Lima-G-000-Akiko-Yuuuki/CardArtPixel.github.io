# CardArtPixel — “Pensando…”

> Interface retro com **pixel art** animada, publicada via **GitHub Pages**.  
> Este projeto desenha frames de um sprite em um `<canvas>` (com *image-rendering: pixelated*), simulando uma tela CRT com moldura, scanlines e brilho. Também inclui um utilitário em Node.js para gerar um **card SVG animado** a partir dos mesmos frames.

## ✨ Destaques
- **Pixel art animada** a 30 FPS diretamente no navegador (HTML/CSS/JS puro).
- **Design retro/CRT**: moldura, cantos, scanlines e efeito de brilho.
- **Spritesheet ▶️ SVG**: script `scripts/build_sprite.mjs` monta um SVG animado com `steps()` a partir do JSON de frames.
- **Hospedagem simples** via GitHub Pages (ramo `main`).
- Sem bundler, sem frameworks — **só abrir e rodar**.

## 🚀 Demo
Quando publicado no GitHub Pages, a página principal é servida a partir de `index.html`.
Se o seu repositório é `CardArtPixel.github.io`, a URL pública fica:
```
https://<seu-usuario>.github.io/
```
> Substitua `<seu-usuario>` pelo seu usuário do GitHub.

## 🧩 Como funciona
- O `index.html` carrega `pixelart_frames_72x56_full.json`, um array de frames onde **cada frame** é uma matriz de caracteres.  
- Cada caractere representa uma cor na **paleta**:
  - `k` = #0b0b10 (preto)  
  - `P` = #b66bff (roxo claro)  
  - `p` = #a455f7 (roxo escuro)  
  - `B` = #77c7ff (azul claro)  
  - `b` = #5bb1ef (azul escuro)  
  - `G` = #8ef1a0 (verde)  
  - `W` = #ffffff (branco)  
  - `.` = transparente  
- O script desenha pixel a pixel no `<canvas>` e ajusta o *scale* conforme o container, mantendo o aspecto **pixelado**.

### Estrutura dos frames (JSON)
Formato simplificado (exemplo ilustrativo):
```json
[
  [
    "k.kW",
    "Pk.W",
    "....",
    "WbGb"
  ],
  [
    "k.kW",
    "Pk.W",
    "....",
    "WbGb"
  ]
]
```
- **Array externo** = lista de frames (animação).
- Cada **frame** = lista de linhas (strings).
- Cada **linha** = sequência de símbolos da paleta acima.

## 📂 Estrutura do projeto
```
/
├─ .github/                       # (meta/ações opcionais)
├─ index.html                     # UI retro + lógica de animação no canvas
├─ card.svg                       # (gerado pelo script de build) SVG animado do sprite
├─ pixelart_frames_72x56_full.json# Frames de pixel art (grande)
├─ package.json                   # Dependência e script de build
└─ scripts/
   └─ build_sprite.mjs            # Gera spritesheet PNG embutida e SVG animado
```

## 🛠️ Requisitos (para o build do card SVG)
- **Node.js** 18+
- **npm**

Instale a dependência usada no script:
```bash
npm i
# ou, se preferir, somente a dependência direta
npm i pngjs
```

## 🧪 Executando localmente (somente a página)
Como é estático, basta abrir o `index.html` em um servidor local para evitar problemas de CORS ao carregar o JSON:
```bash
# Python 3
python -m http.server 8080

# ou com Node (se tiver http-server global)
npx http-server -p 8080
```
Depois acesse http://localhost:8080

## 🧱 Gerando o card SVG animado
O script lê o JSON de frames, gera uma **spritesheet PNG** em memória (Data URI) e embute num **SVG** com animação por `@keyframes` usando `steps(N)`.

Comandos:
```bash
# usa valores padrão (DURATION=10s, SCALE=4)
npm run build:card

# customizando por variáveis de ambiente:
# velocidade da animação (ex.: 2s, 3.5s, 10s)
DURATION=3s npm run build:card

# escala do sprite (inteiro, aumenta o tamanho do pixel)
SCALE=6 npm run build:card
```
Saída esperada:
```
✔ Gerado card.svg (frame LxA, frames: N, scale: S)
```

### Parâmetros principais do build
- `DURATION` (padrão: `10s`) — duração do ciclo completo da animação.
- `SCALE` (padrão: `4`) — fator de escala para ampliar o sprite no SVG.
- Paleta e *background* (gradient) estão definidos no script e podem ser alterados conforme a sua identidade visual.

## 🎨 Personalização (página)
- **Cores e tema**: altere variáveis CSS em `:root` (`--fundo`, `--cor-primaria`, `--cor-secundaria`, etc.).  
- **Efeito CRT**: controle *scanlines* e brilho na classe `.efeito` e sombras aplicadas à moldura.  
- **Tamanho**: o canvas se ajusta ao container; para mudar a proporção, edite `.moldura`/`.container-canvas`.  
- **FPS**: no JS, a taxa é controlada por `const FPS = 30;` — ajuste conforme sua necessidade.

## ♿ Acessibilidade
- A moldura usa `role="img"` e `aria-label` descrevendo a cena.  
- Mantenha a descrição atualizada se mudar o conteúdo/efeitos visuais.

## ☁️ Deploy no GitHub Pages
1. Faça *push* do conteúdo na branch **`main`**.  
2. No GitHub, acesse **Settings → Pages**.  
3. Em **Build and deployment**, selecione **Branch: `main`**.  
4. Salve — a página ficará disponível em `https://<seu-usuario>.github.io/`.

> Se já for um repositório do tipo `<usuario>.github.io`, o Pages costuma publicar automaticamente.

## 📜 Licença
Defina a licença desejada (ex.: MIT). Se não houver um arquivo `LICENSE`, considere criar um.

## 🙌 Créditos
- Arte e código: **Gustavo_Lima_G (AKIKO_YUUKI)** — assinatura visível em `index.html`.
- Base em HTML/CSS/JS puro + script Node (`pngjs`) para geração do SVG.

---

### Ideias de próximos passos
- Controle de **velocidade** via UI (slider) afetando `FPS` no canvas.
- Botão para alternar **paletas**.
- Carregamento de **sprites externos** (JSON remoto) com tratamento de CORS.
- Exportar **GIF**/**WebM** a partir dos frames (build opcional).
