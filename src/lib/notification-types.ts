/**
 * Shared notification types — không import server/client modules
 */
export type NotificationEvent =
  | 'harvest.created'
  | 'pack.created'
  | 'cert.expiring'

export interface NotificationPayload {
  event: NotificationEvent
  title: string
  body: string
  batchCode?: string
  qrCode?: string
  commodityId?: string
  timestamp: string
}

export const REALTIME_CHANNEL = 'agrichain-notifications'
