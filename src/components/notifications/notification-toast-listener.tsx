/**
 * Notification toast listener — subscribe Realtime → trigger Sonner toast
 * Mount component này 1 lần trong app layout (bên trong Client boundary)
 */
'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'
import { subscribeNotifications } from '@/lib/realtime-client'

const COMMODITY_ICONS: Record<string, string> = {
  coffee: '☕', rice: '🌾', vegetable: '🥬',
}

export default function NotificationToastListener() {
  useEffect(() => {
    const unsubscribe = subscribeNotifications((payload) => {
      const icon = COMMODITY_ICONS[payload.commodityId ?? ''] ?? '🔔'
      toast(payload.title, {
        description: payload.body,
        icon,
        duration: 5000,
        position: 'bottom-right',
      })
    })
    return unsubscribe
  }, [])

  return null  // Không render gì — chỉ side effect
}
