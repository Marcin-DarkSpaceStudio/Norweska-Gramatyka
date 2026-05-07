import { copyFile, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { minify } from 'terser';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(rootDir, 'src');
const kitEntry = path.join(srcDir, 'kit', 'index.kit');
const htmlOutput = path.join(rootDir, 'index.html');
const cssEntry = path.join(srcDir, 'styles', 'norweskagramatyka.css');
const cssOutput = path.join(rootDir, 'norweskagramatyka.css');
const jsEntry = path.join(srcDir, 'scripts', 'norweskagramatyka.js');
const jsOutput = path.join(rootDir, 'norweskagramatyka-min.js');
const jsMapOutput = path.join(rootDir, 'norweskagramatyka-min.js.map');

const kitImportPattern = String.raw`<!--\s*@import\s+["']([^"']+)["']\s*-->`;

async function fileExists(filePath) {
  try {
    await readFile(filePath);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') {
      return false;
    }

    throw error;
  }
}

async function resolveKitImport(fromFile, importPath) {
  const fromDir = path.dirname(fromFile);
  const directPath = path.resolve(fromDir, importPath);

  if (await fileExists(directPath)) {
    return directPath;
  }

  const parsed = path.parse(directPath);
  const partialPath = path.join(parsed.dir, `_${parsed.base}`);

  if (await fileExists(partialPath)) {
    return partialPath;
  }

  throw new Error(`Could not resolve Kit import "${importPath}" from ${path.relative(rootDir, fromFile)}`);
}

async function compileKit(filePath, stack = []) {
  if (stack.includes(filePath)) {
    const cycle = [...stack, filePath].map((file) => path.relative(rootDir, file)).join(' -> ');
    throw new Error(`Circular Kit import: ${cycle}`);
  }

  const source = await readFile(filePath, 'utf8');
  const nextStack = [...stack, filePath];
  const importPattern = new RegExp(kitImportPattern, 'g');
  let output = '';
  let lastIndex = 0;
  let match;

  while ((match = importPattern.exec(source)) !== null) {
    output += source.slice(lastIndex, match.index);

    const importedFile = await resolveKitImport(filePath, match[1]);
    output += await compileKit(importedFile, nextStack);

    lastIndex = importPattern.lastIndex;
  }

  output += source.slice(lastIndex);
  return output;
}

async function buildHtml() {
  const html = await compileKit(kitEntry);
  await writeFile(htmlOutput, html);
}

async function buildCss() {
  await copyFile(cssEntry, cssOutput);
}

async function buildJs() {
  const js = await readFile(jsEntry, 'utf8');
  const result = await minify(
    {
      [path.basename(jsEntry)]: js,
    },
    {
      compress: true,
      mangle: true,
      sourceMap: {
        filename: path.basename(jsOutput),
        url: path.basename(jsMapOutput),
      },
    },
  );

  if (!result.code) {
    throw new Error('Terser did not produce JavaScript output.');
  }

  await writeFile(jsOutput, result.code);

  if (result.map) {
    await writeFile(jsMapOutput, result.map);
  }
}

await buildHtml();
await buildCss();
await buildJs();

console.log('Built index.html, norweskagramatyka.css, and norweskagramatyka-min.js');
