
import { PrismaClient } from './prisma/generated/prisma/index.js'
import pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import * as dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL || ''
const pool = new pg.Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('--- Checking Database Content ---')

    const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`
    console.log('Tables in public schema:', tables)

    const accountPropfirms = await prisma.account.findMany({
        select: { propfirm: true },
        distinct: ['propfirm'],
    })

    console.log('Propfirms found in Account table:', accountPropfirms.map(p => p.propfirm))

    const accounts = await prisma.account.findMany({
        take: 5,
        select: {
            number: true,
            propfirm: true,
            createdAt: true
        }
    })
    console.log('\nSample Accounts:', JSON.stringify(accounts, null, 2))

    const users = await prisma.user.findMany()
    console.log('Users in DB:', JSON.stringify(users, null, 2))

    const accountCount = await prisma.account.count()
    console.log('\nTotal accounts in DB:', accountCount)

    const payoutCount = await prisma.payout.count()
    console.log('Total payouts in DB:', payoutCount)

    const payouts = await prisma.payout.findMany({
        take: 5,
        include: {
            account: {
                select: {
                    propfirm: true
                }
            }
        }
    })
    console.log('\nSample Payouts:', JSON.stringify(payouts, null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect()
        await pool.end()
    })
