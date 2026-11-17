const { test } = require('node:test'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path'),
  Module = require('node:module');
test('小组件插件注册AppGroup且Xcode目标只生成一次', () => {
  const file = path.resolve(__dirname, '../plugins/with-bookkeeping-widgets.js'),
    mod = new Module(file, module);
  mod.filename = file;
  mod.paths = module.paths;
  const callbacks = {};
  mod.require = (id) =>
    id === 'expo/config-plugins'
      ? Object.fromEntries(
          [
            'withInfoPlist',
            'withEntitlementsPlist',
            'withXcodeProject',
            'withDangerousMod',
            'withGradleProperties',
          ].map((key) => [
            key,
            (config, fn) => {
              callbacks[key] = fn;
              return config;
            },
          ])
        )
      : require(id);
  mod._compile(fs.readFileSync(file, 'utf8'), file);
  mod.exports({ ios: { bundleIdentifier: 'com.example.jianzhang' }, version: '1.0.0' });
  const plist = callbacks.withInfoPlist({ modResults: {} });
  assert.equal(plist.modResults.JianzhangAppGroup, 'group.com.example.jianzhang.jianzhang');
  const entitlements = callbacks.withEntitlementsPlist({
    modResults: { 'com.apple.security.application-groups': ['group.existing'] },
  });
  assert.deepEqual(entitlements.modResults['com.apple.security.application-groups'], [
    'group.existing',
    'group.com.example.jianzhang.jianzhang',
  ]);
  const targets = {},
    objects = {
      XCConfigurationList: {
        list: { buildConfigurations: [{ value: 'debug' }, { value: 'release' }] },
      },
      XCBuildConfiguration: { debug: { buildSettings: {} }, release: { buildSettings: {} } },
    };
  let count = 0;
  const project = {
    hash: { project: { objects } },
    pbxNativeTargetSection: () => targets,
    addTarget: (name, type, folder, id) => {
      count++;
      assert.equal(type, 'app_extension');
      assert.equal(id, 'com.example.jianzhang.JianzhangWidget');
      targets.widget = { name };
      return { uuid: 'widget', pbxNativeTarget: { buildConfigurationList: 'list' } };
    },
    addBuildPhase: (files, type) => {
      assert.equal(type, 'PBXSourcesBuildPhase');
      assert.equal(files[0], 'JianzhangWidget/JianzhangWidget.swift');
    },
  };
  callbacks.withXcodeProject({ modResults: project });
  callbacks.withXcodeProject({ modResults: project });
  assert.equal(count, 1);
  assert.equal(objects.XCBuildConfiguration.debug.buildSettings.IPHONEOS_DEPLOYMENT_TARGET, '17.0');
  const native = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, '../modules/jianzhang-widget/expo-module.config.json'),
      'utf8'
    )
  );
  assert.equal(native.android.modules[0], 'com.jianzhang.widget.JianzhangWidgetModule');
});
