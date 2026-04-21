import neo4j from 'neo4j-driver'

async function main() {
  const uri = process.env.NEO4J_URI ?? ''
  const user = process.env.NEO4J_USERNAME ?? 'neo4j'
  const pass = process.env.NEO4J_PASSWORD ?? ''

  console.log('Testing NEO4J_URI:', uri.slice(0, 30) + '...')
  if (uri.includes('placeholder')) {
    console.log('⚠️  Still placeholder — please fill real credentials in .env.local')
    return
  }
  const driver = neo4j.driver(uri, neo4j.auth.basic(user, pass))
  try {
    await driver.verifyConnectivity()
    console.log('✅ Neo4j AuraDB connected successfully!')
    // Quick smoke test
    const session = driver.session()
    const result = await session.run('RETURN 1 AS n')
    await session.close()
    console.log('✅ Query OK — result:', result.records[0].get('n').toNumber())
  } catch(e: any) {
    console.error('❌ Neo4j error:', e.message?.slice(0, 200))
  } finally {
    await driver.close()
  }
}

main()
