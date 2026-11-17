Pod::Spec.new do |s|
 s.name = 'JianzhangWidget'
 s.version = '1.0.0'
 s.summary = 'Private local bookkeeping widget bridge'
 s.description = 'Shares an opt-in amount summary with the WidgetKit extension.'
 s.license = { :type => 'MIT' }
 s.author = 'Jianzhang'
 s.homepage = 'https://github.com/ygj0925/react-native-shadcn-ui'
 s.platforms = { :ios => '15.1' }
 s.source = { :git => 'https://github.com/ygj0925/react-native-shadcn-ui.git' }
 s.static_framework = true
 s.dependency 'ExpoModulesCore'
 s.source_files = 'Module/**/*.{h,m,mm,swift}'
 s.swift_version = '5.0'
end
