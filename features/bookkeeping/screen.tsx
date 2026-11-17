import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  AppState,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Plus,
  Search,
  Settings,
  Wallet,
  X,
} from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {
  backup,
  balances,
  cents,
  entriesForPeriod,
  exportCSV,
  localDate,
  money,
  periodRange,
  previewCSV,
  restore,
  totals,
  type Entry,
  type EntryType,
} from './domain';
import { newId, useLedgerStore } from './store';
import { NativeTools, PrivacyVisibilityContext } from './native-tools';
import { SavingsGoals } from './goals';
import { ReceiptTools } from './receipt-tools';
import { WidgetSettings } from './widgets';
import { CurrencyInput } from './currency-input';

type Tab = '明细' | '图表' | '预算' | '资产' | '设置';
const tabs = [
  { name: '明细', icon: BookOpen },
  { name: '图表', icon: BarChart3 },
  { name: '预算', icon: CalendarDays },
  { name: '资产', icon: Wallet },
  { name: '设置', icon: Settings },
] as const;
const palette = ['#E9B949', '#658A79', '#799BBD', '#C88670', '#9787A9', '#B0A475'];
const fail = (e: unknown) => (e instanceof Error ? e.message : '操作失败，请重试');
const titleForType = (type: EntryType) =>
  ({ expense: '支出', income: '收入', transfer: '转账' })[type];
async function download(name: string, text: string, mime: string) {
  if (Platform.OS === 'web') {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } else {
    if (await Sharing.isAvailableAsync()) {
      const file = new File(Paths.cache, name);
      file.write(text);
      await Sharing.shareAsync(file.uri, { mimeType: mime });
    } else await Share.share({ message: text });
  }
}

export default function BookkeepingScreen() {
  const privacyVisible = React.useContext(PrivacyVisibilityContext);
  const params = useLocalSearchParams<{ compose?: string }>();
  const router = useRouter();
  const data = useLedgerStore((s) => s.data),
    ready = useLedgerStore((s) => s.ready),
    storageError = useLedgerStore((s) => s.error);
  const update = useLedgerStore((s) => s.setData);
  const [tab, setTab] = useState<Tab>('明细');
  const [month, setMonth] = useState(localDate().slice(0, 7));
  const [query, setQuery] = useState(''),
    [typeFilter, setTypeFilter] = useState('all'),
    [categoryFilter, setCategoryFilter] = useState('all');
  const [calendar, setCalendar] = useState(false),
    [day, setDay] = useState('');
  const [editing, setEditing] = useState<Entry | 'new' | null>(null);
  useEffect(() => {
    if (ready && params.compose === '1') {
      setEditing('new');
      router.setParams({ compose: undefined });
    }
  }, [ready, params.compose, router]);
  const [panel, setPanel] = useState<
    'books' | 'categories' | 'account' | 'budget' | 'restore' | 'csv' | null
  >(null);
  const [name, setName] = useState(''),
    [amount, setAmount] = useState(''),
    [option, setOption] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState(''),
    [confirmRestore, setConfirmRestore] = useState(false);
  const [yearView, setYearView] = useState(false);
  const dark = data.settings.theme === 'dark';
  const colors = {
    bg: dark ? '#171918' : '#F8F7F3',
    surface: dark ? '#222623' : '#FFFFFF',
    text: dark ? '#F6F4ED' : '#242A26',
    muted: dark ? '#ACB5AD' : '#758078',
    line: dark ? '#38413A' : '#E9EBE4',
    accent: data.settings.accent,
  };
  const rows = useMemo(() => entriesForPeriod(data, month), [data, month]);
  const summary = useMemo(() => totals(rows), [rows]);
  const categoryName = (id: string) => data.categories.find((c) => c.id === id)?.name ?? '转账';
  const accountName = (id: string) => data.accounts.find((a) => a.id === id)?.name ?? '账户';
  const book = data.books.find((b) => b.id === data.activeBookId);
  const showMoney = (value: number) => (data.settings.hideAmounts ? '••••' : money(value));
  const filtered = useMemo(
    () =>
      rows
        .filter(
          (e) =>
            (!day || e.date === day) &&
            (typeFilter === 'all' || e.type === typeFilter) &&
            (categoryFilter === 'all' || e.categoryId === categoryFilter) &&
            `${e.note} ${e.tags.join(' ')} ${data.categories.find((c) => c.id === e.categoryId)?.name ?? ''}`
              .toLowerCase()
              .includes(query.toLowerCase())
        )
        .sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt)),
    [rows, day, typeFilter, categoryFilter, query, data.categories]
  );
  const groups = useMemo(
    () =>
      [...new Set(filtered.map((e) => e.date))].map((date) => ({
        date,
        entries: filtered.filter((e) => e.date === date),
      })),
    [filtered]
  );
  const balance = useMemo(() => balances(data), [data]);
  const graphRows = yearView
    ? data.entries.filter(
        (e) =>
          !e.deletedAt && e.bookId === data.activeBookId && e.date.startsWith(month.slice(0, 4))
      )
    : rows;
  const graphSummary = totals(graphRows);
  const ranking = data.categories
    .filter((c) => c.type === 'expense')
    .map((c) => ({
      ...c,
      total: graphRows
        .filter((e) => e.type === 'expense' && e.categoryId === c.id)
        .reduce((a, e) => a + e.cents, 0),
    }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);
  const [periodStart, periodEnd] = periodRange(month, data.settings.billingStartDay);
  const dates: string[] = [];
  for (let cursor = periodStart; cursor < periodEnd; ) {
    dates.push(cursor);
    const [y, m, d] = cursor.split('-').map(Number);
    cursor = localDate(new Date(y, m - 1, d + 1));
  }
  const trend = (
    yearView
      ? Array.from(
          { length: 12 },
          (_, i) => `${month.slice(0, 4)}-${String(i + 1).padStart(2, '0')}`
        )
      : dates
  ).map((anchor) => ({
    label: yearView ? `${Number(anchor.slice(5))}月` : anchor.slice(5),
    value: graphRows
      .filter(
        (e) => e.type === 'expense' && (yearView ? e.date.startsWith(anchor) : e.date === anchor)
      )
      .reduce((sum, e) => sum + e.cents, 0),
  }));
  const maxTrend = Math.max(1, ...trend.map((t) => t.value));
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') useLedgerStore.getState().tick();
    });
    return () => sub.remove();
  }, []);

  function openPanel(next: typeof panel) {
    setEditId(null);
    setPanel(next);
    setName('');
    setAmount('');
    setOption(next === 'budget' ? 'total' : next === 'categories' ? 'expense' : 'bank');
    setError('');
    setConfirmRestore(false);
  }
  function changeMonth(delta: number) {
    const [y, m] = month.split('-').map(Number);
    setMonth(localDate(new Date(y, m - 1 + delta, 1)).slice(0, 7));
    setDay('');
  }
  function savePanel() {
    try {
      const namedItems =
        panel === 'books'
          ? data.books
          : panel === 'account'
            ? data.accounts
            : panel === 'categories'
              ? data.categories.filter(
                  (c) =>
                    c.type ===
                    (editId ? data.categories.find((item) => item.id === editId)?.type : option)
                )
              : [];
      if (namedItems.some((item) => item.id !== editId && item.name === name.trim()))
        throw new Error('名称已存在，请使用不同名称');
      if (editId && ['books', 'categories', 'account'].includes(panel ?? '')) {
        if (!name.trim() || name.trim().length > 40) throw new Error('请输入 1 到 40 字名称');
        if (panel === 'books')
          update((d) => ({
            ...d,
            books: d.books.map((b) => (b.id === editId ? { ...b, name: name.trim() } : b)),
          }));
        if (panel === 'categories')
          update((d) => ({
            ...d,
            categories: d.categories.map((c) =>
              c.id === editId ? { ...c, name: name.trim() } : c
            ),
          }));
        if (panel === 'account') {
          const openingCents = cents(amount || '0', true);
          update((d) => ({
            ...d,
            accounts: d.accounts.map((a) =>
              a.id === editId
                ? {
                    ...a,
                    name: name.trim(),
                    openingCents,
                    kind: option as 'cash' | 'bank' | 'credit',
                  }
                : a
            ),
          }));
        }
        setPanel(null);
        return;
      }
      if (panel === 'books') {
        if (!name.trim()) throw new Error('请输入账本名称');
        const id = newId();
        update((d) => ({
          ...d,
          activeBookId: id,
          books: [...d.books, { id, name: name.trim(), currency: 'CNY' }],
        }));
      }
      if (panel === 'categories') {
        if (!name.trim()) throw new Error('请输入分类名称');
        if (data.categories.some((c) => c.name === name.trim() && c.type === option))
          throw new Error('同类型分类已存在');
        update((d) => ({
          ...d,
          categories: [
            ...d.categories,
            { id: newId(), name: name.trim(), type: option as 'expense' | 'income' },
          ],
        }));
      }
      if (panel === 'account') {
        if (!name.trim()) throw new Error('请输入账户名称');
        const openingCents = cents(amount || '0', true);
        update((d) => ({
          ...d,
          accounts: [
            ...d.accounts,
            {
              id: newId(),
              name: name.trim(),
              openingCents,
              kind: option as 'bank' | 'cash' | 'credit',
            },
          ],
        }));
      }
      if (panel === 'budget')
        useLedgerStore.getState().setBudget({
          bookId: data.activeBookId,
          month,
          categoryId: option,
          cents: cents(amount),
        });
      if (panel === 'restore') {
        restore(name);
        if (!confirmRestore) {
          setConfirmRestore(true);
          return;
        }
        useLedgerStore.getState().restoreBackup(name);
      }
      if (panel === 'csv') {
        const preview = previewCSV(name, data);
        if (!confirmRestore) {
          setConfirmRestore(true);
          setError(
            `将导入 ${preview.entries.length} 笔，跳过 ${preview.duplicates} 笔重复记录。再次点击确认导入。`
          );
          return;
        }
        update((d) => ({ ...d, entries: [...d.entries, ...preview.entries] }));
      }
      setPanel(null);
    } catch (e) {
      setError(fail(e));
    }
  }
  const Txt = ({
    children,
    muted = false,
    style,
  }: {
    children: React.ReactNode;
    muted?: boolean;
    style?: object;
  }) => (
    <Text style={[styles.text, { color: muted ? colors.muted : colors.text }, style]}>
      {children}
    </Text>
  );
  const Action = ({
    label,
    onPress,
    secondary = false,
  }: {
    label: string;
    onPress: () => void;
    secondary?: boolean;
  }) => (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.action,
        {
          backgroundColor: secondary ? colors.surface : colors.accent,
          borderColor: colors.line,
          borderWidth: secondary ? 1 : 0,
        },
      ]}>
      <Text style={{ color: secondary ? colors.text : '#242A26', fontWeight: '700', fontSize: 15 }}>
        {label}
      </Text>
    </Pressable>
  );
  const Chips = ({
    items,
    value,
    onChange,
  }: {
    items: { id: string; name: string }[];
    value: string;
    onChange: (id: string) => void;
  }) => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 8 }}>
      {items.map((item) => (
        <Pressable
          key={item.id}
          accessibilityRole="button"
          accessibilityState={{ selected: value === item.id }}
          onPress={() => onChange(item.id)}
          style={[
            styles.chip,
            {
              backgroundColor: value === item.id ? colors.accent : colors.surface,
              borderColor: colors.line,
            },
          ]}>
          <Text style={{ color: value === item.id ? '#242A26' : colors.text }}>{item.name}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
  const inputStyle = [
    styles.input,
    { color: colors.text, borderColor: colors.line, backgroundColor: colors.surface },
  ];
  if (!ready)
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
        <Text style={{ padding: 28 }}>正在读取本地账本…</Text>
      </SafeAreaView>
    );
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="返回工作台" onPress={() => router.back()} hitSlop={12}>
          <ArrowLeft size={22} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Txt style={{ fontSize: 23, fontWeight: '800' }}>简账</Txt>
          <Txt muted style={{ fontSize: 12 }}>
            好好生活，心中有数
          </Txt>
        </View>
        <Pressable onPress={() => openPanel('books')} accessibilityLabel="切换或管理账本">
          <Txt style={{ fontWeight: '600' }}>{book?.name} ⌄</Txt>
        </Pressable>
        <Pressable
          accessibilityLabel={data.settings.hideAmounts ? '显示金额' : '隐藏金额'}
          onPress={() =>
            update((d) => ({
              ...d,
              settings: { ...d.settings, hideAmounts: !d.settings.hideAmounts },
            }))
          }
          hitSlop={12}>
          {data.settings.hideAmounts ? (
            <EyeOff size={21} color={colors.text} />
          ) : (
            <Eye size={21} color={colors.text} />
          )}
        </Pressable>
      </View>
      {storageError ? (
        <View style={{ backgroundColor: '#FFE8DF', padding: 12 }}>
          <Text style={{ color: '#8D3520' }}>{storageError}</Text>
        </View>
      ) : null}
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {tab !== '设置' && tab !== '资产' && (
          <View style={styles.monthBar}>
            <Pressable accessibilityLabel="上个月" onPress={() => changeMonth(-1)} hitSlop={12}>
              <ChevronLeft size={21} color={colors.text} />
            </Pressable>
            <Txt style={{ fontSize: 18, fontWeight: '700' }}>{month.replace('-', ' 年 ')} 月</Txt>
            <Pressable accessibilityLabel="下个月" onPress={() => changeMonth(1)} hitSlop={12}>
              <ChevronRight size={21} color={colors.text} />
            </Pressable>
          </View>
        )}
        {tab === '明细' && (
          <>
            <View style={[styles.hero, { backgroundColor: colors.accent }]}>
              <Text style={styles.heroLabel}>本期支出 · CNY</Text>
              <Text style={styles.heroAmount}>{showMoney(summary.expense)}</Text>
              <View style={styles.between}>
                <Text style={styles.heroLabel}>收入 {showMoney(summary.income)}</Text>
                <Text style={styles.heroLabel}>结余 {showMoney(summary.net)}</Text>
              </View>
            </View>
            <View
              style={[
                styles.search,
                { backgroundColor: colors.surface, borderColor: colors.line },
              ]}>
              <Search size={18} color={colors.muted} />
              <TextInput
                accessibilityLabel="搜索账单"
                placeholder="搜索备注、分类、标签"
                placeholderTextColor={colors.muted}
                style={{ flex: 1, color: colors.text, paddingVertical: 10 }}
                value={query}
                onChangeText={setQuery}
              />
              <Pressable
                accessibilityLabel="显示记账日历"
                onPress={() => {
                  setCalendar(!calendar);
                  setDay('');
                }}>
                <CalendarDays size={21} color={colors.text} />
              </Pressable>
            </View>
            <Chips
              value={typeFilter}
              onChange={setTypeFilter}
              items={[
                { id: 'all', name: '全部' },
                { id: 'expense', name: '支出' },
                { id: 'income', name: '收入' },
                { id: 'transfer', name: '转账' },
              ]}
            />
            <Chips
              value={categoryFilter}
              onChange={setCategoryFilter}
              items={[
                { id: 'all', name: '全部分类' },
                ...data.categories.filter((c) => rows.some((e) => e.categoryId === c.id)),
              ]}
            />
            {calendar && (
              <View style={[styles.panel, { backgroundColor: colors.surface }]}>
                <Txt muted>选择日期查看与补记 · {day || '全部日期'}</Txt>
                <View style={styles.wrap}>
                  {dates.map((date) => {
                    const total = totals(rows.filter((e) => e.date === date));
                    return (
                      <Pressable
                        key={date}
                        onPress={() => setDay(day === date ? '' : date)}
                        style={[
                          styles.calendarDay,
                          { backgroundColor: day === date ? colors.accent : colors.bg },
                        ]}>
                        <Txt>{date.slice(5)}</Txt>
                        <Txt muted style={{ fontSize: 9 }}>
                          {total.expense ? showMoney(total.expense) : '—'}
                        </Txt>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
            {!groups.length && (
              <View style={styles.empty}>
                <BookOpen size={40} color={colors.muted} />
                <Txt style={{ fontSize: 19, fontWeight: '700' }}>
                  {query || day || categoryFilter !== 'all' ? '没有匹配的账单' : '从第一笔开始'}
                </Txt>
                <Txt muted>记录每一份日常，让收支慢慢清晰。</Txt>
              </View>
            )}
            {groups.map((group) => (
              <View key={group.date} style={{ gap: 4 }}>
                <View style={[styles.between, { paddingVertical: 12 }]}>
                  <Txt muted>{group.date}</Txt>
                  <Txt muted style={{ fontSize: 12 }}>
                    支 {showMoney(totals(group.entries).expense)} / 收{' '}
                    {showMoney(totals(group.entries).income)}
                  </Txt>
                </View>
                <View
                  style={[styles.panel, { backgroundColor: colors.surface, paddingVertical: 0 }]}>
                  {group.entries.map((e) => (
                    <Pressable
                      key={e.id}
                      accessibilityLabel={`编辑${titleForType(e.type)}账单`}
                      onPress={() => setEditing(e)}
                      style={[
                        styles.row,
                        {
                          borderBottomColor: colors.line,
                          borderBottomWidth: StyleSheet.hairlineWidth,
                        },
                      ]}>
                      <View style={[styles.categoryIcon, { backgroundColor: colors.bg }]}>
                        <Text style={{ color: colors.text, fontWeight: '700' }}>
                          {e.type === 'transfer' ? '转' : categoryName(e.categoryId).slice(0, 1)}
                        </Text>
                      </View>
                      <View style={{ flex: 1, gap: 4 }}>
                        <Txt style={{ fontWeight: '600' }}>
                          {e.type === 'transfer'
                            ? `${accountName(e.accountId)} → ${accountName(e.toAccountId ?? '')}`
                            : categoryName(e.categoryId)}
                        </Txt>
                        <Txt muted style={{ fontSize: 12 }}>
                          {e.note || accountName(e.accountId)}
                          {e.tags.length ? ` · ${e.tags.join(' / ')}` : ''}
                        </Txt>
                      </View>
                      <Txt
                        style={{
                          fontWeight: '700',
                          fontVariant: ['tabular-nums'],
                          color: e.type === 'income' ? '#50866A' : colors.text,
                        }}>
                        {e.type === 'income' ? '+' : e.type === 'expense' ? '−' : ''}
                        {showMoney(e.cents)}
                      </Txt>
                    </Pressable>
                  ))}
                </View>
              </View>
            ))}
          </>
        )}
        {tab === '图表' && (
          <>
            <Chips
              items={[
                { id: 'month', name: '本期' },
                { id: 'year', name: '年度' },
              ]}
              value={yearView ? 'year' : 'month'}
              onChange={(v) => setYearView(v === 'year')}
            />
            <View style={[styles.panel, { backgroundColor: colors.surface }]}>
              <Txt muted>{yearView ? month.slice(0, 4) + ' 年' : '当前账期'}收支概览</Txt>
              <Txt style={styles.sectionTitle}>结余 ¥{showMoney(graphSummary.net)}</Txt>
              <Txt muted>
                收入 {showMoney(graphSummary.income)}　支出 {showMoney(graphSummary.expense)}
              </Txt>
            </View>
            <View style={[styles.panel, { backgroundColor: colors.surface }]}>
              <Txt style={styles.sectionTitle}>支出分类</Txt>
              {!ranking.length ? (
                <Txt muted>记下支出后，这里会生成分类占比。</Txt>
              ) : (
                <>
                  <View style={{ alignItems: 'center', padding: 16 }}>
                    <Svg width={180} height={180} viewBox="0 0 180 180">
                      <Circle
                        cx={90}
                        cy={90}
                        r={65}
                        stroke={colors.line}
                        strokeWidth={24}
                        fill="none"
                      />
                      {ranking.map((r, i) => {
                        const length = (r.total / graphSummary.expense) * 408.407;
                        const offset =
                          (ranking.slice(0, i).reduce((s, c) => s + c.total, 0) /
                            graphSummary.expense) *
                          408.407;
                        return (
                          <Circle
                            key={r.id}
                            cx={90}
                            cy={90}
                            r={65}
                            stroke={palette[i % palette.length]}
                            strokeWidth={24}
                            fill="none"
                            strokeDasharray={`${length} ${408.407 - length}`}
                            strokeDashoffset={-offset}
                            rotation={-90}
                            origin="90,90"
                          />
                        );
                      })}
                    </Svg>
                  </View>
                  {ranking.map((r, i) => (
                    <View key={r.id} style={{ gap: 8, paddingVertical: 8 }}>
                      <View style={styles.between}>
                        <Txt>{r.name}</Txt>
                        <Txt>
                          {showMoney(r.total)} ·{' '}
                          {((r.total / graphSummary.expense) * 100).toFixed(1)}%
                        </Txt>
                      </View>
                      <View style={[styles.track, { backgroundColor: colors.line }]}>
                        <View
                          style={{
                            height: 5,
                            width: `${(r.total / graphSummary.expense) * 100}%`,
                            backgroundColor: palette[i % palette.length],
                            borderRadius: 3,
                          }}
                        />
                      </View>
                    </View>
                  ))}
                </>
              )}
            </View>
            <View style={[styles.panel, { backgroundColor: colors.surface }]}>
              <Txt style={styles.sectionTitle}>{yearView ? '每月支出趋势' : '每日支出趋势'}</Txt>
              <ScrollView horizontal>
                <View style={{ height: 155, flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
                  {trend.map((point) => (
                    <View key={point.label} style={{ width: 34, alignItems: 'center', gap: 6 }}>
                      <View
                        style={{
                          width: 24,
                          minHeight: 2,
                          height: (point.value / maxTrend) * 100,
                          backgroundColor: colors.accent,
                          borderRadius: 3,
                        }}
                      />
                      <Txt muted style={{ fontSize: 10 }}>
                        {point.label}
                      </Txt>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </>
        )}
        {tab === '预算' && (
          <>
            <Txt style={styles.sectionTitle}>给开销留一点边界</Txt>
            <Txt muted>预算按当前账本、账期独立计算，转账不计入支出。</Txt>
            {data.budgets
              .filter((b) => b.bookId === data.activeBookId && b.month === month)
              .map((b) => {
                const used =
                  b.categoryId === 'total'
                    ? summary.expense
                    : rows
                        .filter((e) => e.type === 'expense' && e.categoryId === b.categoryId)
                        .reduce((s, e) => s + e.cents, 0);
                const ratio = used / b.cents;
                return (
                  <View
                    key={b.categoryId}
                    style={[styles.panel, { backgroundColor: colors.surface }]}>
                    <View style={styles.between}>
                      <Txt style={styles.sectionTitle}>
                        {b.categoryId === 'total' ? '总预算' : categoryName(b.categoryId)}
                      </Txt>
                      <Pressable
                        onPress={() => {
                          openPanel('budget');
                          setOption(b.categoryId);
                          setAmount((b.cents / 100).toFixed(2));
                        }}>
                        <Txt muted>修改</Txt>
                      </Pressable>
                    </View>
                    <Txt style={{ fontSize: 26, fontWeight: '700' }}>
                      ¥{showMoney(b.cents - used)}
                    </Txt>
                    <Txt muted>
                      {ratio > 1 ? '已经超支' : ratio >= 0.8 ? '预算已使用超过 80%' : '本期剩余'} ·
                      已花 {showMoney(used)} / {showMoney(b.cents)}
                    </Txt>
                    <View style={[styles.track, { backgroundColor: colors.line }]}>
                      <View
                        style={{
                          height: 5,
                          width: `${Math.min(100, ratio * 100)}%`,
                          backgroundColor: ratio >= 1 ? '#C16B53' : colors.accent,
                        }}
                      />
                    </View>
                    <Pressable
                      onPress={() =>
                        update((d) => ({ ...d, budgets: d.budgets.filter((item) => item !== b) }))
                      }>
                      <Txt muted style={{ fontSize: 12 }}>
                        移除此预算
                      </Txt>
                    </Pressable>
                  </View>
                );
              })}
            {!data.budgets.some((b) => b.bookId === data.activeBookId && b.month === month) && (
              <View style={styles.empty}>
                <CalendarDays color={colors.muted} size={40} />
                <Txt muted>还没有设置本期预算</Txt>
              </View>
            )}
            <Action label="设置预算" onPress={() => openPanel('budget')} />
          </>
        )}
        {tab === '资产' && (
          <>
            <View style={[styles.hero, { backgroundColor: colors.accent }]}>
              <Text style={styles.heroLabel}>净资产 · 全部账本</Text>
              <Text style={styles.heroAmount}>
                {showMoney(Object.values(balance).reduce((s, n) => s + n, 0))}
              </Text>
              <Text style={styles.heroLabel}>
                资产{' '}
                {showMoney(
                  Object.values(balance)
                    .filter((n) => n > 0)
                    .reduce((s, n) => s + n, 0)
                )}
                　负债{' '}
                {showMoney(
                  -Object.values(balance)
                    .filter((n) => n < 0)
                    .reduce((s, n) => s + n, 0)
                )}
              </Text>
            </View>
            <Txt muted>余额由期初余额和所有账本流水计算，转账不影响净资产。</Txt>
            {data.accounts.map((a) => (
              <View key={a.id} style={[styles.panel, { backgroundColor: colors.surface }]}>
                <View style={styles.between}>
                  <View style={{ gap: 6 }}>
                    <Txt style={styles.sectionTitle}>{a.name}</Txt>
                    <Txt muted>
                      {{ cash: '现金', bank: '银行卡 / 储蓄', credit: '信用卡 / 负债' }[a.kind]}
                    </Txt>
                  </View>
                  <Txt style={{ fontSize: 23, fontWeight: '700' }}>{showMoney(balance[a.id])}</Txt>
                </View>
                <Pressable
                  onPress={() => {
                    openPanel('account');
                    setEditId(a.id);
                    setName(a.name);
                    setAmount((a.openingCents / 100).toFixed(2));
                    setOption(a.kind);
                  }}>
                  <Txt muted>编辑账户与期初余额</Txt>
                </Pressable>
              </View>
            ))}
            <Action label="添加账户" onPress={() => openPanel('account')} />
            <SavingsGoals />
          </>
        )}
        {tab === '设置' && (
          <>
            <Txt style={{ fontSize: 26, fontWeight: '800' }}>把账本变成你的样子</Txt>
            <Txt muted>全部记账功能免费 · 本机保存，无需会员</Txt>
            <View style={[styles.panel, { backgroundColor: colors.surface }]}>
              <View style={styles.between}>
                <Txt>隐藏金额</Txt>
                <Switch
                  value={data.settings.hideAmounts}
                  onValueChange={(v) =>
                    update((d) => ({ ...d, settings: { ...d.settings, hideAmounts: v } }))
                  }
                />
              </View>
              <View style={styles.between}>
                <Txt>深色模式</Txt>
                <Switch
                  value={dark}
                  onValueChange={(v) =>
                    update((d) => ({
                      ...d,
                      settings: { ...d.settings, theme: v ? 'dark' : 'light' },
                    }))
                  }
                />
              </View>
              <Txt>主题配色</Txt>
              <View style={styles.wrap}>
                {palette.slice(0, 4).map((color) => (
                  <Pressable
                    key={color}
                    accessibilityLabel={`主题颜色 ${color}`}
                    onPress={() =>
                      update((d) => ({ ...d, settings: { ...d.settings, accent: color } }))
                    }
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 19,
                      backgroundColor: color,
                      borderWidth: data.settings.accent === color ? 3 : 0,
                      borderColor: colors.text,
                    }}
                  />
                ))}
              </View>
              <Txt>账期起始日：每月 {data.settings.billingStartDay} 日</Txt>
              <Chips
                value={String(data.settings.billingStartDay)}
                onChange={(v) =>
                  update((d) => ({ ...d, settings: { ...d.settings, billingStartDay: Number(v) } }))
                }
                items={Array.from({ length: 31 }, (_, i) => ({
                  id: String(i + 1),
                  name: `${i + 1}日`,
                }))}
              />
              <Txt muted style={{ fontSize: 12 }}>
                月底不足对应日时按当月最后一天起算。
              </Txt>
            </View>
            <Action secondary label="管理账本" onPress={() => openPanel('books')} />
            <Action secondary label="管理收支分类" onPress={() => openPanel('categories')} />
            <View style={[styles.panel, { backgroundColor: colors.surface }]}>
              <Txt style={styles.sectionTitle}>周期记账</Txt>
              <Txt muted>在记一笔中选择周期；重新打开 App 时补齐到期账单。</Txt>
              {data.recurring.map((rule) => (
                <View key={rule.id} style={styles.between}>
                  <View style={{ flex: 1 }}>
                    <Txt>
                      {rule.template.note || categoryName(rule.template.categoryId)} ·{' '}
                      {showMoney(rule.template.cents)}
                    </Txt>
                    <Txt muted style={{ fontSize: 12 }}>
                      {{ daily: '每日', weekly: '每周', monthly: '每月' }[rule.frequency]} · 下次{' '}
                      {rule.nextDate}
                    </Txt>
                  </View>
                  <Switch
                    value={rule.enabled}
                    onValueChange={(v) =>
                      update((d) => ({
                        ...d,
                        recurring: d.recurring.map((r) =>
                          r.id === rule.id ? { ...r, enabled: v } : r
                        ),
                      }))
                    }
                  />
                </View>
              ))}
            </View>
            <Action
              secondary
              label="导出当前账本 CSV"
              onPress={() => {
                download(`简账-${month}.csv`, exportCSV(data), 'text/csv').catch((e) =>
                  setError(fail(e))
                );
              }}
            />
            <Action
              secondary
              label="导出完整 JSON 备份"
              onPress={() => {
                download(`简账备份-${localDate()}.json`, backup(data), 'application/json').catch(
                  (e) => setError(fail(e))
                );
              }}
            />
            <Action secondary label="导入简账 CSV" onPress={() => openPanel('csv')} />
            <Action secondary label="从 JSON 恢复" onPress={() => openPanel('restore')} />
            <Action
              secondary
              label="云端账号、备份与家庭共享"
              onPress={() => router.push('/bookkeeping-cloud' as never)}
            />
            <NativeTools />
            <WidgetSettings />
            <View style={[styles.panel, { backgroundColor: colors.surface }]}>
              <Txt style={styles.sectionTitle}>数据状态</Txt>
              <Txt muted>
                当前为本地账本，尚未启用云同步。更换设备前请导出备份。此处不会把本地保存显示为同步成功。
              </Txt>
              <Txt muted style={{ fontSize: 12 }}>
                账单 {data.entries.filter((e) => !e.deletedAt).length} 笔 · 记账{' '}
                {new Set(data.entries.filter((e) => !e.deletedAt).map((e) => e.date)).size} 天
              </Txt>
            </View>
          </>
        )}
        {error && !panel && (
          <Text accessibilityRole="alert" style={{ color: '#C16B53' }}>
            {error}
          </Text>
        )}
      </ScrollView>
      {tab === '明细' && (
        <View style={styles.addBar}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setEditing('new')}
            style={[styles.addButton, { backgroundColor: colors.accent }]}>
            <Plus size={22} color="#242A26" />
            <Text style={{ color: '#242A26', fontWeight: '800', fontSize: 17 }}>记一笔</Text>
          </Pressable>
        </View>
      )}
      <View
        style={[styles.bottom, { backgroundColor: colors.surface, borderTopColor: colors.line }]}>
        {tabs.map(({ name: label, icon: Icon }) => (
          <Pressable
            key={label}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === label }}
            onPress={() => {
              setTab(label);
              setError('');
            }}
            style={styles.tab}>
            <Icon
              size={22}
              color={tab === label ? colors.text : colors.muted}
              strokeWidth={tab === label ? 2.3 : 1.7}
            />
            <Text
              style={{
                fontSize: 11,
                fontWeight: tab === label ? '700' : '400',
                color: tab === label ? colors.text : colors.muted,
              }}>
              {label}
            </Text>
            {tab === label && (
              <View
                style={{ width: 16, height: 3, borderRadius: 2, backgroundColor: colors.accent }}
              />
            )}
          </Pressable>
        ))}
      </View>
      <Modal
        visible={!!panel && privacyVisible}
        animationType="slide"
        onRequestClose={() => setPanel(null)}>
        <SafeAreaView style={[styles.root, { backgroundColor: colors.bg }]}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
              <View style={styles.between}>
                <Txt style={styles.sectionTitle}>
                  {
                    {
                      books: '账本管理',
                      categories: '收支分类',
                      account: '添加账户',
                      budget: '设置预算',
                      restore: '恢复完整备份',
                      csv: '导入 CSV',
                    }[panel ?? 'books']
                  }
                </Txt>
                <Pressable accessibilityLabel="关闭" onPress={() => setPanel(null)}>
                  <X color={colors.text} />
                </Pressable>
              </View>
              {panel === 'books' &&
                data.books.map((b) => (
                  <View key={b.id} style={[styles.row, { gap: 14 }]}>
                    <Pressable
                      style={{ flex: 1 }}
                      onPress={() => {
                        update((d) => ({ ...d, activeBookId: b.id }));
                        setPanel(null);
                      }}
                      disabled={!!b.archived}>
                      <Txt>
                        {b.name}
                        {b.id === data.activeBookId ? ' · 当前' : ''}
                        {b.archived ? ' · 已归档' : ''}
                      </Txt>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setEditId(b.id);
                        setName(b.name);
                      }}>
                      <Txt muted>改名</Txt>
                    </Pressable>
                    {b.id !== data.activeBookId && (
                      <Pressable
                        onPress={() =>
                          update((d) => ({
                            ...d,
                            books: d.books.map((item) =>
                              item.id === b.id ? { ...item, archived: !item.archived } : item
                            ),
                          }))
                        }>
                        <Txt muted>{b.archived ? '恢复' : '归档'}</Txt>
                      </Pressable>
                    )}
                  </View>
                ))}
              {panel === 'categories' && (
                <>
                  <Chips
                    value={option}
                    onChange={setOption}
                    items={[
                      { id: 'expense', name: '支出' },
                      { id: 'income', name: '收入' },
                    ]}
                  />
                  {data.categories
                    .filter((c) => c.type === option)
                    .map((c) => (
                      <View key={c.id} style={styles.between}>
                        <Pressable
                          onPress={() => {
                            setEditId(c.id);
                            setName(c.name);
                          }}>
                          <Txt>
                            {c.name}
                            {c.archived ? ' · 已停用' : ''}
                          </Txt>
                        </Pressable>
                        <Pressable
                          onPress={() =>
                            update((d) => ({
                              ...d,
                              categories: d.categories.map((item) =>
                                item.id === c.id ? { ...item, archived: !item.archived } : item
                              ),
                            }))
                          }>
                          <Txt muted>{c.archived ? '启用' : '停用'}</Txt>
                        </Pressable>
                      </View>
                    ))}
                </>
              )}
              {panel === 'account' && (
                <Chips
                  value={option}
                  onChange={setOption}
                  items={[
                    { id: 'bank', name: '银行卡' },
                    { id: 'cash', name: '现金' },
                    { id: 'credit', name: '信用卡 / 负债' },
                  ]}
                />
              )}
              {panel === 'budget' && (
                <Chips
                  value={option}
                  onChange={setOption}
                  items={[
                    { id: 'total', name: '总预算' },
                    ...data.categories.filter((c) => c.type === 'expense' && !c.archived),
                  ]}
                />
              )}
              {panel !== 'budget' && (
                <TextInput
                  accessibilityLabel={
                    panel === 'restore' ? '备份 JSON 内容' : panel === 'csv' ? 'CSV 内容' : '名称'
                  }
                  placeholder={
                    panel === 'restore'
                      ? '粘贴完整 JSON 备份内容'
                      : panel === 'csv'
                        ? '粘贴简账 CSV 内容'
                        : '名称（最多 40 字）'
                  }
                  placeholderTextColor={colors.muted}
                  maxLength={panel === 'restore' || panel === 'csv' ? 20_000_000 : 40}
                  multiline={panel === 'restore' || panel === 'csv'}
                  value={name}
                  onChangeText={(v) => {
                    setName(v);
                    setConfirmRestore(false);
                  }}
                  style={[
                    inputStyle,
                    (panel === 'restore' || panel === 'csv') && {
                      minHeight: 220,
                      textAlignVertical: 'top',
                    },
                  ]}
                />
              )}
              {(panel === 'budget' || panel === 'account') && (
                <>
                  <Txt muted>{panel === 'account' ? '期初余额（负债请输入负数）' : '预算金额'}</Txt>
                  <TextInput
                    accessibilityLabel="金额"
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    placeholderTextColor={colors.muted}
                    keyboardType={panel === 'account' ? 'numbers-and-punctuation' : 'decimal-pad'}
                    style={inputStyle}
                  />
                </>
              )}
              {confirmRestore && panel === 'restore' && (
                <Text style={{ color: '#C16B53' }}>
                  恢复将替换本机全部记账数据。请先导出当前备份，确认后再次点击恢复。
                </Text>
              )}
              {!!error && (
                <Text accessibilityRole="alert" style={{ color: '#C16B53' }}>
                  {error}
                </Text>
              )}
              <Action
                label={
                  panel === 'restore'
                    ? confirmRestore
                      ? '确认替换并恢复'
                      : '校验并准备恢复'
                    : panel === 'csv'
                      ? confirmRestore
                        ? '确认导入'
                        : '预览导入'
                      : '保存'
                }
                onPress={savePanel}
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
      {editing && (
        <EntryEditor
          entry={editing === 'new' ? undefined : editing}
          date={day || localDate()}
          onClose={() => setEditing(null)}
        />
      )}
    </SafeAreaView>
  );
}

function EntryEditor({
  entry,
  date,
  onClose,
}: {
  entry?: Entry;
  date: string;
  onClose: () => void;
}) {
  const data = useLedgerStore((s) => s.data);
  const dark = data.settings.theme === 'dark',
    bg = dark ? '#171918' : '#F8F7F3',
    fg = dark ? '#F6F4ED' : '#242A26',
    muted = dark ? '#ACB5AD' : '#758078';
  const [type, setType] = useState<EntryType>(entry?.type ?? 'expense');
  const [original, setOriginal] = useState<Entry['original']>(entry?.original);
  const [advanced, setAdvanced] = useState(!!entry?.original || !!entry?.attachments?.length);
  const privacyVisible = React.useContext(PrivacyVisibilityContext);
  const [attachments, setAttachments] = useState<NonNullable<Entry['attachments']>>(
    entry?.attachments ?? []
  );
  const [amount, setAmount] = useState(entry ? (entry.cents / 100).toFixed(2) : '');
  const [categoryId, setCategory] = useState(
    entry?.categoryId ?? data.categories.find((c) => c.type === 'expense' && !c.archived)?.id ?? ''
  );
  const [accountId, setAccount] = useState(entry?.accountId ?? data.accounts[0]?.id ?? '');
  const [toAccountId, setToAccount] = useState(entry?.toAccountId ?? '');
  const [entryDate, setDate] = useState(entry?.date ?? date),
    [note, setNote] = useState(entry?.note ?? ''),
    [tags, setTags] = useState(entry?.tags.join(' ') ?? '');
  const [frequency, setFrequency] = useState('none'),
    [error, setError] = useState(''),
    [deleting, setDeleting] = useState(false);
  const [calc, setCalc] = useState(''),
    [pending, setPending] = useState<'+' | '-' | null>(null);
  function save() {
    try {
      const next: Entry = {
        id: entry?.id ?? newId(),
        bookId: entry?.bookId ?? data.activeBookId,
        type,
        cents: cents(amount),
        categoryId: type === 'transfer' ? '' : categoryId,
        accountId,
        toAccountId: type === 'transfer' ? toAccountId : undefined,
        date: entryDate,
        note: note.trim(),
        tags: [...new Set(tags.split(/\s+/).filter(Boolean))],
        updatedAt: new Date().toISOString(),
        recurringKey: entry?.recurringKey,
        attachments,
        original,
      };
      useLedgerStore.getState().saveEntry(next);
      if (!entry && frequency !== 'none') {
        useLedgerStore.getState().addRecurring({
          id: newId(),
          template: next,
          frequency: frequency as 'daily' | 'weekly' | 'monthly',
          nextDate: entryDate,
          day: Number(entryDate.slice(-2)),
          enabled: true,
        });
        // The initial record already exists. Advance the rule before materializing future instances.
        useLedgerStore.getState().setData((d) => ({
          ...d,
          entries: d.entries.map((e) =>
            e.id === next.id
              ? { ...e, recurringKey: `${d.recurring[d.recurring.length - 1].id}:${entryDate}` }
              : e
          ),
        }));
        useLedgerStore.getState().tick();
      }
      onClose();
    } catch (e) {
      setError(fail(e));
    }
  }
  function calculate() {
    try {
      const left = cents(calc, true),
        right = cents(amount, true);
      const result = pending === '+' ? left + right : left - right;
      if (result <= 0 || result > 99999999999) throw new Error('计算结果必须大于 0 且不超过上限');
      setAmount((result / 100).toFixed(2));
      setPending(null);
      setCalc('');
    } catch (e) {
      setError(fail(e));
    }
  }
  const select = (
    items: { id: string; name: string }[],
    value: string,
    change: (id: string) => void
  ) => (
    <View style={styles.wrap}>
      {items.map((item) => (
        <Pressable
          key={item.id}
          onPress={() => change(item.id)}
          accessibilityRole="button"
          accessibilityState={{ selected: item.id === value }}
          style={[
            styles.chip,
            {
              backgroundColor: item.id === value ? data.settings.accent : dark ? '#222623' : '#FFF',
              borderColor: dark ? '#38413A' : '#E9EBE4',
            },
          ]}>
          <Text style={{ color: item.id === value ? '#242A26' : fg }}>{item.name}</Text>
        </Pressable>
      ))}
    </View>
  );
  const label = (text: string) => <Text style={{ color: muted, marginTop: 12 }}>{text}</Text>;
  const input = (
    value: string,
    change: (v: string) => void,
    placeholder: string,
    numeric = false
  ) => (
    <TextInput
      accessibilityLabel={placeholder}
      placeholder={placeholder}
      placeholderTextColor={muted}
      value={value}
      onChangeText={change}
      keyboardType={numeric ? 'decimal-pad' : 'default'}
      style={[styles.input, { color: fg, borderColor: dark ? '#38413A' : '#DDE1D9' }]}
    />
  );
  return (
    <Modal visible={privacyVisible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
            <View style={styles.between}>
              <Text style={{ color: fg, fontSize: 23, fontWeight: '800' }}>
                {entry ? '编辑账单' : '记一笔'}
              </Text>
              <Pressable accessibilityLabel="取消记账" onPress={onClose}>
                <X color={fg} />
              </Pressable>
            </View>
            {select(
              [
                { id: 'expense', name: '支出' },
                { id: 'income', name: '收入' },
                { id: 'transfer', name: '转账' },
              ],
              type,
              (value) => {
                setType(value as EntryType);
                setCategory(data.categories.find((c) => c.type === value && !c.archived)?.id ?? '');
              }
            )}
            {label('金额 · CNY')}
            {pending && label(`${calc} ${pending}`)}
            {input(amount, setAmount, '0.00', true)}
            <View style={styles.wrap}>
              {(['+', '-'] as const).map((op) => (
                <Pressable
                  key={op}
                  style={styles.chip}
                  onPress={() => {
                    setCalc(amount || '0');
                    setAmount('');
                    setPending(op);
                  }}>
                  <Text style={{ color: fg }}>{op}</Text>
                </Pressable>
              ))}
              {pending && (
                <Pressable style={styles.chip} onPress={calculate}>
                  <Text style={{ color: fg }}>=</Text>
                </Pressable>
              )}
            </View>
            {type !== 'transfer' && (
              <>
                {label('分类')}
                {select(
                  data.categories.filter(
                    (c) => c.type === type && (!c.archived || c.id === categoryId)
                  ),
                  categoryId,
                  setCategory
                )}
              </>
            )}
            {label(type === 'transfer' ? '转出账户' : '账户')}
            {select(data.accounts, accountId, setAccount)}
            {type === 'transfer' && (
              <>
                {label('转入账户')}
                {select(
                  data.accounts.filter((a) => a.id !== accountId),
                  toAccountId,
                  setToAccount
                )}
              </>
            )}
            {label('记账日期')}
            {input(entryDate, setDate, 'YYYY-MM-DD')}
            {label('备注')}
            {input(note, setNote, '这笔钱花在哪里了？')}
            {note.length > 0 &&
              select(
                [
                  ...new Set(
                    data.entries
                      .filter(
                        (e) =>
                          !e.deletedAt &&
                          e.bookId === data.activeBookId &&
                          e.note.includes(note) &&
                          e.note !== note
                      )
                      .map((e) => e.note)
                  ),
                ]
                  .slice(0, 4)
                  .map((n) => ({ id: n, name: n })),
                note,
                setNote
              )}
            {label('标签（用空格分隔）')}
            {input(tags, setTags, '例如 旅行 家庭')}
            {!entry && (
              <>
                {label('周期记账')}
                {select(
                  [
                    { id: 'none', name: '不重复' },
                    { id: 'daily', name: '每日' },
                    { id: 'weekly', name: '每周' },
                    { id: 'monthly', name: '每月' },
                  ],
                  frequency,
                  setFrequency
                )}
              </>
            )}
            <Pressable onPress={() => setAdvanced((v) => !v)} accessibilityRole="button">
              <Text style={{ color: muted }}>
                {advanced ? '收起更多功能' : '更多：原币、票据、语音与支付草稿'}
              </Text>
            </Pressable>
            {advanced && (
              <>
                <CurrencyInput
                  value={original}
                  onChange={(value, converted) => {
                    setOriginal(value);
                    if (converted !== undefined) setAmount((converted / 100).toFixed(2));
                  }}
                />
                <ReceiptTools
                  value={attachments}
                  onChange={setAttachments}
                  onDraft={(draft) => {
                    const nextType = draft.type === 1 ? 'expense' : 'income';
                    setType(nextType);
                    setAmount(String(draft.amount));
                    setDate(draft.recordDate);
                    setNote(draft.remark);
                    const names: Record<string, string> = {
                      food: '餐饮',
                      transport: '交通',
                      shopping: '购物',
                      housing: '住房',
                      entertainment: '娱乐',
                      medical: '医疗',
                      education: '教育',
                      social: '人情',
                      other: nextType === 'expense' ? '其他支出' : '其他收入',
                      salary: '工资',
                      investment: '理财',
                      redpacket: '其他收入',
                    };
                    setCategory(
                      data.categories.find(
                        (c) =>
                          c.type === nextType && c.name === names[draft.category] && !c.archived
                      )?.id ??
                        data.categories.find((c) => c.type === nextType && !c.archived)?.id ??
                        ''
                    );
                  }}
                />
              </>
            )}
            {!!error && (
              <Text accessibilityRole="alert" style={{ color: '#C16B53' }}>
                {error}
              </Text>
            )}

            {entry && (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  if (!deleting) {
                    setDeleting(true);
                    return;
                  }
                  useLedgerStore.getState().deleteEntry(entry.id);
                  onClose();
                }}
                style={[styles.action, { borderWidth: 1, borderColor: '#C16B53' }]}>
                <Text style={{ color: '#C16B53' }}>
                  {deleting ? '再次点击，确认删除此账单' : '删除账单'}
                </Text>
              </Pressable>
            )}
          </ScrollView>
          <View style={{ paddingHorizontal: 22, paddingVertical: 12, backgroundColor: bg }}>
            <Pressable
              accessibilityRole="button"
              onPress={save}
              style={[styles.action, { backgroundColor: data.settings.accent }]}>
              <Text style={{ color: '#242A26', fontSize: 17, fontWeight: '700' }}>保存账单</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  text: { fontSize: 14, lineHeight: 21 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 17,
    paddingHorizontal: 22,
    paddingVertical: 16,
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 960,
    alignSelf: 'center',
    padding: 22,
    paddingBottom: 42,
    gap: 16,
  },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  monthBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    marginBottom: 2,
  },
  hero: { padding: 24, borderRadius: 22, gap: 14 },
  heroLabel: { color: '#3C3828', fontSize: 13 },
  heroAmount: {
    color: '#242A26',
    fontSize: 42,
    lineHeight: 52,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#DDD',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  panel: { padding: 20, borderRadius: 18, gap: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 18 },
  categoryIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { paddingVertical: 50, alignItems: 'center', gap: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '700', lineHeight: 27 },
  track: { height: 5, borderRadius: 3, overflow: 'hidden' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  calendarDay: {
    width: '12%',
    minWidth: 34,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  action: {
    paddingHorizontal: 22,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 17, minHeight: 50 },
  addBar: { alignItems: 'center', paddingVertical: 10 },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    paddingHorizontal: 42,
    borderRadius: 30,
  },
  bottom: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
    paddingBottom: 7,
  },
  tab: { flex: 1, alignItems: 'center', gap: 4, minHeight: 51 },
});
