import { Stack } from 'expo-router';
import { AuthScreenContainer } from '@/components/auth-screen-container';
import { ThemeToggle } from '@/components/themeToggle';
import { SignInForm } from '@/components/sign-in-form';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, StatusBar, Image } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const SCREEN_OPTIONS = {
  title: 'Login',  //标题
  headerShown: false,     // 不显示系统导航头，避免重复返回按钮
  // headerTitle: 'Login',                   // 自定义标题，可传字符串或组件
  // headerTitleAlign: 'left',             // 'left' | 'center'
  // headerTitleStyle: {},                    // 标题文字样式

  // === 导航头样式 ===
  // headerStyle: {},
  // headerTransparent: true,
  // headerBlurEffect: 'light',              // iOS 毛玻璃: 'light' | 'dark' | 'regular' 等
  headerShadowVisible: false,              // 底部阴影/分割线
  // headerTintColor: '#000',                // 返回按钮和标题颜色
  headerBackground: () =>
      <View className="pt-2">
        <TouchableOpacity>
          <Feather name="chevron-left" size={32} color="#333" />
        </TouchableOpacity>
      </View>,       // 自定义导航头背景组件

  // === 左右按钮 ===
  // headerLeft: () => <CustomBack />,
  // headerRight: () => <ThemeToggle />,
  headerBackVisible: false,                // 是否显示返回按钮
  // headerBackTitle: 'Back',                // iOS 返回按钮文字
  // headerBackTitleVisible: true,           // iOS 是否显示返回文字
  // headerBackTitleStyle: {},               // 返回文字样式
  // headerBackImageSource: undefined,       // 自定义返回图标
  // headerBackButtonDisplayMode: 'default', // 'default' | 'generic' | 'minimal'

  // === 大标题 (iOS) ===
  // headerLargeTitle: false,
  // headerLargeTitleStyle: {},
  // headerLargeTitleShadowVisible: true,
  // headerLargeStyle: { backgroundColor: '#fff' },

  // === 搜索栏 (iOS) ===
  // headerSearchBarOptions: {},

  // === 页面转场动画 ===
  // animation: 'default',                   // 'default' | 'fade' | 'slide_from_right' | 'slide_from_left' | 'slide_from_bottom' | 'fade_from_bottom' | 'none' | 'ios_from_right' | 'ios_from_left'
  // animationDuration: undefined,            // 动画时长(ms)
  // animationTypeForReplace: 'push',         // 'push' | 'pop'
  // customAnimationOnGesture: false,

  // === 手势 ===
  // gestureEnabled: true,
  // gestureDirection: 'horizontal',          // 'horizontal' | 'vertical'
  // fullScreenGestureEnabled: false,
  // fullScreenGestureShadowEnabled: true,

  // === 页面呈现方式 ===
  // presentation: 'card',                    // 'card' | 'modal' | 'transparentModal' | 'containedModal' | 'containedTransparentModal' | 'fullScreenModal' | 'formSheet'
  // contentStyle: {},                         // 页面内容区域样式

  // === 状态栏 ===
  // statusBarAnimation: 'fade',              // 'fade' | 'none' | 'slide'
  // statusBarColor: undefined,               // Android 状态栏颜色
  // statusBarHidden: false,
  // statusBarStyle: 'auto',                  // 'auto' | 'light' | 'dark'
  // statusBarTranslucent: false,             // Android 状态栏半透明

  // === 其他 ===
  // orientation: 'default',                  // 'default' | 'portrait' | 'landscape' 等
  // autoHideHomeIndicator: false,            // iOS 隐藏底部横条
  // navigationBarColor: undefined,           // Android 底部导航栏颜色
  // navigationBarHidden: false,              // Android 隐藏底部导航栏
  // freezeOnBlur: false,                     // 离开时冻结页面渲染
};

export default function LoginScreen() {
  return (
    <AuthScreenContainer>
      <Stack.Screen options={SCREEN_OPTIONS} />
      <SignInForm />
    </AuthScreenContainer>
  );
}


// import React from 'react';
// import { View, Text, TextInput, TouchableOpacity, SafeAreaView, StatusBar, Image } from 'react-native';
// import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

// export default function LoginScreen() {
//   return (
//     <SafeAreaView className="flex-1 bg-[#ffffff]">
//       <StatusBar barStyle="dark-content" />
      
//       {/* 顶部返回按钮 */}
//       <View className="px-4 pt-2">
//         <TouchableOpacity>
//           <Feather name="chevron-left" size={32} color="#333" />
//         </TouchableOpacity>
//       </View>

//       <View className="flex-1 px-6">
//         {/* Logo 区域 */}
//         <View className="items-center mt-16 mb-20">
//           {/* 这里使用 Text 作为 Logo 占位，实际开发请替换为 Image 组件 */}
//           <Text className="text-[#1677FF] text-8xl font-bold" style={{ transform: [{ scaleX: 1.2 }] }}>
//             支
//           </Text>
//           {/* <Image source={require('./path-to-alipay-logo.png')} className="w-24 h-24" resizeMode="contain" /> */}
//         </View>

//         {/* 手机号输入框 */}
//         <View className="flex-row items-center bg-[#F5F5F5] rounded-full px-5 py-4 mb-6">
//           <TouchableOpacity className="flex-row items-center pr-3 mr-3 border-r border-gray-300">
//             <Text className="text-lg text-black">+86</Text>
//             <Feather name="chevron-down" size={16} color="#666" className="ml-1" />
//           </TouchableOpacity>
//           <TextInput
//             className="flex-1 text-lg text-black"
//             placeholder="输入手机号，使用支付宝"
//             placeholderTextColor="#999"
//             keyboardType="phone-pad"
//           />
//         </View>

//         {/* 下一步按钮 */}
//         {/* 背景色使用了稍微透明/浅色的蓝，模拟未输入完整手机号时的不可点击状态 */}
//         <TouchableOpacity className="bg-[#8CBDF6] rounded-full py-4 items-center">
//           <Text className="text-lg font-medium tracking-widest text-white">
//             下一步
//           </Text>
//         </TouchableOpacity>
//       </View>

//       {/* 底部区域 */}
//       <View className="pb-8">
//         {/* 其他登录方式 */}
//         <View className="flex-row justify-center mb-10 gap-x-8">
//           <LoginOptionIcon icon="card-account-details-outline" label="身份证号" />
//           <LoginOptionIcon icon="email-outline" label="邮箱" />
//           <LoginOptionIcon icon="shopping-outline" label="淘宝" />
//           <LoginOptionIcon icon="watch-variant" label="儿童手表" />
//         </View>

//         {/* 底部链接 */}
//         <View className="flex-row items-center justify-center">
//           <TouchableOpacity>
//             <Text className="text-[#4C6496] text-base">注册账号</Text>
//           </TouchableOpacity>
//           <View className="w-[1px] h-4 bg-gray-300 mx-5" />
//           <TouchableOpacity>
//             <Text className="text-[#4C6496] text-base">遇到问题</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// }

// // 提取的底部登录方式组件
// const LoginOptionIcon = ({ icon, label }) => {
//   return (
//     <TouchableOpacity className="items-center">
//       <View className="w-12 h-12 bg-[#F5F5F5] rounded-full items-center justify-center mb-2">
//         <MaterialCommunityIcons name={icon} size={24} color="#333" />
//       </View>
//       <Text className="text-xs text-gray-500">{label}</Text>
//     </TouchableOpacity>
//   );
// };