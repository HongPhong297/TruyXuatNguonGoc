/**
 * Badge hiển thị chứng nhận (VietGAP, Organic, v.v.)
 */
import { ShieldCheck, ShieldAlert } from 'lucide-react'

interface CertBadgeProps {
  standard: string
  issuer?: string
  expiresDate?: string
}

const CERT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  VietGAP:           { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-300' },
  Organic:           { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300' },
  GlobalGAP:         { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-300' },
  SRP:               { bg: 'bg-cyan-50',   text: 'text-cyan-700',   border: 'border-cyan-300' },
  PGS:               { bg: 'bg-teal-50',   text: 'text-teal-700',   border: 'border-teal-300' },
  'Fair Trade':      { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-300' },
  'Rainforest Alliance': { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-300' },
  UTZ:               { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300' },
  default:           { bg: 'bg-gray-50',   text: 'text-gray-700',   border: 'border-gray-300' },
}

function isExpiringSoon(expiresDate?: string): boolean {
  if (!expiresDate) return false
  const diff = new Date(expiresDate).getTime() - Date.now()
  return diff < 30 * 24 * 60 * 60 * 1000 // 30 days
}

function isExpired(expiresDate?: string): boolean {
  if (!expiresDate) return false
  return new Date(expiresDate).getTime() < Date.now()
}

export default function CertBadge({ standard, issuer, expiresDate }: CertBadgeProps) {
  const style = CERT_COLORS[standard] ?? CERT_COLORS.default
  const expired = isExpired(expiresDate)
  const expiring = !expired && isExpiringSoon(expiresDate)

  return (
    <div className={`flex items-start gap-2 px-3 py-2.5 rounded-lg border ${style.bg} ${style.border} ${expired ? 'opacity-60' : ''}`}>
      {expired || expiring
        ? <ShieldAlert className={`w-4 h-4 mt-0.5 flex-shrink-0 ${expired ? 'text-red-500' : 'text-amber-500'}`} />
        : <ShieldCheck className={`w-4 h-4 mt-0.5 flex-shrink-0 ${style.text}`} />
      }
      <div>
        <p className={`font-semibold text-sm ${style.text}`}>{standard}</p>
        {issuer && <p className="text-xs text-gray-500 mt-0.5">{issuer}</p>}
        {expiresDate && (
          <p className={`text-xs mt-0.5 ${expired ? 'text-red-600' : expiring ? 'text-amber-600' : 'text-gray-400'}`}>
            {expired ? '⚠️ Đã hết hạn' : expiring ? `⏰ Hết hạn: ${expiresDate}` : `✓ Hạn: ${expiresDate}`}
          </p>
        )}
      </div>
    </div>
  )
}
