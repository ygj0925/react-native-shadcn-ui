const fs = require('fs');
const path = require('path');

let iconMap = null;

function buildIconMap() {
  if (iconMap) return iconMap;
  iconMap = new Map();
  const barrelPath = path.resolve(
    __dirname,
    'node_modules/lucide-react-native/dist/esm/lucide-react-native.js',
  );
  const content = fs.readFileSync(barrelPath, 'utf8');
  const re = /export\s*\{([^}]+)\}\s*from\s*'([^']+)'/g;
  let match;
  while ((match = re.exec(content)) !== null) {
    const names = match[1].split(',').map((s) => s.trim());
    const fromPath = match[2];
    for (const entry of names) {
      const parts = entry.split(/\s+as\s+/);
      const exportedName = (parts[1] || parts[0]).trim();
      if (/^[A-Z]/.test(exportedName)) {
        iconMap.set(exportedName, fromPath);
      }
    }
  }
  return iconMap;
}

function lucideDeepImports({ types: t }) {
  return {
    name: 'lucide-react-native-deep-imports',
    visitor: {
      ImportDeclaration(nodePath) {
        if (nodePath.node.source.value !== 'lucide-react-native') return;
        if (nodePath.node.importKind === 'type') return;
        const specifiers = nodePath.node.specifiers;
        if (specifiers.length === 0) return;

        const map = buildIconMap();
        const newDecls = [];
        const keep = [];

        for (const spec of specifiers) {
          if (spec.importKind === 'type') {
            keep.push(spec);
            continue;
          }
          if (
            spec.type === 'ImportSpecifier' &&
            spec.imported.type === 'Identifier' &&
            /^[A-Z]/.test(spec.imported.name)
          ) {
            const iconPath = map.get(spec.imported.name);
            if (iconPath) {
              newDecls.push(
                t.importDeclaration(
                  [t.importDefaultSpecifier(t.identifier(spec.local.name))],
                  t.stringLiteral(`lucide-react-native/dist/esm/${iconPath.replace(/^\.\//, '')}`),
                ),
              );
            } else {
              keep.push(spec);
            }
          } else {
            keep.push(spec);
          }
        }

        if (newDecls.length === 0) return;

        if (keep.length > 0) {
          nodePath.replaceWithMultiple([
            t.importDeclaration(keep, t.stringLiteral('lucide-react-native')),
            ...newDecls,
          ]);
        } else {
          nodePath.replaceWithMultiple(newDecls);
        }
      },
    },
  };
}

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
    plugins: [lucideDeepImports],
  };
};
