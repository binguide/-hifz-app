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
    console.log('No CT import (skipping): ' + filePath);
    return;
  }

  // Find the complete import statement line
  var lineStart = c.lastIndexOf('\n', idx) + 1;
  var lineEnd = c.indexOf('\n', idx);
  if (lineEnd === -1) lineEnd = c.length;
  var line = c.substring(lineStart, lineEnd);

  // Parse the import: extract everything destructured besides "CodegenTypes as CT"
  var match = line.match(/import\s+type\s+\{\s*([^}]+)\}\s+from\s+['"]react-native['"];?/);
  if (!match) {
    console.log('Cannot parse import in: ' + filePath);
    return;
  }

  var destructured = match[1].split(',').map(function (s) { return s.trim(); }).filter(function (s) { return s; });
  var otherImports = destructured.filter(function (s) { return s.indexOf('CodegenTypes as CT') === -1; });
  var hasViewProps = otherImports.some(function (s) { return s.indexOf('ViewProps') !== -1; });

  // Build the two replacement imports
  var ctImport = "import type { WithDefault, Int32, Float, DirectEventHandler } from 'react-native/Libraries/Types/CodegenTypes';";
  var reactNativeImport = otherImports.length > 0 ? "import type { " + otherImports.join(', ') + " } from 'react-native';" : '';

  // Replace the import line
  var newLines = ctImport + '\n' + (reactNativeImport ? reactNativeImport + '\n' : '');

  // For indentation, match the original
  var indent = line.match(/^\s*/)[0];
  newLines = newLines.split('\n').map(function (l) { return l ? indent + l : l; }).join('\n');

  c = c.substring(0, lineStart) + newLines + c.substring(lineEnd + 1);

  // Replace CT.XXX with XXX
  c = c.replace(/CT\./g, '');

  // Also replace 'react-native' import for codegenNativeComponent if it exists
  // No need, codegenNativeComponent is from 'react-native' and that import is separate

  fs.writeFileSync(filePath, c);
  console.log('Patched: ' + filePath);
}

patchSqlite();
patchScreens();
