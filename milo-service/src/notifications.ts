// Notifications follow committed events and carry no task content. The native helper is only
// used in a packaged app, and never requests OS authorization on the service's behalf.
import { spawn } from 'node:child_process';
import type { DB, ServiceEvent } from './store.ts';
import { emit, getSetting, onEvent, setSetting } from './store.ts';
import { ValidationError } from './settings.ts';
export type NotificationKind = 'complete' | 'approval';
export function notificationKind(e: ServiceEvent): NotificationKind | null {
  if (e.type === 'approval.requested') return 'approval';
  if (e.type === 'task.status' && (e.data as { status?: unknown } | null)?.status === 'completed') return 'complete';
  return null;
}
export function notificationEnabled(db: DB): boolean { return getSetting<boolean>(db, 'notifications.enabled', false) === true; }
export function setNotificationEnabled(db: DB, value: unknown, available: boolean): boolean {
  if (typeof value !== 'boolean') throw new ValidationError('enabled must be boolean');
  if (value && !available) throw new ValidationError('Notifications require the packaged Milo app');
  setSetting(db, 'notifications.enabled', value);
  if (!value) setSetting(db, 'notifications.lastError', null);
  return value;
}
export function sendNative(helper: string, kind: NotificationKind | '--request'): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(helper, [kind], { stdio: ['ignore', 'ignore', 'pipe'] });
    let error = '';
    child.stderr.on('data', b => { error = (error + String(b)).slice(-2048); });
    child.once('error', reject);
    child.once('close', code => code === 0 ? resolve() : reject(new Error(code === 3 ? 'Notification permission was denied by macOS' : error.trim() || `Notification helper exited ${code}`)));
  });
}
export function listenForNotifications(db: DB, send: (kind: NotificationKind) => Promise<void>): () => void {
  return onEvent(event => {
    const kind = notificationKind(event);
    if (!kind || !notificationEnabled(db)) return;
    void send(kind).then(() => { try { if (notificationEnabled(db)) setSetting(db, 'notifications.lastError', null); } catch (e) { console.error('Could not clear notification failure:', (e as Error).message); } }).catch(error => {
      // Record delivery failures, but do not change the already committed task outcome.
      try { if (!notificationEnabled(db)) return; const message = String((error as Error).message).slice(0, 500); setSetting(db, 'notifications.lastError', message); emit(db, event.taskId, 'notification.failed', { kind, message }); }
      catch (e) { console.error('Could not record notification failure:', (e as Error).message); }
    });
  });
}
