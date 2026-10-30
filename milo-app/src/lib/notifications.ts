import { getNotifications, requestNotifications, setNotifications } from "./milo.ts";
export async function notificationSettings() { return getNotifications(); }
export async function enableNotifications(): Promise<boolean> {
  const permission = await requestNotifications();
  if (permission.granted) await setNotifications(true);
  return permission.granted;
}
export async function disableNotifications(): Promise<void> { await setNotifications(false); }
