import React, { useEffect, useState } from 'react';
import { Platform, Pressable, Text, TextInput, View, AppState } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { loadRemoteSession, remoteClient } from './remote';
import { localDate, type Entry } from './domain';
import { PaymentDrafts } from './payment-drafts';

export type RecognizedDraft = {
  type: 1 | 2;
  amount: number;
  category: string;
  recordDate: string;
  remark: string;
};
async function api() {
  const saved = await loadRemoteSession();
  if (!saved) throw new Error('请先在云端页面登录App账号');
  return { saved, client: remoteClient(saved.base, saved.session) };
}
async function formFile(uri: string, name: string, mime: string) {
  const form = new FormData();
  if (Platform.OS === 'web') {
    const blob = await (await fetch(uri)).blob();
    const actualMime = mime.startsWith('audio/') ? blob.type.split(';')[0] || mime : mime;
    form.append(
      'file',
      new Blob([blob], { type: actualMime }),
      actualMime === 'audio/mp4' ? 'recording.m4a' : name
    );
  } else form.append('file', { uri, name, type: mime } as unknown as Blob);
  return form;
}
export function ReceiptTools({
  value,
  onChange,
  onDraft,
}: {
  value: NonNullable<Entry['attachments']>;
  onChange: (files: NonNullable<Entry['attachments']>) => void;
  onDraft: (draft: RecognizedDraft) => void;
}) {
  const [audioPending, setAudioPending] = useState(false);
  const [library, setLibrary] = useState<NonNullable<Entry['attachments']>>([]);
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(''),
    [text, setText] = useState(''),
    [draft, setDraft] = useState<RecognizedDraft | null>(null),
    [deleting, setDeleting] = useState(''),
    [consent, setConsent] = useState(false);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY),
    recording = useAudioRecorderState(recorder);
  useEffect(() => {
    const listener = AppState.addEventListener('change', (state) => {
      if (state !== 'active' && recorder.isRecording) {
        recorder.stop().catch(() => {});
        setMessage('进入后台，录音已停止');
      }
    });
    return () => listener.remove();
  }, [recorder]);
  async function run(task: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setMessage('');
    try {
      await task();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '操作失败');
    } finally {
      setBusy(false);
    }
  }
  const action = (label: string, task: () => Promise<void>) => (
    <Pressable
      disabled={busy}
      onPress={() => run(task)}
      style={{ padding: 12, borderRadius: 12, backgroundColor: '#EEE9DA' }}>
      <Text style={{ color: '#242A26' }}>{label}</Text>
    </Pressable>
  );
  async function recognize(receiptId?: string) {
    if (!consent) throw new Error('请先确认允许将所选内容发送到服务端配置的识别供应商');
    const { client } = await api();
    const result = await client.accountRequest<RecognizedDraft>(
      '/app/accounting/recognize',
      'POST',
      { receiptId, text: receiptId ? undefined : text, date: localDate() },
      70000
    );
    setDraft(result);
  }
  return (
    <View style={{ gap: 12, padding: 16, borderRadius: 16, backgroundColor: '#F0EEE4' }}>
      <Text style={{ fontSize: 18, fontWeight: '700', color: '#242A26' }}>票据与智能录入</Text>
      <PaymentDrafts onDraft={onDraft} />
      {action('选择已上传的票据（含未保存账单的上传）', async () => {
        const { client } = await api();
        setLibrary(await client.accountRequest('/app/accounting/receipts'));
      })}
      {library
        .filter((file) => !value.some((item) => item.id === file.id))
        .map((file) => (
          <View key={file.id} style={{ gap: 6 }}>
            <Text style={{ color: '#242A26' }}>{file.name}</Text>
            {action('关联此票据', async () => {
              if (value.length >= 5) throw new Error('每笔最多5个附件');
              onChange([...value, file]);
            })}
            {action(deleting === file.id ? '确认永久删除此原文件' : '删除此原文件', async () => {
              if (deleting !== file.id) {
                setDeleting(file.id);
                setMessage('删除后，所有账单和旧备份中的此票据引用都将不可用。请再次确认。');
                return;
              }
              const { client } = await api();
              await client.accountRequest(
                `/app/accounting/receipts/${encodeURIComponent(file.id)}`,
                'DELETE'
              );
              setLibrary((files) => files.filter((item) => item.id !== file.id));
              setDeleting('');
            })}
          </View>
        ))}
      <Text style={{ color: '#536057' }}>
        附件需登录，保存于私有接口。识别结果需确认后才填入账单；不会自动记账。
      </Text>
      {action('添加图片或PDF票据', async () => {
        if (value.length >= 5) throw new Error('每笔最多5个附件');
        const result = await DocumentPicker.getDocumentAsync({
          type: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
          copyToCacheDirectory: true,
        });
        if (result.canceled) return;
        const file = result.assets[0];
        if ((file.size ?? 0) > 5 * 1024 * 1024) throw new Error('票据不能超过5MB');
        const { client } = await api();
        const uploaded = await client.accountRequest<NonNullable<Entry['attachments']>[number]>(
          '/app/accounting/receipts',
          'POST',
          await formFile(file.uri, file.name, file.mimeType ?? 'application/octet-stream')
        );
        onChange([...value, uploaded]);
      })}
      {value.map((file) => (
        <View key={file.id} style={{ gap: 8 }}>
          <Text style={{ color: '#242A26' }}>{file.name}</Text>
          {action('查看 / 保存票据', async () => {
            const { saved } = await api();
            const response = await fetch(
              `${saved.base}/app/accounting/receipts/${encodeURIComponent(file.id)}`,
              { headers: { Authorization: `Bearer ${saved.session.token}` } }
            );
            if (!response.ok || response.headers.get('content-type')?.includes('application/json'))
              throw new Error('票据不可访问或登录过期');
            const bytes = new Uint8Array(await response.arrayBuffer());
            if (Platform.OS === 'web') {
              const url = URL.createObjectURL(new Blob([bytes], { type: file.mime }));
              const anchor = document.createElement('a');
              anchor.href = url;
              anchor.download = file.name;
              anchor.click();
              setTimeout(() => URL.revokeObjectURL(url), 1000);
            } else {
              const local = new File(
                Paths.cache,
                `receipt-${file.id}.${file.mime === 'application/pdf' ? 'pdf' : file.mime.split('/')[1]}`
              );
              local.write(bytes);
              if (!(await Sharing.isAvailableAsync()))
                throw new Error('当前设备不支持文件预览分享');
              await Sharing.shareAsync(local.uri, { mimeType: file.mime });
            }
          })}
          {file.mime.startsWith('image/') && action('识别这张票据', () => recognize(file.id))}
          {action(deleting === file.id ? '确认永久删除票据' : '删除票据附件', async () => {
            if (deleting !== file.id) {
              setDeleting(file.id);
              setMessage('再次点击将删除云端原文件，其他设备及旧备份中的此附件也将不可用。');
              return;
            }
            const { client } = await api();
            await client.accountRequest(
              `/app/accounting/receipts/${encodeURIComponent(file.id)}`,
              'DELETE'
            );
            onChange(value.filter((item) => item.id !== file.id));
            setDeleting('');
          })}
        </View>
      ))}
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: consent }}
        onPress={() => setConsent(!consent)}>
        <Text style={{ color: '#536057' }}>
          {consent ? '☑' : '☐'} 允许将本次图片/语音/描述发送至服务端识别供应商
        </Text>
      </Pressable>
      <TextInput
        value={text}
        onChangeText={setText}
        maxLength={4000}
        placeholder="例如：今天午餐花了35元"
        accessibilityLabel="消费描述"
        style={{ backgroundColor: '#FFF', padding: 12, borderRadius: 10, color: '#242A26' }}
      />
      {action('从描述识别账单', () => recognize())}
      {action(
        recording.isRecording
          ? '停止录音并转写'
          : audioPending
            ? '转写刚才的录音'
            : '开始语音录入（最多60秒）',
        async () => {
          if (!consent) throw new Error('请先确认识别授权');
          if (recorder.isRecording || audioPending) {
            if (recorder.isRecording) await recorder.stop();
            if (!recorder.uri) throw new Error('录音文件不存在');
            const { client } = await api();
            const uri = recorder.uri;
            const mime = Platform.OS === 'web' ? 'audio/webm' : 'audio/mp4';
            const result = await client.accountRequest<{ text: string }>(
              '/app/accounting/transcribe',
              'POST',
              await formFile(uri, Platform.OS === 'web' ? 'recording.webm' : 'recording.m4a', mime),
              70000
            );
            setText(result.text);
            setAudioPending(false);
            await setAudioModeAsync({ allowsRecording: false });
            setMessage('转写已完成，请点击从描述识别账单或手动修改文字');
          } else {
            const permission = await AudioModule.requestRecordingPermissionsAsync();
            if (!permission.granted) throw new Error('未获得麦克风权限');
            await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
            await recorder.prepareToRecordAsync();
            recorder.record({ forDuration: 60 });
            setAudioPending(true);
          }
        }
      )}
      {draft && (
        <View style={{ gap: 10, padding: 12, backgroundColor: '#FFF', borderRadius: 12 }}>
          <Text style={{ color: '#242A26' }}>
            请核对：{draft.type === 1 ? '支出' : '收入'} ¥{draft.amount} · {draft.recordDate} ·{' '}
            {draft.remark}
          </Text>
          {action('确认填入表单（仍需保存账单）', async () => {
            onDraft(draft);
            setDraft(null);
          })}
          {action('丢弃识别结果', async () => setDraft(null))}
        </View>
      )}
      {!!message && (
        <Text accessibilityRole="alert" style={{ color: '#53421B' }}>
          {message}
        </Text>
      )}
    </View>
  );
}
