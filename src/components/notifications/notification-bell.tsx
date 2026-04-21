/**
 * Notification Bell — subscribe Supabase Realtime, hiển thị badge + dropdown
 * Chỉ dùng trong Client Components (browser-side Realtime subscription)
 */
'use client'

import { useEffect, useState, useRef } from 'react'
import { subscribeNotifications } from '@/lib/realtime-client'
import type { NotificationPayload } from '@/lib/notification-types'
import { Bell } from 'lucide-react'

const MAX_NOTIFICATIONS = 20

const EVENT_ICONS: Record<string, string> = {
  'harvest.created': '🌱',
  'pack.created': '📦',
  'cert.expiring': '⚠️',
}

const COMMODITY_ICONS: Record<string, string> = {
  coffee: '☕', rice: '🌾', vegetable: '🥬',
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationPayload[]>([])
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Subscribe Supabase Realtime
    const unsubscribe = subscribeNotifications((payload) => {
      setNotifications(prev => [payload, ...prev].slice(0, MAX_NOTIFICATIONS))
      setUnread(u => u + 1)
    })
    return unsubscribe
  }, [])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleOpen() {
    setOpen(o => !o)
    setUnread(0)
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        title="Thông báo"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white rounded-xl border border-gray-200 shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <span className="font-semibold text-gray-800 text-sm">Thông báo</span>
            {notifications.length > 0 && (
              <button onClick={() => setNotifications([])} className="text-xs text-gray-400 hover:text-gray-600">
                Xóa tất cả
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Chưa có thông báo
              </div>
            ) : (
              notifications.map((n, i) => (
                <div key={i} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-2.5">
                    <span className="text-base mt-0.5 flex-shrink-0">
                      {COMMODITY_ICONS[n.commodityId ?? ''] ?? EVENT_ICONS[n.event] ?? '🔔'}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-800 text-sm">{n.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{n.body}</p>
                      {n.batchCode && (
                        <p className="font-mono text-xs text-green-600 mt-0.5">{n.batchCode}</p>
                      )}
                      {n.qrCode && (
                        <p className="font-mono text-xs text-amber-600 mt-0.5">{n.qrCode}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{formatTime(n.timestamp)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
