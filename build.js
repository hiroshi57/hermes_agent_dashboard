#!/usr/bin/env node
/**
 * build.js — Hermes Agent Dashboard 最適化ビルド
 *
 * やること:
 *   1. index.html から <style> / <script> を抽出
 *   2. CSS を minify → dist/style.min.css
 *   3. JS  を terser で minify → dist/app.min.js
 *   4. dist/index.html を生成（外部ファイル参照 + preload hint）
 *   5. 静的アセット (favicon 等) をそのままコピー
 *
 * 実行: node build.js
 */

const fs   = require('fs');
const path = require('path');
const { minify: terserMinify } = require('terser');

const SRC  = path.join(__dirname, 'index.html');
const DIST = path.join(__dirname, 'dist');

// ── ユーティリティ ────────────────────────────────────────

/** 簡易 CSS minifier（コメント削除 + 余白圧縮） */
function minifyCss(css) {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')   // コメント除去
    .replace(/\s*([{};:,>~+])\s*/g, '$1') // 記号前後の空白除去
    .replace(/\s{2,}/g, ' ')            // 連続空白を1つに
    .replace(/\n/g, '')                  // 改行除去
    .replace(/;\s*}/g, '}')             // 末尾セミコロン省略
    .trim();
}

/** コンテンツハッシュを生成（キャッシュバスティング用） */
function shortHash(str) {
  let h = 0;
  for (const c of str) { h = (Math.imul(31, h) + c.charCodeAt(0)) >>> 0; }
  return h.toString(36).slice(0, 8);
}

// ── メイン ───────────────────────────────────────────────

async function build() {
  console.log('📦 Hermes Agent Dashboard — ビルド開始');

  const html = fs.readFileSync(SRC, 'utf8');

  // 1. CSS 抽出
  const cssMatch = html.match(/<style>([\s\S]*?)<\/style>/);
  if (!cssMatch) throw new Error('<style> ブロックが見つからない');
  const rawCss = cssMatch[1];

  // 2. JS 抽出
  const jsMatch = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/);
  if (!jsMatch) throw new Error('<script> ブロックが見つからない');
  const rawJs = jsMatch[1];

  // 3. CSS minify
  console.log(`  CSS: ${Math.round(rawCss.length/1024)}KB → minify...`);
  const minCss = minifyCss(rawCss);
  console.log(`  CSS: → ${Math.round(minCss.length/1024)}KB`);

  // 4. JS minify (terser)
  console.log(`  JS:  ${Math.round(rawJs.length/1024)}KB → minify...`);
  const terserResult = await terserMinify(rawJs, {
    compress: {
      drop_console: false,    // console.log を残す（デバッグ用）
      passes: 2,
    },
    mangle: true,
    format: { comments: false },
  });
  if (terserResult.error) throw terserResult.error;
  const minJs = terserResult.code;
  console.log(`  JS:  → ${Math.round(minJs.length/1024)}KB`);

  // 5. ハッシュ付きファイル名
  const cssHash = shortHash(minCss);
  const jsHash  = shortHash(minJs);
  const cssFile = `style.${cssHash}.min.css`;
  const jsFile  = `app.${jsHash}.min.js`;

  // 6. dist/ を作成
  fs.mkdirSync(DIST, { recursive: true });
  fs.writeFileSync(path.join(DIST, cssFile), minCss, 'utf8');
  fs.writeFileSync(path.join(DIST, jsFile),  minJs,  'utf8');
  console.log(`  → dist/${cssFile}`);
  console.log(`  → dist/${jsFile}`);

  // 7. index.html 生成（<style> → <link>, <script> → <script defer src>）
  const optimizedHtml = html
    // <style> ブロックを外部 CSS 参照に置換（preload + stylesheet）
    .replace(
      /<style>[\s\S]*?<\/style>/,
      [
        `<link rel="preload" href="${cssFile}" as="style" onload="this.onload=null;this.rel='stylesheet'">`,
        `<noscript><link rel="stylesheet" href="${cssFile}"></noscript>`,
        // 初期表示に必要な最小限の critical CSS をインライン
        `<style>`,
        `/* critical: initial render */`,
        `:root{--bg:#0a0e13;--sidebar-bg:#080b10;--text:#c9d1d9;--cream:#e8e0d0;--teal:#4dd0c4;--border:#1e2530}`,
        `*,::before,::after{box-sizing:border-box;margin:0;padding:0}`,
        `body{background:var(--bg);color:var(--text);font-family:system-ui,-apple-system,sans-serif;height:100vh;overflow:hidden}`,
        `#app{display:flex;height:100vh}`,
        `#sidebar{width:200px;background:var(--sidebar-bg);border-right:1px solid var(--border);flex-shrink:0}`,
        `#main{flex:1;display:flex;flex-direction:column;overflow:hidden}`,
        `#topbar{height:48px;background:var(--sidebar-bg);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 16px;flex-shrink:0}`,
        `#content{flex:1;overflow-y:auto;padding:20px}`,
        `#topbar-title{font-size:15px;font-weight:600;color:var(--cream)}`,
        `.page{display:none}.page.visible{display:block}`,
        `</style>`,
      ].join('\n')
    )
    // <script> ブロックを defer 付き外部参照に置換
    .replace(
      /<script>[\s\S]*?<\/script>(\s*<\/body>)/,
      `<script defer src="${jsFile}"></script>$1`
    );

  fs.writeFileSync(path.join(DIST, 'index.html'), optimizedHtml, 'utf8');

  // 8. サマリー
  const origSize  = html.length;
  const distHtml  = optimizedHtml.length;
  const distTotal = distHtml + minCss.length + minJs.length;

  console.log('\n✅ ビルド完了');
  console.log(`   元サイズ:     ${Math.round(origSize/1024)}KB (1 ファイル)`);
  console.log(`   最適化後:     ${Math.round(distTotal/1024)}KB (3 ファイル)`);
  console.log(`     index.html: ${Math.round(distHtml/1024)}KB`);
  console.log(`     ${cssFile}: ${Math.round(minCss.length/1024)}KB`);
  console.log(`     ${jsFile}:  ${Math.round(minJs.length/1024)}KB`);
  console.log(`   削減率:       ${Math.round((1 - distTotal/origSize)*100)}%`);

  // 9. ファイル名マップを書き出す（vercel.json のキャッシュ設定用）
  fs.writeFileSync(
    path.join(DIST, 'asset-manifest.json'),
    JSON.stringify({ cssFile, jsFile, built: new Date().toISOString() }, null, 2)
  );
}

build().catch(e => { console.error('❌ ビルドエラー:', e); process.exit(1); });
