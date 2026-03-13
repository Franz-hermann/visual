import axios from "axios";

// const baseURL = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "");

export const api = axios.create({
  baseURL: ` https://judicable-poetically-aryanna.ngrok-free.dev/api`,
  timeout: 15000,
});

export async function getStats(day) {
  const { data } = await api.get("/stats", { params: day ? { day } : {} });
  return data?.data;
}

export async function getWorkLogs(day) {
  const { data } = await api.get("/work-logs", { params: day ? { day } : {} });
  return data?.data;
}

// 可选：如果后端存在该接口，用于 VIN->car_name 映射
export async function getCars() {
  const { data } = await api.get("/cars");
  // 兼容两种常见返回：
  // 1) 直接数组: [{ vin, car_name, ... }]
  // 2) 包裹结构: { code: 200, data: [...] }
  return data?.data ?? data;
}

export async function getWorkers() {
  const { data } = await api.get("/workers");
  return data?.data ?? data;
}

export async function assignWorker({ vin, worker_name }) {
  const { data } = await api.post("/assign-worker", { vin, worker_name });
  return data;
}
