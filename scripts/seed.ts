/**
 * Seed script — tạo dữ liệu mẫu cho 3 commodity trong Neo4j AuraDB
 *
 * Chạy: pnpm tsx --env-file .env.local scripts/seed.ts
 *
 * Tạo ra:
 *   - 3 Farmer + 3 Farm (1 per commodity)
 *   - 3 Facility (cooperative/mill/processor)
 *   - 1 Distributor, 1 Retailer
 *   - 3 chuỗi Product đầy đủ (cherry→green→roasted→packed cho cà phê, v.v.)
 *   - 3 RetailPack với QR code (CFE-DL-2026-PACK-001, RICE-ST-2026-PACK-001, VEG-DL-2026-PACK-001)
 *   - 3 Certification
 */
import neo4j from 'neo4j-driver'

/** Serialize object thành JSON string — Neo4j chỉ chấp nhận primitives */
const j = (obj: Record<string, unknown>) => JSON.stringify(obj)

const uri = process.env.NEO4J_URI ?? ''
const user = process.env.NEO4J_USERNAME ?? 'neo4j'
const pass = process.env.NEO4J_PASSWORD ?? ''

if (!uri || uri.includes('placeholder')) {
  console.error('❌ Set NEO4J_URI in .env.local first')
  process.exit(1)
}

const driver = neo4j.driver(uri, neo4j.auth.basic(user, pass))

async function run(cypher: string, params: Record<string, unknown> = {}) {
  const session = driver.session({ defaultAccessMode: neo4j.session.WRITE })
  try {
    return await session.run(cypher, params)
  } finally {
    await session.close()
  }
}

async function clearAll() {
  console.log('🗑️  Clearing existing data...')
  await run('MATCH (n) DETACH DELETE n')
}

async function createConstraints() {
  console.log('📐 Creating constraints + indexes...')
  const constraints = [
    'CREATE CONSTRAINT farmer_id IF NOT EXISTS FOR (f:Farmer) REQUIRE f.id IS UNIQUE',
    'CREATE CONSTRAINT farm_id IF NOT EXISTS FOR (f:Farm) REQUIRE f.id IS UNIQUE',
    'CREATE CONSTRAINT facility_id IF NOT EXISTS FOR (f:Facility) REQUIRE f.id IS UNIQUE',
    'CREATE CONSTRAINT distributor_id IF NOT EXISTS FOR (d:Distributor) REQUIRE d.id IS UNIQUE',
    'CREATE CONSTRAINT retailer_id IF NOT EXISTS FOR (r:Retailer) REQUIRE r.id IS UNIQUE',
    'CREATE CONSTRAINT product_id IF NOT EXISTS FOR (p:Product) REQUIRE p.id IS UNIQUE',
    'CREATE CONSTRAINT retail_pack_id IF NOT EXISTS FOR (r:RetailPack) REQUIRE r.id IS UNIQUE',
    'CREATE CONSTRAINT retail_pack_qr IF NOT EXISTS FOR (r:RetailPack) REQUIRE r.qr_code IS UNIQUE',
    'CREATE CONSTRAINT certification_id IF NOT EXISTS FOR (c:Certification) REQUIRE c.id IS UNIQUE',
    // Index hay dùng khi trace
    'CREATE INDEX product_commodity IF NOT EXISTS FOR (p:Product) ON (p.commodity_id)',
    'CREATE INDEX product_stage IF NOT EXISTS FOR (p:Product) ON (p.stage)',
  ]
  for (const c of constraints) {
    await run(c)
  }
}

async function seedCoffee() {
  console.log('☕ Seeding coffee chain (Đắk Lắk)...')

  await run(`
    MERGE (farmer:Farmer {id: 'farmer-cfe-001'})
    SET farmer += {name: 'Nguyễn Văn Hùng', phone: '0905123456', province: 'Đắk Lắk'}

    MERGE (farm:Farm {id: 'farm-cfe-001'})
    SET farm += {
      name: 'Vườn cà phê Hùng Robusta',
      commodity_id: 'coffee',
      lat: 12.6667, lng: 108.0500,
      altitude_m: 600,
      area_ha: 2.5,
      province: 'Đắk Lắk'
    }

    MERGE (cert:Certification {id: 'cert-cfe-001'})
    SET cert += {
      standard: 'VietGAP',
      issuer: 'Sở NN&PTNT Đắk Lắk',
      issued_date: '2025-03-01',
      expires_date: '2027-03-01'
    }

    MERGE (farmer)-[:OWNS]->(farm)
    MERGE (farm)-[:CERTIFIED_BY]->(cert)
  `)

  // Product chain: cherry → green → roasted — dùng params để truyền attributes (JSON string)
  await run(`
    MATCH (farm:Farm {id: 'farm-cfe-001'})

    MERGE (cherry:Product {id: 'prod-cfe-cherry-001'})
    SET cherry += {commodity_id: 'coffee', stage: 'cherry',
                  batch_code: 'CFE-DL-2026-CHERRY-001', attributes: $attrCherry}

    MERGE (green:Product {id: 'prod-cfe-green-001'})
    SET green += {commodity_id: 'coffee', stage: 'green',
                  batch_code: 'CFE-DL-2026-GREEN-001', attributes: $attrGreen}

    MERGE (roasted:Product {id: 'prod-cfe-roasted-001'})
    SET roasted += {commodity_id: 'coffee', stage: 'roasted',
                    batch_code: 'CFE-DL-2026-ROAST-001', attributes: $attrRoasted}

    MERGE (ev2:ProcessEvent {id: 'pe-cfe-process-001'})
    SET ev2 += {type: 'process', label: 'Sơ chế Honey', commodity_id: 'coffee',
                from_stage: 'cherry', to_stage: 'green', performed_at: '2026-01-25'}

    MERGE (ev3:ProcessEvent {id: 'pe-cfe-roast-001'})
    SET ev3 += {type: 'roast', label: 'Rang Medium', commodity_id: 'coffee',
                from_stage: 'green', to_stage: 'roasted', performed_at: '2026-02-10'}

    MERGE (farm)-[:PRODUCED]->(cherry)
    MERGE (cherry)-[:TRANSFORMED_BY]->(ev2)
    MERGE (ev2)-[:CREATED]->(green)
    MERGE (green)-[:TRANSFORMED_BY]->(ev3)
    MERGE (ev3)-[:CREATED]->(roasted)
  `, {
    attrCherry: j({variety: 'Robusta', weight_kg: 500, harvest_date: '2026-01-15', altitude_m: 600}),
    attrGreen: j({process_method: 'Honey', moisture_pct: 11.5, cupping_score: 84, screen_size: 16}),
    attrRoasted: j({roast_profile: 'Medium', roast_date: '2026-02-10', roast_level: 'City+', weight_loss_pct: 18}),
  })

  // Facility & distributor
  await run(`
    MERGE (coop:Facility {id: 'facility-cfe-001'})
    SET coop += {name: $coopName, type: 'cooperative',
                 lat: 12.7800, lng: 108.0100, province: 'Đắk Lắk', gln: '8936001000011'}

    MERGE (roaster:Facility {id: 'facility-cfe-002'})
    SET roaster += {name: $roasterName, type: 'roaster',
                    lat: 11.9400, lng: 108.4400, province: 'Lâm Đồng', gln: '8936001000022'}

    MERGE (dist:Distributor {id: 'dist-001'})
    SET dist += {name: 'Phân phối Nông Sản Việt', gln: '8936001000099'}

    MERGE (retailer:Retailer {id: 'retailer-001'})
    SET retailer += {name: 'Siêu thị Vinmart Hà Nội', store_type: 'supermarket',
                     lat: 21.0285, lng: 105.8542}

    WITH coop, roaster
    MATCH (ev2:ProcessEvent {id: 'pe-cfe-process-001'})
    MATCH (ev3:ProcessEvent {id: 'pe-cfe-roast-001'})
    MERGE (coop)-[:PERFORMED]->(ev2)
    MERGE (roaster)-[:PERFORMED]->(ev3)
  `, {
    coopName: "HTX Cà phê Ea H'leo",
    roasterName: "Xưởng rang K'Ho Coffee",
  })

  // RetailPack
  await run(`
    MATCH (roasted:Product {id: 'prod-cfe-roasted-001'})
    MATCH (dist:Distributor {id: 'dist-001'})
    MATCH (retailer:Retailer {id: 'retailer-001'})

    MERGE (pack:RetailPack {id: 'pack-cfe-001'})
    SET pack += {
      qr_code: 'CFE-DL-2026-PACK-001',
      sku: 'CFE-MEDIUM-250G',
      commodity_id: 'coffee',
      weight_g: 250,
      packaged_date: '2026-02-12',
      expiry_date: '2026-08-12'
    }

    MERGE (roasted)-[:PACKAGED_INTO]->(pack)
    MERGE (pack)-[:DISTRIBUTED_BY]->(dist)
    MERGE (pack)-[:SOLD_AT]->(retailer)
  `)

  console.log('  ✅ Coffee chain created — QR: CFE-DL-2026-PACK-001')
}

async function seedRice() {
  console.log('🌾 Seeding rice chain (Sóc Trăng)...')

  await run(`
    MERGE (farmer:Farmer {id: 'farmer-rice-001'})
    SET farmer += {name: 'Trần Thị Mai', phone: '0918234567', province: 'Sóc Trăng'}

    MERGE (farm:Farm {id: 'farm-rice-001'})
    SET farm += {
      name: 'Ruộng lúa ST25 Mỹ Xuyên',
      commodity_id: 'rice',
      lat: 9.6000, lng: 105.9700,
      area_ha: 5.0,
      province: 'Sóc Trăng'
    }

    MERGE (cert:Certification {id: 'cert-rice-001'})
    SET cert += {
      standard: 'VietGAP',
      issuer: 'Sở NN&PTNT Sóc Trăng',
      issued_date: '2025-06-01',
      expires_date: '2027-06-01'
    }

    MERGE (farmer)-[:OWNS]->(farm)
    MERGE (farm)-[:CERTIFIED_BY]->(cert)
  `)

  await run(`
    MATCH (farm:Farm {id: 'farm-rice-001'})

    MERGE (paddy:Product {id: 'prod-rice-paddy-001'})
    SET paddy += {commodity_id: 'rice', stage: 'paddy',
                  batch_code: 'RICE-ST-2026-PADDY-001', attributes: $attrPaddy}

    MERGE (milled:Product {id: 'prod-rice-milled-001'})
    SET milled += {commodity_id: 'rice', stage: 'milled',
                   batch_code: 'RICE-ST-2026-MILLED-001', attributes: $attrMilled}

    MERGE (ev2:ProcessEvent {id: 'pe-rice-mill-001'})
    SET ev2 += {type: 'mill', label: 'Xay xát', commodity_id: 'rice',
                from_stage: 'paddy', to_stage: 'milled', performed_at: '2026-02-05'}

    MERGE (farm)-[:PRODUCED]->(paddy)
    MERGE (paddy)-[:TRANSFORMED_BY]->(ev2)
    MERGE (ev2)-[:CREATED]->(milled)
  `, {
    attrPaddy: j({variety: 'ST25', weight_kg: 2000, harvest_date: '2026-02-01', moisture_pct: 22}),
    attrMilled: j({polish_grade: 'Extra', broken_pct: 2, head_rice_pct: 95, milling_date: '2026-02-05'}),
  })

  await run(`
    MERGE (mill:Facility {id: 'facility-rice-001'})
    SET mill += {
      name: 'Nhà máy xay xát Thoại Ngọc Hầu', type: 'mill',
      lat: 10.5500, lng: 105.4000, province: 'An Giang',
      gln: '8936001000033'
    }

    MATCH (ev2:ProcessEvent {id: 'pe-rice-mill-001'})
    MERGE (mill)-[:PERFORMED]->(ev2)
  `)

  await run(`
    MATCH (milled:Product {id: 'prod-rice-milled-001'})
    MATCH (dist:Distributor {id: 'dist-001'})
    MATCH (retailer:Retailer {id: 'retailer-001'})

    MERGE (pack:RetailPack {id: 'pack-rice-001'})
    SET pack += {
      qr_code: 'RICE-ST-2026-PACK-001',
      sku: 'RICE-ST25-5KG',
      commodity_id: 'rice',
      weight_g: 5000,
      packaged_date: '2026-02-07',
      expiry_date: '2026-08-07'
    }

    MERGE (milled)-[:PACKAGED_INTO]->(pack)
    MERGE (pack)-[:DISTRIBUTED_BY]->(dist)
    MERGE (pack)-[:SOLD_AT]->(retailer)
  `)

  console.log('  ✅ Rice chain created — QR: RICE-ST-2026-PACK-001')
}

async function seedVegetable() {
  console.log('🥬 Seeding vegetable chain (Đà Lạt)...')

  await run(`
    MERGE (farmer:Farmer {id: 'farmer-veg-001'})
    SET farmer += {name: 'Lê Thị Bình', phone: '0933345678', province: 'Lâm Đồng'}

    MERGE (farm:Farm {id: 'farm-veg-001'})
    SET farm += {
      name: 'Vườn rau hữu cơ Bình Đà Lạt',
      commodity_id: 'vegetable',
      lat: 11.9404, lng: 108.4580,
      altitude_m: 1500,
      area_ha: 0.8,
      province: 'Lâm Đồng'
    }

    MERGE (cert:Certification {id: 'cert-veg-001'})
    SET cert += {
      standard: 'Organic',
      issuer: 'Tổ chức chứng nhận hữu cơ Việt Nam',
      issued_date: '2025-09-01',
      expires_date: '2026-09-01'
    }

    MERGE (farmer)-[:OWNS]->(farm)
    MERGE (farm)-[:CERTIFIED_BY]->(cert)
  `)

  await run(`
    MATCH (farm:Farm {id: 'farm-veg-001'})

    MERGE (raw:Product {id: 'prod-veg-raw-001'})
    SET raw += {commodity_id: 'vegetable', stage: 'raw',
                batch_code: 'VEG-DL-2026-RAW-001', attributes: $attrRaw}

    MERGE (washed:Product {id: 'prod-veg-washed-001'})
    SET washed += {commodity_id: 'vegetable', stage: 'washed',
                   batch_code: 'VEG-DL-2026-WASHED-001', attributes: $attrWashed}

    MERGE (ev2:ProcessEvent {id: 'pe-veg-wash-001'})
    SET ev2 += {type: 'wash', label: 'Sơ chế Ozone', commodity_id: 'vegetable',
                from_stage: 'raw', to_stage: 'washed', performed_at: '2026-04-18'}

    MERGE (farm)-[:PRODUCED]->(raw)
    MERGE (raw)-[:TRANSFORMED_BY]->(ev2)
    MERGE (ev2)-[:CREATED]->(washed)
  `, {
    attrRaw: j({variety: 'Cải thảo hữu cơ', weight_kg: 80, harvest_date: '2026-04-18', field_id: 'F-DL-A3'}),
    attrWashed: j({wash_method: 'Ozone water', wash_date: '2026-04-18', weight_after_kg: 76}),
  })

  await run(`
    MERGE (processor:Facility {id: 'facility-veg-001'})
    SET processor += {
      name: 'Sơ chế rau Đà Lạt GAP', type: 'processor',
      lat: 11.9350, lng: 108.4500, province: 'Lâm Đồng',
      gln: '8936001000044'
    }

    MATCH (ev2:ProcessEvent {id: 'pe-veg-wash-001'})
    MERGE (processor)-[:PERFORMED]->(ev2)
  `)

  await run(`
    MATCH (washed:Product {id: 'prod-veg-washed-001'})
    MATCH (dist:Distributor {id: 'dist-001'})
    MATCH (retailer:Retailer {id: 'retailer-001'})

    MERGE (pack:RetailPack {id: 'pack-veg-001'})
    SET pack += {
      qr_code: 'VEG-DL-2026-PACK-001',
      sku: 'VEG-CABBAGE-ORG-500G',
      commodity_id: 'vegetable',
      weight_g: 500,
      packaged_date: '2026-04-18',
      expiry_date: '2026-04-23'
    }

    MERGE (washed)-[:PACKAGED_INTO]->(pack)
    MERGE (pack)-[:DISTRIBUTED_BY]->(dist)
    MERGE (pack)-[:SOLD_AT]->(retailer)
  `)

  console.log('  ✅ Vegetable chain created — QR: VEG-DL-2026-PACK-001')
}

async function verifyData() {
  console.log('\n🔍 Verifying seed data...')
  const session = driver.session({ defaultAccessMode: neo4j.session.READ })
  try {
    // Count nodes
    const counts = await session.run(`
      MATCH (n) RETURN labels(n)[0] AS label, count(n) AS count
      ORDER BY count DESC
    `)
    console.log('  Node counts:')
    counts.records.forEach(r => {
      console.log(`    ${r.get('label')}: ${r.get('count')}`)
    })

    // Test trace query — đi xuôi từ pack → product → farm
    const trace = await session.run(`
      MATCH (pack:RetailPack {qr_code: $qr})<-[:PACKAGED_INTO]-(p:Product)
      MATCH (farm:Farm)-[:PRODUCED]->(origin:Product)
      WHERE origin.commodity_id = p.commodity_id
      OPTIONAL MATCH (farm)-[:CERTIFIED_BY]->(cert:Certification)
      RETURN pack.qr_code AS qr, farm.name AS farm, cert.standard AS cert
      LIMIT 1
    `, { qr: 'CFE-DL-2026-PACK-001' })

    if (trace.records.length > 0) {
      const r = trace.records[0]
      console.log(`\n  ✅ Trace query OK:`)
      console.log(`    QR: ${r.get('qr')}`)
      console.log(`    Farm: ${r.get('farm')}`)
      console.log(`    Cert: ${r.get('cert')}`)
    } else {
      console.log('  ⚠️  Trace query returned no results — check relationships')
    }
  } finally {
    await session.close()
  }
}

async function main() {
  console.log('🌿 Starting seed script...\n')
  try {
    await driver.verifyConnectivity()
    console.log('✅ Connected to Neo4j AuraDB\n')

    await clearAll()
    await createConstraints()
    await seedCoffee()
    await seedRice()
    await seedVegetable()
    await verifyData()

    console.log('\n✅ Seed complete!')
    console.log('  Test QR codes:')
    console.log('    ☕ Coffee:    CFE-DL-2026-PACK-001')
    console.log('    🌾 Rice:     RICE-ST-2026-PACK-001')
    console.log('    🥬 Vegetable: VEG-DL-2026-PACK-001')
  } catch (e: any) {
    console.error('❌ Seed failed:', e.message)
    process.exit(1)
  } finally {
    await driver.close()
  }
}

main()
