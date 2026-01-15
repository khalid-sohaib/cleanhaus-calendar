#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const webFiles = ["dist/web/index.js", "dist/web/index.mjs"];

webFiles.forEach((file) => {
  const filePath = path.join(__dirname, "..", file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, "utf8");
    // Replace react-native imports with react-native-web
    content = content.replace(
      /from\s+["']react-native["']/g,
      "from 'react-native-web'"
    );
    content = content.replace(
      /require\(["']react-native["']\)/g,
      "require('react-native-web')"
    );
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✓ Replaced react-native imports in ${file}`);
  }
});
