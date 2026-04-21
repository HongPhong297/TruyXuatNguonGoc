/**
 * Realtime publish — SERVER ONLY (dùng admin client)
 * File này chỉ import trong Server Actions, không bao giờ trong Client Components
 */
import { createAdminClient } from '@/lib/supabase'
import type { NotificationPayload } from '@/lib/notification-types'
import { REALTIME_CHANNEL } from '@/lib/notification-types'

/**
 * Fire-and-forget — không throw nếu Realtime unavailable
 */
export async function publishNotification(payload: Omit<NotificationPayload, 'timestamp'>) {
  try {
    const supabase = createAdminClient()
    await supabase.channel(REALTIME_CHANNEL).send({
      type: 'broadcast',
      event: payload.event,
      payload: { ...payload, timestamp: new Date().toISOString() },
    })
  } catch {
    // Non-critical
  }
}
