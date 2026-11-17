const fs = require('node:fs'),
  path = require('node:path'),
  Module = require('node:module'),
  ts = require('typescript');
const cache = new Map();
module.exports = function load(name, overrides = {}) {
  let file = path.resolve(__dirname, '../features/bookkeeping', name + '.ts');
  if(!fs.existsSync(file))file=path.resolve(__dirname,'../features/bookkeeping',name+'.tsx');
  if (!Object.keys(overrides).length && cache.has(file)) return cache.get(file);
  const mod = new Module(file, module);
  mod.filename = file;
  mod.paths = module.paths;
  mod.require = (id) =>
    overrides[id] ?? (id.startsWith('./') ? module.exports(id.slice(2), overrides) : require(id));
  mod._compile(
    ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    fileName:file,
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX },
    }).outputText,
    file
  );
  if (!Object.keys(overrides).length) cache.set(file, mod.exports);
  return mod.exports;
};
