
import { PrismaClient } from '../prisma/generated/prisma/index-browser.js'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import * as dotenv from 'dotenv'
import { URL } from 'url'

dotenv.config()

async function testConnection() {
    console.log('--- Database Connectivity Test ---')

    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
        console.error('ERROR: DATABASE_URL not found in .env')
        process.exit(1)
    }

    console.log('Target Connection String (masked):', connectionString.replace(/:[^:@]+@/, ':****@'))

    const parseBooleanEnv = (value: string | undefined): boolean | undefined => {
        if (!value) return undefined
        const normalized = value.trim().toLowerCase()
        if (normalized === 'true') return true
        if (normalized === 'false') return false
        return undefined
    }

    const shouldEnableSsl = (cs: string): boolean => {
        const override = parseBooleanEnv(process.env.PGSSL_ENABLE)
        if (override !== undefined) return override
        try {
            const url = new URL(cs)
            const sslMode = url.searchParams.get('sslmode')?.toLowerCase()
            if (sslMode === 'disable') return false
            if (sslMode) return true
        } catch { }
        return process.env.NODE_ENV === 'production'
    }

    const shouldRejectUnauthorized = (): boolean => {
        const override = parseBooleanEnv(process.env.PGSSL_REJECT_UNAUTHORIZED)
        return override ?? false
    }

    const poolConfig: pg.PoolConfig = {
        connectionString: connectionString,
        max: 1,
        connectionTimeoutMillis: 5000,
    }

    if (shouldEnableSsl(connectionString)) {
        console.log('SSL Enabled: Yes')
        console.log('Reject Unauthorized:', shouldRejectUnauthorized())
        poolConfig.ssl = { rejectUnauthorized: shouldRejectUnauthorized() }
    } else {
        console.log('SSL Enabled: No')
    }

    const pool = new pg.Pool(poolConfig)

    try {
        console.log('Attempting to connect via pg...')
        const start = Date.now()
        const client = await pool.connect()
        const result = await client.query('SELECT 1 as connected')
        client.release()
        const duration = Date.now() - start

        console.log('SUCCESS: Connected to database!')
        console.log('Result:', result.rows)
        console.log('Response time:', duration, 'ms')
    } catch (error) {
        console.error('FAILURE: Could not connect to database.')
        console.error('Error details:', error)

        if (error instanceof Error && error.message.includes('self-signed certificate')) {
            console.error('\nTIP: This is a SSL certificate validation error. Try setting PGSSL_REJECT_UNAUTHORIZED=false in .env')
        }
    } finally {
        await pool.end()
        console.log('--- Test Finished ---')
    }
}

testConnection()
