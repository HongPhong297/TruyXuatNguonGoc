/**
 * Recharts wrapper — client component
 * Dùng dynamic import vì recharts cần window
 */
'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line,
} from 'recharts'

// ────────────────────────────────────────────────────────────────────────────
// Commodity bar chart — số lô theo commodity
// ────────────────────────────────────────────────────────────────────────────

interface CommodityData {
  name: string
  packs: number
  farms: number
  color: string
}

export function CommodityBarChart({ data }: { data: CommodityData[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="packs" name="Lô hàng" fill="#16a34a" radius={[4, 4, 0, 0]} />
        <Bar dataKey="farms" name="Nông trại" fill="#0891b2" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Pie chart — tỷ lệ theo commodity
// ────────────────────────────────────────────────────────────────────────────

interface PieData {
  name: string
  value: number
  color: string
}

export function CommodityPieChart({ data }: { data: PieData[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(val: any) => [`${val} lô (${total ? ((val / total) * 100).toFixed(1) : 0}%)`, '']}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Cert expiry timeline — horizontal bar hoặc simple list
// ────────────────────────────────────────────────────────────────────────────

interface CertData {
  name: string
  daysLeft: number
  standard: string
}

export function CertExpiryChart({ data }: { data: CertData[] }) {
  const chartData = data.map(d => ({
    name: d.name.length > 14 ? d.name.slice(0, 14) + '…' : d.name,
    daysLeft: d.daysLeft,
    standard: d.standard,
  }))

  return (
    <ResponsiveContainer width="100%" height={Math.max(120, data.length * 42)}>
      <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11 }} domain={[0, 365]} label={{ value: 'ngày', position: 'insideRight', offset: -5, fontSize: 10 }} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
        <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(val: any, _: any, item: any) => [`${val} ngày còn lại — ${item.payload?.standard ?? ''}`, '']}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
        <Bar dataKey="daysLeft" radius={[0, 4, 4, 0]}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.daysLeft < 30 ? '#ef4444' : entry.daysLeft < 90 ? '#f59e0b' : '#16a34a'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
