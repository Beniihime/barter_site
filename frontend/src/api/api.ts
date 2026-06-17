import axios from "axios";

export const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
  withCredentials: true,
});

export type Category = {
  id: number;
  name: string;
  description: string;
};

export type Ad = {
  id: number;
  user?: string;
  user_id?: number;
  title: string;
  description: string;
  ad_type: "exchange" | "free";
  item_condition: string;
  exchange_request: string;
  city: string;
  status: string;
  category: number;
  category_detail?: Category;
  images?: { id: number; image: string }[];
  created_at?: string;
  updated_at?: string;
};

export type UserProfile = {
  id: number;
  username: string;
  email: string;
  profile?: {
    full_name: string;
    phone: string;
    city: string;
    role?: { name: string; description: string };
  };
};

export type AdResponse = {
  id: number;
  ad: number;
  ad_title: string;
  user: string;
  text: string;
  status: string;
  created_at: string;
};

export type Message = {
  id: number;
  sender: string;
  sender_id: number;
  receiver: number;
  receiver_name: string;
  ad: number;
  ad_title: string;
  text: string;
  created_at: string;
  is_read: boolean;
};

export type Complaint = {
  id: number;
  user: string;
  ad: number;
  ad_title: string;
  reason: string;
  status: string;
  moderator_comment: string;
  created_at: string;
};

export async function getCategories() {
  const { data } = await api.get<Category[]>("categories/");
  return data;
}

export async function getAds(params?: Record<string, string>) {
  const { data } = await api.get<Ad[]>("ads/", { params });
  return data;
}

export async function createAd(payload: Partial<Ad>) {
  const { data } = await api.post<Ad>("ads/", payload);
  return data;
}

export async function updateAd(id: number, payload: Partial<Ad>) {
  const { data } = await api.patch<Ad>(`ads/${id}/`, payload);
  return data;
}

export async function deleteAd(id: number) {
  await api.delete(`ads/${id}/`);
}

export async function register(payload: {
  username: string;
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  city?: string;
}) {
  const { data } = await api.post<UserProfile>("auth/register/", payload);
  return data;
}

export async function login(username: string, password: string) {
  const { data } = await api.post<UserProfile>("auth/login/", { username, password });
  return data;
}

export async function logout() {
  await api.post("auth/logout/");
}

export async function getProfile() {
  const { data } = await api.get<UserProfile>("users/me/");
  return data;
}

export async function getMyAds() {
  const { data } = await api.get<Ad[]>("ads/my/");
  return data;
}

export async function getMyResponses() {
  const { data } = await api.get<AdResponse[]>("responses/my/");
  return data;
}

export async function getResponsesToMyAds() {
  const { data } = await api.get<AdResponse[]>("responses/to-my-ads/");
  return data;
}

export async function sendResponse(ad: number, text: string) {
  const { data } = await api.post<AdResponse>("responses/", { ad, text });
  return data;
}

export async function sendComplaint(ad: number, reason: string) {
  const { data } = await api.post<Complaint>("complaints/", { ad, reason });
  return data;
}

export async function getMessages() {
  const { data } = await api.get<Message[]>("messages/");
  return data;
}

export async function sendMessage(payload: { receiver: number; ad: number; text: string }) {
  const { data } = await api.post<Message>("messages/", payload);
  return data;
}

export async function getModerationQueue() {
  const { data } = await api.get<Ad[]>("moderation/");
  return data;
}

export async function moderateAd(id: number, action: "approve" | "reject" | "hide", comment = "") {
  const { data } = await api.post(`moderation/${id}/${action}/`, { comment });
  return data;
}

export async function getComplaints() {
  const { data } = await api.get<Complaint[]>("complaints/");
  return data;
}

export async function processComplaint(id: number, payload: { status: string; moderator_comment?: string }) {
  const { data } = await api.post<Complaint>(`complaints/${id}/process/`, payload);
  return data;
}

export function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (typeof data === "string") return data;
    if (data && typeof data === "object") {
      return Object.entries(data)
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`)
        .join("; ");
    }
    if (error.response?.status === 403) return "Нужно войти в систему.";
  }
  return "Не удалось выполнить действие.";
}
