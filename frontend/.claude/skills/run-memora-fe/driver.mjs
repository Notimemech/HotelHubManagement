#!/usr/bin/env node
// headless-chrome driver for memora-fe
// Zero deps. Uses the chrome.exe already on the box.
// Usage:
//   node driver.mjs ss <url> [out.png]                 -- screenshot a page
//   node driver.mjs dom <url> [out.html]               -- dump rendered DOM (stdout)
//   node driver.mjs health [baseUrl]                   -- GET /, /login, /register
//
// Examples:
//   node driver.mjs health http://localhost:9999
//   node driver.mjs ss http://localhost:9999/login login.png
//   node driver.mjs dom http://localhost:9999/projects/user

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import http from 'node:http';

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PROFILE = resolve(process.cwd(), '.claude', 'skills', '.chrome-profile');

function chrome(args) {
  if (!existsSync(CHROME)) {
    console.error(`chrome not found at ${CHROME}`);
    process.exit(2);
  }
  execFileSync(CHROME, args, { stdio: ['ignore', 'pipe', 'pipe'] });
}

async function main() {
  const [op, ...rest] = process.argv.slice(2);
  if (op === 'ss') {
    const [url, out = 'shot.png'] = rest;
    if (!url) die('ss needs <url> [out.png]');
    chrome([
      '--headless=new', '--disable-gpu', '--no-sandbox',
      '--hide-scrollbars', '--window-size=1280,800',
      `--user-data-dir=${PROFILE}`,
      `--screenshot=${resolve(process.cwd(), out)}`,
      url,
    ]);
    console.log(out);
    return;
  }
  if (op === 'dom') {
    const [url] = rest;
    if (!url) die('dom needs <url>');
    chrome([
      '--headless=new', '--disable-gpu', '--no-sandbox',
      `--user-data-dir=${PROFILE}`,
      `--dump-dom`, url,
    ]);
    return;
  }
  if (op === 'health') {
    const base = rest[0] ?? 'http://localhost:9999';
    const paths = ['/', '/login', '/register'];
    let bad = 0;
    for (const p of paths) {
      const code = await get(base + p);
      console.log(`${code}  ${base}${p}`);
      if (code !== 200) bad++;
    }
    process.exit(bad ? 1 : 0);
  }
  die(`unknown op: ${op}. Use: ss | dom | health`);
}

function get(url) {
  return new Promise((res) => {
    http.get(url, (r) => { r.resume(); res(r.statusCode ?? 0); })
       .on('error', () => res(0));
  });
}

function die(msg) { console.error(msg); process.exit(2); }

main();