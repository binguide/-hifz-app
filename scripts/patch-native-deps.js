var fs = require('fs');
var path = require('path');

function patchSqlite() {
  var files = [
    'node_modules/react-native-sqlite-storage/platforms/android/build.gradle',
    'node_modules/react-native-sqlite-storage/platforms/android-native/build.gradle'
  ];
  files.forEach(function (f) {
    if (fs.existsSync(f)) {
      var c = fs.readFileSync(f, 'utf8');
      c = c.replace(/jcenter\(\)/g, 'mavenCentral()');
      c = c.replace(/classpath 'com\.android\.tools\.build:gradle:3\.1\.4'\n/g, '');
      fs.writeFileSync(f, c);
      console.log('Patched: ' + f);
    }
  });
}

function patchScreens() {
  var fabricDir = 'node_modules/react-native-screens/src/fabric';
  if (!fs.existsSync(fabricDir)) {
    console.log('react-native-screens fabric dir not found, skipping');
    return;
  }
  var walk = function (dir) {
    var entries = fs.readdirSync(dir, { withFileTypes: true });
    entries.forEach(function (entry) {
      var full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (/\.tsx?$/.test(entry.name)) {
        patchFabricFile(full);
      }
    });
  };
  walk(fabricDir);
}

function patchFabricFile(filePath) {
  var c = fs.readFileSync(filePath, 'utf8');
  var idx = c.indexOf('CodegenTypes as CT');
  if (idx === -1) {
    return;
  }

  // Find the start of the import statement
  // Go back from idx to find the 'import' keyword
  var lineStart = c.lastIndexOf('import', idx);
  if (lineStart === -1 || c.substring(lineStart, lineStart + 6) !== 'import') {
    console.log('Cannot find import start in: ' + filePath);
    return;
  }

  // Find the end of the import (semicolon)
  var lineEnd = c.indexOf(';', lineStart);
  if (lineEnd === -1) {
    console.log('Cannot find semicolon in: ' + filePath);
    return;
  }
  lineEnd += 1; // include semicolon

  var importStatement = c.substring(lineStart, lineEnd);

  // Now parse the import statement
  // It is in the form: import type { ... } from 'react-native';
  // Extract the content between { and }
  var braceStart = importStatement.indexOf('{');
  var braceEnd = importStatement.indexOf('}');
  if (braceStart === -1 || braceEnd === -1) {
    console.log('Cannot parse braces in: ' + filePath);
    return;
  }

  var destructured = importStatement.substring(braceStart + 1, braceEnd);
  var items = destructured.split(',').map(function (s) { return s.trim(); }).filter(function (s) { return s; });

  // Split into CT-related and other imports
  var ctItems = [];
  var otherItems = [];
  items.forEach(function (item) {
    if (item.indexOf('CodegenTypes as CT') !== -1) {
      // This is the namespace import - the CT types are all accounted for
      ctItems.push('WithDefault', 'Int32', 'Float', 'DirectEventHandler');
    } else {
      otherItems.push(item);
    }
  });

  // Deduplicate ctItems
  ctItems = ctItems.filter(function (v, i, a) { return a.indexOf(v) === i; });

  // Build the replacement
  var indent = importStatement.match(/^\s*/m)[0];
  var newLines = '';
  newLines += indent + "import type { " + ctItems.join(', ') + " } from 'react-native/Libraries/Types/CodegenTypes';\n";
  if (otherItems.length > 0) {
    newLines += indent + "import type { " + otherItems.join(', ') + " } from 'react-native';\n";
  }

  c = c.substring(0, lineStart) + newLines + c.substring(lineEnd);

  // Replace CT.XXX with XXX
  c = c.replace(/CT\./g, '');

  fs.writeFileSync(filePath, c);
  console.log('Patched: ' + filePath);
}

patchSqlite();
patchScreens();
