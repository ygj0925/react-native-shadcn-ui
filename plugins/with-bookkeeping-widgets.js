const fs = require('fs'),
  path = require('path');
const {
  withInfoPlist,
  withEntitlementsPlist,
  withXcodeProject,
  withDangerousMod,
  withGradleProperties,
} = require('expo/config-plugins');
module.exports = function withBookkeepingWidgets(config) {
  config = withGradleProperties(config, (c) => {
    c.modResults = c.modResults.filter((item) => item.key !== 'AsyncStorage_db_size_in_MB');
    c.modResults.push({ type: 'property', key: 'AsyncStorage_db_size_in_MB', value: '50' });
    return c;
  });
  const identifier = config.ios?.bundleIdentifier;
  if (!identifier) throw new Error('简账小组件需要ios.bundleIdentifier');
  const group = `group.${identifier}.jianzhang`,
    name = 'JianzhangWidget';
  config.extra ??= {};
  config.extra.eas ??= {};
  config.extra.eas.build ??= {};
  config.extra.eas.build.experimental ??= {};
  config.extra.eas.build.experimental.ios ??= {};
  const extensions = config.extra.eas.build.experimental.ios.appExtensions ?? [];
  config.extra.eas.build.experimental.ios.appExtensions = [
    ...extensions.filter((item) => item.targetName !== name),
    {
      targetName: name,
      bundleIdentifier: `${identifier}.${name}`,
      entitlements: { 'com.apple.security.application-groups': [group] },
    },
  ];
  config = withInfoPlist(config, (c) => {
    c.modResults.JianzhangAppGroup = group;
    return c;
  });
  config = withEntitlementsPlist(config, (c) => {
    c.modResults['com.apple.security.application-groups'] = [
      ...new Set([...(c.modResults['com.apple.security.application-groups'] ?? []), group]),
    ];
    return c;
  });
  config = withDangerousMod(config, [
    'ios',
    async (c) => {
      const folder = path.join(c.modRequest.platformProjectRoot, name);
      fs.mkdirSync(folder, { recursive: true });
      fs.copyFileSync(
        path.join(
          c.modRequest.projectRoot,
          'modules/jianzhang-widget/ios/Widget/JianzhangWidget.swift'
        ),
        path.join(folder, 'JianzhangWidget.swift')
      );
      const plist = require('@expo/plist').default;
      fs.writeFileSync(
        path.join(folder, 'Info.plist'),
        plist.build({
          CFBundleDisplayName: '简账',
          CFBundleIdentifier: '$(PRODUCT_BUNDLE_IDENTIFIER)',
          CFBundleName: '$(PRODUCT_NAME)',
          CFBundleExecutable: '$(EXECUTABLE_NAME)',
          CFBundlePackageType: 'XPC!',
          CFBundleShortVersionString: config.version ?? '1.0.0',
          CFBundleVersion: String(config.ios?.buildNumber ?? '1'),
          JianzhangAppGroup: group,
          NSExtension: { NSExtensionPointIdentifier: 'com.apple.widgetkit-extension' },
        })
      );
      fs.writeFileSync(
        path.join(folder, `${name}.entitlements`),
        plist.build({ 'com.apple.security.application-groups': [group] })
      );
      return c;
    },
  ]);
  return withXcodeProject(config, (c) => {
    const project = c.modResults;
    const existing = Object.values(project.pbxNativeTargetSection()).some(
      (t) => typeof t === 'object' && String(t.name).replaceAll('"', '') === name
    );
    if (existing) return c;
    const target = project.addTarget(name, 'app_extension', name, `${identifier}.${name}`);
    project.addBuildPhase(
      [`${name}/JianzhangWidget.swift`],
      'PBXSourcesBuildPhase',
      'Sources',
      target.uuid
    );
    const objects = project.hash.project.objects,
      list = objects.XCConfigurationList[target.pbxNativeTarget.buildConfigurationList];
    for (const reference of list.buildConfigurations) {
      Object.assign(objects.XCBuildConfiguration[reference.value].buildSettings, {
        SWIFT_VERSION: '5.0',
        IPHONEOS_DEPLOYMENT_TARGET: '17.0',
        APPLICATION_EXTENSION_API_ONLY: 'YES',
        INFOPLIST_FILE: `${name}/Info.plist`,
        CODE_SIGN_ENTITLEMENTS: `${name}/${name}.entitlements`,
        TARGETED_DEVICE_FAMILY: '"1,2"',
        SKIP_INSTALL: 'YES',
        GENERATE_INFOPLIST_FILE: 'NO',
      });
    }
    return c;
  });
};
