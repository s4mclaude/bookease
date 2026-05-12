import { neon } from '@neondatabase/serverless'

const _sql = neon(process.env.DATABASE_URL!)

function sql<T = any>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<T[]> {
  return _sql(strings, ...values) as unknown as Promise<T[]>
}

sql.transaction = _sql.transaction.bind(_sql)

export default sql
