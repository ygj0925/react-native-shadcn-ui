import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { remoteClient, saveRemoteSession, type RemoteSession } from './remote';

function validatePassword(password: string, confirmation: string) {
  if (!/^(?=.*[A-Za-z])(?=.*\d).{8,32}$/.test(password))
    throw new Error('密码需 8–32 个字符，至少包含字母和数字');
  if (password !== confirmation) throw new Error('两次输入的密码不一致');
}
function Field({
  value,
  change,
  label,
  secret = false,
}: {
  value: string;
  change: (s: string) => void;
  label: string;
  secret?: boolean;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={change}
      accessibilityLabel={label}
      placeholder={label}
      secureTextEntry={secret}
      autoCapitalize="none"
      style={{
        padding: 14,
        minHeight: 48,
        borderRadius: 12,
        backgroundColor: '#F8F7F3',
        color: '#242A26',
        borderColor: '#DDE1D9',
        borderWidth: 1,
      }}
    />
  );
}
export function AccountRecovery({ base, phone }: { base: string; phone: string }) {
  const [expanded, setExpanded] = useState(false),
    [code, setCode] = useState(''),
    [password, setPassword] = useState(''),
    [confirmation, setConfirmation] = useState(''),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false),
    [until, setUntil] = useState(0);
  async function run(task: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setMessage('');
    try {
      if (!/^1\d{10}$/.test(phone)) throw new Error('请先填写手机号');
      await task();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '请求失败');
    } finally {
      setBusy(false);
    }
  }
  return (
    <View style={{ gap: 12 }}>
      <Pressable onPress={() => setExpanded(!expanded)}>
        <Text style={{ color: '#536057' }}>忘记密码？</Text>
      </Pressable>
      {expanded && (
        <>
          <Field value={code} change={setCode} label="重置验证码" />
          <Field value={password} change={setPassword} label="新密码" secret />
          <Field value={confirmation} change={setConfirmation} label="确认新密码" secret />
          <Pressable
            disabled={busy}
            style={{ padding: 14 }}
            onPress={() =>
              run(async () => {
                if (Date.now() < until) throw new Error('请等待60秒再获取验证码');
                await remoteClient(base).accountRequest('/app/auth/sms-code', 'POST', {
                  phone,
                  scene: 'RESET',
                });
                setUntil(Date.now() + 60000);
                setMessage('重置验证码已发送');
              })
            }>
            <Text>发送重置验证码</Text>
          </Pressable>
          <Pressable
            disabled={busy}
            style={{ padding: 14, backgroundColor: '#E9B949', borderRadius: 12 }}
            onPress={() =>
              run(async () => {
                validatePassword(password, confirmation);
                if (!/^\d{6}$/.test(code)) throw new Error('请输入6位验证码');
                await remoteClient(base).accountRequest('/app/auth/reset-password', 'POST', {
                  phone,
                  code,
                  newPassword: password,
                });
                setPassword('');
                setConfirmation('');
                setCode('');
                setMessage('密码已重置，请使用新密码登录');
              })
            }>
            <Text>验证并重置密码</Text>
          </Pressable>
        </>
      )}
      {!!message && (
        <Text accessibilityRole="alert" style={{ color: '#53421B' }}>
          {message}
        </Text>
      )}
    </View>
  );
}
export function AccountSettings({
  base,
  session,
  onSession,
}: {
  base: string;
  session: RemoteSession;
  onSession: (s: RemoteSession | null) => void;
}) {
  const [nickname, setNickname] = useState(session.user.nickname),
    [oldPassword, setOldPassword] = useState(''),
    [password, setPassword] = useState(''),
    [confirmation, setConfirmation] = useState(''),
    [phone, setPhone] = useState(''),
    [code, setCode] = useState(''),
    [reason, setReason] = useState(''),
    [deleteText, setDeleteText] = useState('');
  const [expanded, setExpanded] = useState(false),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false),
    [until, setUntil] = useState(0);
  async function run(task: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setMessage('');
    try {
      await task();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '请求失败');
    } finally {
      setBusy(false);
    }
  }
  const request = () => remoteClient(base, session).accountRequest;
  const action = (label: string, task: () => Promise<void>, danger = false) => (
    <Pressable
      accessibilityRole="button"
      disabled={busy}
      onPress={() => run(task)}
      style={{
        padding: 14,
        borderRadius: 12,
        backgroundColor: danger ? '#FBE8E2' : '#E9B949',
        opacity: busy ? 0.5 : 1,
      }}>
      <Text style={{ color: '#242A26', fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
  return (
    <View style={{ padding: 20, backgroundColor: '#FFF', borderRadius: 18, gap: 14 }}>
      <Pressable onPress={() => setExpanded(!expanded)}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: '#242A26' }}>
          账号资料与安全 {expanded ? '⌃' : '⌄'}
        </Text>
      </Pressable>
      {expanded && (
        <>
          <Field value={nickname} change={setNickname} label="昵称（最多30字）" />
          {action('更新昵称', async () => {
            if (!nickname.trim() || nickname.trim().length > 30) throw new Error('昵称需1–30字');
            const user = await request()<RemoteSession['user']>('/app/auth/profile', 'PUT', {
              nickname: nickname.trim(),
            });
            const next = { ...session, user };
            await saveRemoteSession(base, next);
            onSession(next);
            setMessage('资料已更新');
          })}
          <Text style={{ color: '#536057', lineHeight: 22 }}>
            修改密码：已有密码填写当前密码；仅短信注册用户填写绑定手机号和验证码。
          </Text>
          <Field
            value={oldPassword}
            change={setOldPassword}
            label="当前密码（已设置密码时必填）"
            secret
          />
          <Field value={phone} change={setPhone} label="绑定手机号（首次设置密码）" />
          <Field value={code} change={setCode} label="短信验证码（首次设置密码）" />
          {action('获取首次设密验证码', async () => {
            if (!/^1\d{10}$/.test(phone)) throw new Error('请输入完整绑定手机号');
            if (Date.now() < until) throw new Error('请等待60秒再发送');
            await request()('/app/auth/sms-code', 'POST', { phone, scene: 'RESET' });
            setUntil(Date.now() + 60000);
            setMessage('验证码已发送');
          })}
          <Field
            value={password}
            change={setPassword}
            label="新密码（8–32位，字母和数字）"
            secret
          />
          <Field value={confirmation} change={setConfirmation} label="确认新密码" secret />
          {action('保存密码', async () => {
            validatePassword(password, confirmation);
            if (!oldPassword && (!/^1\d{10}$/.test(phone) || !/^\d{6}$/.test(code)))
              throw new Error('首次设置密码需绑定手机号和6位验证码');
            await request()('/app/auth/password', 'POST', {
              newPassword: password,
              ...(oldPassword ? { oldPassword } : { phone, code }),
            });
            setOldPassword('');
            setPassword('');
            setConfirmation('');
            setCode('');
            setMessage('密码已更新');
          })}
          <Text style={{ color: '#A04732', lineHeight: 22 }}>
            注销会影响此 App 账号在 guard-find-server
            的全部业务。服务端设有15日冷静期，期间重新登录可撤销；本机账本不会自动删除。请先备份。
          </Text>
          <Field value={reason} change={setReason} label="注销原因（最多200字）" />
          <Field value={deleteText} change={setDeleteText} label="输入 注销当前账号 确认" />
          {action(
            '提交注销申请',
            async () => {
              if (deleteText !== '注销当前账号') throw new Error('请填写确认文字');
              if (!reason.trim() || reason.length > 200) throw new Error('请填写1–200字注销原因');
              await request()('/app/auth/account', 'DELETE', { reason: reason.trim() });
              await saveRemoteSession(base, null);
              onSession(null);
            },
            true
          )}
        </>
      )}
      {!!message && (
        <Text accessibilityRole="alert" style={{ color: '#53421B', lineHeight: 22 }}>
          {message}
        </Text>
      )}
    </View>
  );
}
