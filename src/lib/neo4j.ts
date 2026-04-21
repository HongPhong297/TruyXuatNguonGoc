/**
 * Neo4j driver singleton và query helper
 * Dùng Application Default Credentials qua env vars
 */
import neo4j, { Driver, Session, QueryResult, Integer, isInt } from 'neo4j-driver';

// Singleton driver — tái sử dụng giữa các requests (Next.js hot reload safe)
let _driver: Driver | null = null;

function getDriver(): Driver {
  if (_driver) return _driver;

  const uri = process.env.NEO4J_URI;
  const user = process.env.NEO4J_USERNAME;
  const password = process.env.NEO4J_PASSWORD;

  if (!uri || !user || !password) {
    throw new Error(
      'Missing Neo4j env vars: NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD'
    );
  }

  _driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
    maxConnectionPoolSize: 10,
    connectionAcquisitionTimeout: 5000,
  });

  return _driver;
}

/**
 * Chuyển đệ quy Neo4j types → plain JS để an toàn khi pass Server→Client
 * Neo4j Integer {low, high} → number
 * Neo4j Node/Relationship → plain object (properties only)
 */
function toPlain(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  // Neo4j Integer → JS number
  if (isInt(value)) return (value as Integer).toNumber();

  // Array
  if (Array.isArray(value)) return value.map(toPlain);

  // Neo4j Node — có .properties
  if (
    typeof value === 'object' &&
    value !== null &&
    'properties' in value &&
    'labels' in value
  ) {
    return toPlain((value as { properties: unknown }).properties);
  }

  // Neo4j Relationship — có .properties
  if (
    typeof value === 'object' &&
    value !== null &&
    'properties' in value &&
    'type' in value &&
    'start' in value
  ) {
    return toPlain((value as { properties: unknown }).properties);
  }

  // Plain object — recurse
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = toPlain(v);
    }
    return out;
  }

  return value;
}

/**
 * Chạy một Cypher query và trả về danh sách records (plain JS objects)
 * @param cypher - Cypher query string
 * @param params - Tham số truyền vào query
 * @param mode - 'READ' hoặc 'WRITE' (default: 'READ')
 */
export async function runQuery<T = Record<string, unknown>>(
  cypher: string,
  params: Record<string, unknown> = {},
  mode: 'READ' | 'WRITE' = 'READ'
): Promise<T[]> {
  const driver = getDriver();
  const session: Session = driver.session({
    defaultAccessMode: mode === 'READ' ? neo4j.session.READ : neo4j.session.WRITE,
  });

  try {
    const result: QueryResult = await session.run(cypher, params);
    // toObject() sau đó toPlain() để đảm bảo không còn Neo4j class instances
    return result.records.map((record) => toPlain(record.toObject()) as T);
  } finally {
    await session.close();
  }
}

/**
 * Kiểm tra kết nối Neo4j — dùng ở health check hoặc startup
 */
export async function verifyConnectivity(): Promise<boolean> {
  try {
    const driver = getDriver();
    await driver.verifyConnectivity();
    return true;
  } catch {
    return false;
  }
}

// Export driver để dùng advanced cases (transactions, etc.)
export { getDriver };
