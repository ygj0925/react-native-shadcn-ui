import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { Toggle } from '@/components/ui/toggle';
import { COMPONENTS } from '@/lib/constants';
import { Stack, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { Image, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const DEMOS: Record<string, () => React.ReactElement> = {
  accordion: () => (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger>
          <Text>这是一个折叠面板</Text>
        </AccordionTrigger>
        <AccordionContent>
          <Text>这里是展开后的内容。</Text>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>
          <Text>另一个项目</Text>
        </AccordionTrigger>
        <AccordionContent>
          <Text>更多内容。</Text>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  alert: () => (
    <Alert>
      <AlertTitle>提示</AlertTitle>
      <AlertDescription>这是一个警告框示例。</AlertDescription>
    </Alert>
  ),
  'alert-dialog': () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          <Text>打开弹窗</Text>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>确认删除？</AlertDialogTitle>
          <AlertDialogDescription>该操作不可撤销。</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            <Text>取消</Text>
          </AlertDialogCancel>
          <AlertDialogAction>
            <Text>确认</Text>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
  'aspect-ratio': () => (
    <AspectRatio ratio={16 / 9} className="bg-muted rounded-lg overflow-hidden">
      <View className="flex-1 items-center justify-center">
        <Text className="text-muted-foreground">16 : 9</Text>
      </View>
    </AspectRatio>
  ),
  avatar: () => (
    <View className="flex-row gap-3">
      <Avatar alt="user">
        <AvatarImage source={{ uri: 'https://i.pravatar.cc/100?img=1' }} />
        <AvatarFallback>
          <Text>UI</Text>
        </AvatarFallback>
      </Avatar>
      <Avatar alt="user2">
        <AvatarFallback>
          <Text>YG</Text>
        </AvatarFallback>
      </Avatar>
    </View>
  ),
  badge: () => (
    <View className="flex-row flex-wrap gap-2">
      <Badge><Text>Default</Text></Badge>
      <Badge variant="secondary"><Text>Secondary</Text></Badge>
      <Badge variant="outline"><Text>Outline</Text></Badge>
      <Badge variant="destructive"><Text>Destructive</Text></Badge>
    </View>
  ),
  button: () => (
    <View className="gap-3">
      <Button><Text>Default</Text></Button>
      <Button variant="secondary"><Text>Secondary</Text></Button>
      <Button variant="outline"><Text>Outline</Text></Button>
      <Button variant="ghost"><Text>Ghost</Text></Button>
      <Button variant="destructive"><Text>Destructive</Text></Button>
    </View>
  ),
  card: () => (
    <Card>
      <CardHeader>
        <CardTitle>卡片标题</CardTitle>
        <CardDescription>卡片副标题描述</CardDescription>
      </CardHeader>
      <CardContent>
        <Text>这里是卡片正文内容。</Text>
      </CardContent>
    </Card>
  ),
  checkbox: () => {
    const [checked, setChecked] = React.useState(false);
    return (
      <View className="flex-row items-center gap-3">
        <Checkbox checked={checked} onCheckedChange={setChecked} />
        <Label onPress={() => setChecked((v) => !v)}>同意条款</Label>
      </View>
    );
  },
  collapsible: () => {
    const [open, setOpen] = React.useState(false);
    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="outline"><Text>{open ? '收起' : '展开'}</Text></Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <Text>这是隐藏的内容。</Text>
        </CollapsibleContent>
      </Collapsible>
    );
  },
  input: () => {
    const [value, setValue] = React.useState('');
    return <Input placeholder="请输入内容" value={value} onChangeText={setValue} />;
  },
  label: () => <Label>这是一个标签</Label>,
  progress: () => <Progress value={65} />,
  'radio-group': () => {
    const [value, setValue] = React.useState('a');
    return (
      <RadioGroup value={value} onValueChange={setValue} className="gap-3">
        <View className="flex-row items-center gap-2">
          <RadioGroupItem value="a" aria-labelledby="ra" />
          <Label nativeID="ra" onPress={() => setValue('a')}>选项 A</Label>
        </View>
        <View className="flex-row items-center gap-2">
          <RadioGroupItem value="b" aria-labelledby="rb" />
          <Label nativeID="rb" onPress={() => setValue('b')}>选项 B</Label>
        </View>
      </RadioGroup>
    );
  },
  separator: () => (
    <View className="gap-2">
      <Text>上方</Text>
      <Separator />
      <Text>下方</Text>
    </View>
  ),
  skeleton: () => (
    <View className="gap-3">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </View>
  ),
  switch: () => {
    const [on, setOn] = React.useState(false);
    return (
      <View className="flex-row items-center gap-3">
        <Switch checked={on} onCheckedChange={setOn} />
        <Text>{on ? '开启' : '关闭'}</Text>
      </View>
    );
  },
  tabs: () => (
    <Tabs defaultValue="account" className="w-full">
      <TabsList className="w-full flex-row">
        <TabsTrigger value="account" className="flex-1"><Text>账户</Text></TabsTrigger>
        <TabsTrigger value="password" className="flex-1"><Text>密码</Text></TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="pt-3">
        <Text>账户信息内容</Text>
      </TabsContent>
      <TabsContent value="password" className="pt-3">
        <Text>密码修改内容</Text>
      </TabsContent>
    </Tabs>
  ),
  text: () => (
    <View className="gap-2">
      <Text className="text-2xl font-bold">大号文字</Text>
      <Text className="text-base">普通正文</Text>
      <Text className="text-sm text-muted-foreground">辅助文字</Text>
    </View>
  ),
  textarea: () => {
    const [value, setValue] = React.useState('');
    return <Textarea placeholder="多行文本" value={value} onChangeText={setValue} />;
  },
  toggle: () => {
    const [pressed, setPressed] = React.useState(false);
    return (
      <Toggle pressed={pressed} onPressedChange={setPressed}>
        <Text>{pressed ? '已开启' : '点击切换'}</Text>
      </Toggle>
    );
  },
};

export default function ComponentDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const slugStr = Array.isArray(slug) ? slug[0] : slug;
  const meta = COMPONENTS.find((c) => c.slug === slugStr);
  const Demo = slugStr ? DEMOS[slugStr] : undefined;

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} className="flex-1 bg-background">
      <Stack.Screen options={{ title: meta?.name ?? slugStr ?? '组件', headerShown: true }} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        <View className="gap-1">
          <Text className="text-2xl font-semibold">{meta?.name ?? slugStr}</Text>
          <Text className="text-sm text-muted-foreground">components/ui/{slugStr}.tsx</Text>
        </View>

        <Card>
          <CardHeader>
            <CardTitle>预览</CardTitle>
            <CardDescription>
              {Demo ? '下面是该组件的演示。' : '该组件暂未提供演示，可在 [slug].tsx 中补充。'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Demo ? <Demo /> : <Text className="text-muted-foreground">（暂无演示）</Text>}
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
