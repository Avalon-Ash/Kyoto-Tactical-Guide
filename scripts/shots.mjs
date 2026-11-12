/**
 * @file scripts/shots.mjs
 * 蒔繪浮雕盤截圖矩陣腳本 (P0-A2)
 *
 * 16 組矩陣：
 *   視窗: 1440x900, 375x812
 *   主題: 暖日 (day), 月光 (night)
 *   語系: zh (zh-Hant), ja (ja)
 *   動態: 一般 (motion), 減少動態 (reduced)
 *
 * 每組拍攝 2 張（全景 full、停留 dwell），共 32 張。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * 產生 16 組截圖矩陣與對應的 32 張檔名。
 * @param {string | { out?: string, outDir?: string }} [options]
 * @returns {Array<{
 *   width: number,
 *   height: number,
 *   theme: 'day' | 'night',
 *   lang: 'zh' | 'ja',
 *   motion: 'motion' | 'reduced',
 *   baseName: string,
 *   fullFile: string,
 *   dwellFile: string,
 *   files: string[],
 *   shots: Array<{ kind: 'full' | 'dwell', file: string }>
 * }>}
 */
export function matrix(options = {}) {
  const outDir = typeof options === 'string'
    ? options
    : (options?.out ?? options?.outDir ?? '.shots');

  const viewports = [
    { width: 1440, height: 900 },
    { width: 375, height: 812 },
  ];
  const themes = ['day', 'night'];
  const langs = ['zh', 'ja'];
  const motions = ['motion', 'reduced'];

  const groups = [];
  for (const vp of viewports) {
    for (const theme of themes) {
      for (const lang of langs) {
        for (const motion of motions) {
          const baseName = `${vp.width}x${vp.height}-${theme}-${lang}-${motion}`;
          const fullFile = path.posix.join(outDir, `${baseName}-full.png`);
          const dwellFile = path.posix.join(outDir, `${baseName}-dwell.png`);
          groups.push({
            width: vp.width,
            height: vp.height,
            theme,
            lang,
            motion,
            baseName,
            fullFile,
            dwellFile,
            files: [fullFile, dwellFile],
            shots: [
              { kind: 'full', file: fullFile },
              { kind: 'dwell', file: dwellFile },
            ],
          });
        }
      }
    }
  }

  Object.defineProperty(groups, 'allFiles', {
    get() {
      return this.flatMap((g) => g.files);
    },
  });
  Object.defineProperty(groups, 'allShots', {
    get() {
      return this.flatMap((g) => g.shots);
    },
  });

  return groups;
}

/**
 * 取得全部 32 張檔名清單。
 * @param {string | { out?: string, outDir?: string }} [options]
 * @returns {string[]}
 */
export function allFilenames(options = {}) {
  return matrix(options).flatMap((g) => g.files);
}

/**
 * 解析命令列參數
 * @param {string[]} args
 * @returns {{ only: string | null, outDir: string }}
 */
export function parseArgs(args) {
  let only = null;
  let outDir = '.shots';
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--only' && i + 1 < args.length) {
      only = args[++i];
    } else if (arg.startsWith('--only=')) {
      only = arg.slice('--only='.length);
    } else if (arg === '--out' && i + 1 < args.length) {
      outDir = args[++i];
    } else if (arg.startsWith('--out=')) {
      outDir = arg.slice('--out='.length);
    }
  }
  return { only, outDir };
}

/**
 * 執行單組截圖
 */
async function runGroup(browser, group, baseUrl, only, generatedFiles) {
  const context = await browser.newContext({
    viewport: { width: group.width, height: group.height },
    reducedMotion: group.motion === 'reduced' ? 'reduce' : 'no-preference',
  });
  const page = await context.newPage();

  try {
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.kyoto-app', { timeout: 15000 });

    // 主題設定：App.tsx 預設 preferences.night = true ('dark')
    // 暖日 (day) 需要 'light'；月光 (night) 保持 'dark'
    const targetTheme = group.theme === 'day' ? 'light' : 'dark';
    const currentTheme = await page.evaluate(() => document.documentElement.dataset.theme);
    if (currentTheme !== targetTheme) {
      const themeBtn = page.locator('.bunko-tools > button').first();
      await themeBtn.waitFor({ state: 'visible', timeout: 5000 });
      await themeBtn.click();
      await page.waitForFunction(
        (expected) => document.documentElement.dataset.theme === expected,
        targetTheme,
        { timeout: 5000 }
      );
    }

    // 語系設定：App.tsx 預設 engine.lang = 'zh' ('zh-Hant')
    // ja 需要 'ja'；zh 保持 'zh-Hant'
    const targetLang = group.lang === 'zh' ? 'zh-Hant' : 'ja';
    const currentLang = await page.evaluate(() => document.documentElement.lang);
    if (currentLang !== targetLang) {
      const langBtn = page.locator('.bunko-tools > button').nth(2);
      await langBtn.waitFor({ state: 'visible', timeout: 5000 });
      await langBtn.click();
      await page.waitForFunction(
        (expected) => document.documentElement.lang === expected,
        targetLang,
        { timeout: 5000 }
      );
    }

    // 等待 #scene 的 data-renderer="webgl"
    const scene = page.locator('#scene');
    await scene.waitFor({ state: 'attached', timeout: 15000 });
    await page.waitForFunction(() => {
      const el = document.querySelector('#scene');
      if (!el) return false;
      const renderer = el.getAttribute('data-renderer');
      if (renderer === 'failed') {
        throw new Error('Canvas #scene 渲染器初始化失敗 (data-renderer="failed")');
      }
      return renderer === 'webgl';
    }, { timeout: 20000 });

    // 再等 1.5 秒拍「全景」
    await page.waitForTimeout(1500);

    const shouldTakeFull = !only || group.fullFile.includes(only);
    if (shouldTakeFull) {
      fs.mkdirSync(path.dirname(group.fullFile), { recursive: true });
      await page.screenshot({ path: group.fullFile, fullPage: false });
      generatedFiles.push(group.fullFile);
      console.log(`  [OK] 全景: ${group.fullFile}`);
    }

    // 把滑鼠移到 #scene 中央停 6 秒拍「停留」
    const shouldTakeDwell = !only || group.dwellFile.includes(only);
    if (shouldTakeDwell) {
      const box = await scene.boundingBox();
      if (!box) {
        throw new Error(`找不到 #scene 的邊界 (${group.baseName})`);
      }
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;
      await page.mouse.move(centerX, centerY);

      // 停 6 秒
      await page.waitForTimeout(6000);

      fs.mkdirSync(path.dirname(group.dwellFile), { recursive: true });
      await page.screenshot({ path: group.dwellFile, fullPage: false });
      generatedFiles.push(group.dwellFile);
      console.log(`  [OK] 停留: ${group.dwellFile}`);
    }
  } finally {
    try {
      await page.close();
    } catch (closeErr) {
      console.error(`[WARN] 關閉分頁失敗 (${group.baseName}):`, closeErr);
    }
    try {
      await context.close();
    } catch (closeErr) {
      console.error(`[WARN] 關閉情境失敗 (${group.baseName}):`, closeErr);
    }
  }
}

/**
 * 主執行流程
 */
export async function main() {
  const { only, outDir } = parseArgs(process.argv.slice(2));

  // 1. 嘗試載入 playwright（已確認未安裝時 exit 2）
  let playwright;
  try {
    playwright = await import('playwright');
  } catch (err) {
    console.error(
      '【未安裝 Playwright】\n' +
      '本專案未預裝 Playwright。如需執行截圖矩陣，請先手動安裝：\n' +
      '  npm i -D playwright\n' +
      '  npx playwright install chromium\n' +
      '並在獨立終端機先啟動開發伺服器：\n' +
      '  npm run dev -- --host 127.0.0.1 --strictPort\n\n' +
      `錯誤細節: ${err instanceof Error ? err.message : String(err)}`
    );
    process.exitCode = 2;
    process.exit(2);
  }

  const { chromium } = playwright;
  if (!chromium) {
    console.error('Playwright 中找不到 chromium 模組。');
    process.exitCode = 2;
    process.exit(2);
  }

  // 2. 檢查目標伺服器連線（連不上時 exit 3）
  const baseUrl = process.env.SHOTS_BASE || 'http://127.0.0.1:3000/';
  try {
    const res = await fetch(baseUrl);
    if (!res.ok && res.status >= 500) {
      throw new Error(`目標伺服器回應異常狀態碼: ${res.status}`);
    }
  } catch (err) {
    console.error(
      `【目標伺服器連線失敗】\n` +
      `無法連線至目標伺服器：${baseUrl}\n` +
      '請確認伺服器已先啟動：\n' +
      '  npm run dev -- --host 127.0.0.1 --strictPort\n' +
      '若伺服器使用不同連接埠，可透過環境變數 SHOTS_BASE 指定網址。\n\n' +
      `連線錯誤: ${err instanceof Error ? err.message : String(err)}`
    );
    process.exitCode = 3;
    process.exit(3);
  }

  // 3. 確保輸出目錄存在
  fs.mkdirSync(outDir, { recursive: true });

  // 4. 啟動無頭 Chromium，必須加 swiftshader 參數避免 fps 掉至 1
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });

  const allGroups = matrix(outDir);
  const targetGroups = only
    ? allGroups.filter((g) => g.files.some((f) => f.includes(only)))
    : allGroups;

  if (targetGroups.length === 0) {
    console.warn(`[WARN] 找不到符合 --only "${only}" 的組合。`);
    try {
      await browser.close();
    } catch (closeErr) {
      console.error('關閉瀏覽器失敗:', closeErr);
    }
    return;
  }

  const generatedFiles = [];

  try {
    for (const group of targetGroups) {
      console.log(`\n▶ 執行組合: ${group.baseName}`);
      await runGroup(browser, group, baseUrl, only, generatedFiles);
    }
  } catch (err) {
    console.error(`\n[FAIL] 矩陣執行中斷:`, err);
    try {
      await browser.close();
    } catch (closeErr) {
      console.error('關閉瀏覽器失敗:', closeErr);
    }
    process.exit(1);
  }

  try {
    await browser.close();
  } catch (closeErr) {
    console.error('關閉瀏覽器失敗:', closeErr);
  }

  // 5. 結束時列出產生的檔名與每張大小
  console.log('\n================ 截圖成果清單 ================');
  for (const file of generatedFiles) {
    try {
      const stat = fs.statSync(file);
      console.log(`${file} (${stat.size} bytes)`);
    } catch (statErr) {
      console.error(`無法取得檔案大小: ${file}`, statErr);
    }
  }
  console.log(`================ 共計 ${generatedFiles.length} 張截圖 ================\n`);
}

const isDirectRun = Boolean(
  process.argv[1] &&
  fileURLToPath(import.meta.url).toLowerCase() === path.resolve(process.argv[1]).toLowerCase()
);

if (isDirectRun) {
  main().catch((err) => {
    console.error('執行遇到未捕捉的例外:', err);
    process.exit(1);
  });
}
