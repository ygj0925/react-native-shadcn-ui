import { get, put, upload } from '@/lib/request';

export interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  avatar: string;
  phone: string;
  membership: string;
  createdAt: string;
}

export interface UpdateProfileParams {
  nickname?: string;
  phone?: string;
  avatar?: string;
}

export async function getUserProfile() {
  const res = await get<UserProfile>('/user/profile');
  return res.data;
}

export async function updateProfile(params: UpdateProfileParams) {
  const res = await put<UserProfile>('/user/profile', params, {
    showLoading: true,
  });
  return res.data;
}

export async function uploadAvatar(file: {
  uri: string;
  name: string;
  type: string;
}) {
  const formData = new FormData();
  formData.append('file', file as any);
  const res = await upload<{ url: string }>('/user/avatar', formData, {
    showLoading: true,
  });
  return res.data.url;
}
