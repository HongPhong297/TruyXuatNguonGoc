/**
 * Realtime subscribe — CLIENT ONLY (browser Supabase client)
 * Chỉ import trong Client Components ('use client')
 */
import { createClient } from '@supabase/supabase-js'
import type { NotificationPayload } from '@/lib/notification-types'
import { REALTIME_CHANNEL } from '@/lib/notification-types'

/** Subscribe notifications — trả về cleanup fn */
export function subscribeNotifications(
  onNotification: (payload: NotificationPayload) => void
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const channel = supabase
    .channel(REALTIME_CHANNEL)
    .on('broadcast', { event: 'harvest.created' }, ({ payload }) => onNotification(payload as NotificationPayload))
    .on('broadcast', { event: 'pack.created' },    ({ payload }) => onNotification(payload as NotificationPayload))
    .on('broadcast', { event: 'cert.expiring' },   ({ payload }) => onNotification(payload as NotificationPayload))
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}
