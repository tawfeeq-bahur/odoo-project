/**
 * Patch for expo-asset getManifestBaseUrl to fix:
 * "TypeError: Cannot assign to property 'protocol' which has only a getter"
 *
 * React Native 0.81+ Hermes engine has URL.protocol as read-only.
 * This patch rewrites the function to use string concatenation instead.
 *
 * Run: node patch-expo-asset.js
 * Or add to package.json scripts: "postinstall": "node patch-expo-asset.js"
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(
  __dirname,
  'node_modules',
  'expo-asset',
  'build',
  'AssetUris.js'
);

if (!fs.existsSync(filePath)) {
  console.log('expo-asset not found, skipping patch.');
  process.exit(0);
}

let content = fs.readFileSync(filePath, 'utf8');

// Check if already patched
if (content.includes('string concatenation to avoid read-only')) {
  console.log('expo-asset already patched.');
  process.exit(0);
}

const oldCode = `export function getManifestBaseUrl(manifestUrl) {
    const urlObject = new URL(manifestUrl);
    let nextProtocol = urlObject.protocol;
    // Change the scheme to http(s) if it is exp(s)
    if (nextProtocol === 'exp:') {
        nextProtocol = 'http:';
    }
    else if (nextProtocol === 'exps:') {
        nextProtocol = 'https:';
    }
    urlObject.protocol = nextProtocol;
    // Trim filename, query parameters, and fragment, if any
    const directory = urlObject.pathname.substring(0, urlObject.pathname.lastIndexOf('/') + 1);
    urlObject.pathname = directory;
    urlObject.search = '';
    urlObject.hash = '';
    // The URL spec doesn't allow for changing the protocol to \`http\` or \`https\`
    // without a port set so instead, we'll just swap the protocol manually.
    return urlObject.protocol !== nextProtocol
        ? urlObject.href.replace(urlObject.protocol, nextProtocol)
        : urlObject.href;
}`;

const newCode = `export function getManifestBaseUrl(manifestUrl) {
    const urlObject = new URL(manifestUrl);
    let nextProtocol = urlObject.protocol;
    // Change the scheme to http(s) if it is exp(s)
    if (nextProtocol === 'exp:') {
        nextProtocol = 'http:';
    }
    else if (nextProtocol === 'exps:') {
        nextProtocol = 'https:';
    }
    // Trim filename, query parameters, and fragment, if any
    const directory = urlObject.pathname.substring(0, urlObject.pathname.lastIndexOf('/') + 1);
    // Build URL via string concatenation to avoid read-only URL property setters (Hermes)
    return nextProtocol + '//' + urlObject.host + directory;
}`;

if (content.includes('urlObject.protocol = nextProtocol')) {
  content = content.replace(oldCode, newCode);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully patched expo-asset AssetUris.js');
} else {
  console.log('Could not find expected code pattern. File may have changed.');
}
