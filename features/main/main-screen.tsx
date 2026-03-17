import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { Link, Stack } from 'expo-router';
import { ArrowRight, CalendarDays, Heart, MessageCircle, Sparkles } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SCREEN_OPTIONS = {
  title: 'Chats',
  headerTransparent: false,
};

const QUICK_LINKS = [
  {
    href: '/chat',
    title: 'Open chat',
    description: 'Jump back into the message workspace.',
    icon: MessageCircle,
  },
  {
    href: '/about',
    title: 'Plan schedule',
    description: 'Manage events, reminders, and calendar sync.',
    icon: CalendarDays,
  },
  {
    href: '/love',
    title: 'View favorites',
    description: 'Revisit saved conversations and highlights.',
    icon: Heart,
  },
];

export default function IndexScreen() {
  return (
    <SafeAreaView edges={['top', 'left', 'right', 'bottom']} className="flex-1 bg-background">
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 28 }}>
        <Stack.Screen options={SCREEN_OPTIONS} />
        <View className="w-full max-w-5xl gap-4 mx-auto">
          <Card className="py-0 overflow-hidden border-0 shadow-xl bg-primary shadow-black/10">
            <CardContent className="px-5 py-6">
              <View className="gap-5">
                <View className="self-start px-3 py-1 border rounded-full border-white/20 bg-white/10">
                  <Text className="text-xs font-medium uppercase tracking-[1.2px] text-primary-foreground/80">
                    Workspace overview
                  </Text>
                </View>
                <View className="gap-2">
                  <Text className="text-3xl font-semibold tracking-tight text-primary-foreground">
                    Everything important, one tap away
                  </Text>
                  <Text className="max-w-2xl leading-6 text-primary-foreground/80">
                    Move between chat, schedules, and saved moments with a homepage that feels like a
                    real control center instead of a placeholder.
                  </Text>
                </View>
                <View className="flex-row flex-wrap gap-3">
                  <Link href="/chat" asChild>
                    <Button variant="secondary">
                      <Sparkles size={16} color="currentColor" strokeWidth={2.3} />
                      <Text>Start chatting</Text>
                    </Button>
                  </Link>
                  <Link href="/login" asChild>
                    <Button variant="outline" className="border-white/20 bg-white/10">
                      <Text className="text-primary-foreground">Open auth flow</Text>
                    </Button>
                  </Link>
                </View>
              </View>
            </CardContent>
          </Card>

          <View className="flex-row flex-wrap gap-4">
            <Card className="min-w-[160px] flex-1 py-0">
              <CardContent className="gap-1 px-5 py-5">
                <Text className="text-sm text-muted-foreground">Active spaces</Text>
                <Text className="text-3xl font-semibold tracking-tight">4</Text>
                <Text className="text-sm text-muted-foreground">
                  Chat, schedule, favorites, profile
                </Text>
              </CardContent>
            </Card>
            <Card className="min-w-[160px] flex-1 py-0">
              <CardContent className="gap-1 px-5 py-5">
                <Text className="text-sm text-muted-foreground">Primary intent</Text>
                <Text className="text-2xl font-semibold tracking-tight">Fast navigation</Text>
                <Text className="text-sm text-muted-foreground">
                  Cleaner entry points and stronger hierarchy
                </Text>
              </CardContent>
            </Card>
          </View>

          <View className="gap-4">
            {QUICK_LINKS.map((item) => {
              const Icon = item.icon;

              return (
                <Link key={item.href} href={item.href as never} asChild>
                  <Card className="w-full py-0 border-0 shadow-none">
                    <CardHeader className="flex-row items-center justify-between px-5 pt-5 pb-2">
                      <View className="flex-row items-center gap-3">
                        <View className="items-center justify-center h-11 w-11 rounded-2xl bg-primary/10">
                          <Icon size={20} color="currentColor" strokeWidth={2} />
                        </View>
                        <View className="gap-1">
                          <CardTitle>{item.title}</CardTitle>
                          <CardDescription>{item.description}</CardDescription>
                        </View>
                      </View>
                      <ArrowRight size={18} color="currentColor" strokeWidth={2} />
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>

  );
}
