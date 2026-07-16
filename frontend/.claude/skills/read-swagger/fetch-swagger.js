/* eslint-disable @typescript-eslint/no-require-imports */
const http = require("http");
const https = require("https");

const targetUrl = process.argv[2];
if (!targetUrl) {
  console.error("Usage: node fetch-swagger.js <url>");
  process.exit(1);
}

function fetchUrl(urlStr) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlStr);
    const client = url.protocol === "https:" ? https : http;
    client
      .get(url, (res) => {
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          // Handle redirect
          const redirectUrl = new URL(res.headers.location, urlStr).toString();
          fetchUrl(redirectUrl).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`Status code: ${res.statusCode}`));
          return;
        }
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}

async function main() {
  try {
    // Try fetching the URL
    console.warn(`Fetching: ${targetUrl}`);
    let content = await fetchUrl(targetUrl);

    // Check if it's JSON
    try {
      const parsed = JSON.parse(content);
      console.log(JSON.stringify(parsed, null, 2));
      return;
    } catch (e) {
      // Not JSON, probably HTML or JS
    }

    // Check if it's the swagger-ui-init.js content
    if (content.includes("swaggerDoc") || content.includes("spec1")) {
      const swaggerDoc = extractSwaggerDoc(content);
      if (swaggerDoc) {
        console.log(JSON.stringify(swaggerDoc, null, 2));
        return;
      }
    }

    // It's probably HTML. Look for swagger-ui-init.js
    // Let's find script tags or references
    const initJsRegex = /src=["']\.\/(swagger-ui-init\.js)["']/i;
    const match =
      content.match(initJsRegex) ||
      content.match(/src=["'](swagger-ui-init\.js)["']/i);
    if (match) {
      const base = targetUrl.endsWith("/") ? targetUrl : targetUrl + "/";
      const initJsUrl = new URL(match[1], base).toString();
      console.warn(`Found script reference. Fetching: ${initJsUrl}`);
      const jsContent = await fetchUrl(initJsUrl);
      const swaggerDoc = extractSwaggerDoc(jsContent);
      if (swaggerDoc) {
        console.log(JSON.stringify(swaggerDoc, null, 2));
        return;
      }
    }

    // Try typical swagger JSON endpoints relative to the provided URL
    const commonPaths = [
      "swagger-json",
      "swagger/v1/swagger.json",
      "swagger.json",
      "api-docs",
      "api/docs",
    ];
    const base = targetUrl.endsWith("/") ? targetUrl : targetUrl + "/";
    for (const path of commonPaths) {
      const testUrl = new URL(path, base).toString();
      try {
        console.warn(`Trying fallback: ${testUrl}`);
        const testContent = await fetchUrl(testUrl);
        const parsed = JSON.parse(testContent);
        console.log(JSON.stringify(parsed, null, 2));
        return;
      } catch (e) {
        // Continue
      }
    }

    throw new Error(
      "Could not find Swagger spec JSON in the page or at common paths.",
    );
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

function extractSwaggerDoc(jsContent) {
  // Extract "swaggerDoc": { ... } from the JS file
  const marker = '"swaggerDoc":';
  const index = jsContent.indexOf(marker);
  if (index === -1) return null;

  let braceCount = 0;
  let jsonStart = -1;
  let jsonEnd = -1;

  for (let i = index + marker.length; i < jsContent.length; i++) {
    if (jsContent[i] === "{") {
      if (braceCount === 0) {
        jsonStart = i;
      }
      braceCount++;
    } else if (jsContent[i] === "}") {
      braceCount--;
      if (braceCount === 0) {
        jsonEnd = i + 1;
        break;
      }
    }
  }

  if (jsonStart !== -1 && jsonEnd !== -1) {
    const jsonStr = jsContent.substring(jsonStart, jsonEnd);
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      console.warn("Failed to parse extracted JSON, cleaning up...");
      // Simple cleanup for trailing commas if any
      const cleaned = jsonStr
        .replace(/,\s*([\]}])/g, "$1") // remove trailing commas
        .replace(/`([^`]*)`/g, '"$1"'); // replace backticks
      try {
        return JSON.parse(cleaned);
      } catch (e2) {
        console.error("Cleanup failed:", e2.message);
      }
    }
  }
  return null;
}

main();
