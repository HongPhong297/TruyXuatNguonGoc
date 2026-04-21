# 🌿 Truy Xuất Nguồn Gốc Nông Sản — Agri Traceability

> **Hệ thống truy xuất nguồn gốc minh bạch từ nông trại đến bàn ăn**
> Cà phê · Gạo · Rau sạch Việt Nam — QR code · Graph database · Realtime alerts

---

## ✨ Tính năng

| Feature | Mô tả |
|---------|-------|
| 🔍 **Trace QR** | Quét/nhập mã lô → xem đồ thị hành trình (Cytoscape.js) |
| 🌱 **Harvest Form** | Farmer ghi nhận thu hoạch → tạo Product node trong Neo4j |
| 🏭 **Process Form** | Facility ghi nhận chế biến → chain stage mới |
| 📦 **Pack + QR** | Distributor đóng gói → tạo RetailPack + QR code unique |
| 🔔 **Realtime** | Supabase Broadcast → toast notification khi lô mới |
| 📊 **Dashboard** | Recharts analytics — bar/pie/cert expiry charts |
| 🔐 **Auth** | Better Auth email/password · 4 roles |

---

## 🏗️ Tech Stack

```
Frontend   Next.js 16 (App Router) · TypeScript · Tailwind CSS
Graph DB   Neo4j AuraDB — Cypher queries, Cytoscape.js visualization  
Postgres   Supabase — Auth tables (Better Auth) + Realtime channels
Auth       Better Auth v1 — session cookie, 4 roles
Charts     Recharts 3
Deploy     Vercel (sin1 region)
```

---

## 🚀 Local Setup

### 1. Clone + Install

```bash
git clone https://github.com/your-username/suplichain.git
cd suplichain
pnpm install
```

### 2. Environment

```bash
cp .env.example .env.local
# Fill in your Neo4j, Supabase, Better Auth values
```

### 3. Database Migration

```bash
# Tạo Better Auth tables trong Supabase Postgres
pnpm tsx --env-file .env.local scripts/auth-migrate.ts

# Seed Neo4j với data demo
pnpm tsx --env-file .env.local scripts/seed.ts
```

### 4. Dev Server

```bash
pnpm dev
# http://localhost:3000
```

---

## 🗄️ Neo4j Graph Schema

```cypher
(:Farm)-[:PRODUCED]->(:Product {stage: 'cherry'})
(:Product)-[:TRANSFORMED_BY]->(:ProcessEvent)-[:CREATED]->(:Product {stage: 'roasted'})
(:Product)-[:PACKAGED_INTO]->(:RetailPack {qr_code: 'CFE-DL-2026-PACK-001'})
(:RetailPack)-[:DISTRIBUTED_BY]->(:Distributor)
(:Farm)-[:CERTIFIED_BY]->(:Certification {standard: 'VietGAP'})
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (public)/        # trace, login, unauthorized (no auth)
│   ├── (app)/           # dashboard, farmer, facility, distributor (auth required)
│   └── api/auth/        # Better Auth handler
├── lib/
│   ├── neo4j.ts         # Driver + toPlain() converter
│   ├── graph/           # queries, serialize, analytics, ingest-helpers
│   ├── commodities/     # coffee, rice, vegetable config
│   ├── auth.ts          # Better Auth server config
│   └── realtime-*.ts    # Supabase Realtime server/client split
├── components/
│   ├── graph/           # Cytoscape wrapper
│   ├── charts/          # Recharts wrappers
│   ├── forms/           # Harvest, Pack, DynamicFields
│   ├── trace/           # CertBadge, FarmInfoCard
│   ├── timeline/        # JourneyTimeline
│   └── notifications/   # NotificationBell, ToastListener
└── scripts/
    ├── seed.ts          # Neo4j seed data
    └── auth-migrate.ts  # Supabase tables
```

---

## 🌐 Deploy to Vercel

```bash
# 1. Push to GitHub
git push origin main

# 2. Import project at vercel.com
# 3. Add environment variables (xem .env.example)
# 4. Deploy!
```

> Đặt `BETTER_AUTH_URL` = `https://your-domain.vercel.app` sau khi deploy

---

## 🧪 Demo Accounts

Sau khi seed, đăng ký tài khoản mới tại `/login`:
- Email bất kỳ + mật khẩu 8+ ký tự
- Chọn role: Nông dân / Cơ sở / Phân phối

**Demo trace codes:**
```
CFE-DL-2026-PACK-001   ☕ Cà phê Đắk Lắk
RICE-ST-2026-PACK-001  🌾 Gạo ST25 Sóc Trăng
VEG-DL-2026-PACK-001   🥬 Rau hữu cơ Đà Lạt
```

---

## 📜 Standards Compliance

- **GS1 EPCIS 2.0** — Event-based traceability data model
- **FDA FSMA 204** — Food traceability rule (US)
- **EUDR** — EU Deforestation Regulation (supply chain due diligence)

---

*Built with ❤️ for Vietnamese agriculture transparency*
