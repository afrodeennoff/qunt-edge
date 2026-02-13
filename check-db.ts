import { prisma } from './lib/prisma.js'

async function main() {
    const accountPropfirms = await prisma.account.findMany({
        select: { propfirm: true },
        distinct: ['propfirm'],
    })

    console.log('Propfirms in Account table:')
    console.log(accountPropfirms.map(p => p.propfirm))

    const payoutsWithAccounts = await prisma.payout.findMany({
        include: { account: true },
    })

    const payoutPropfirms = [...new Set(payoutsWithAccounts.map(p => p.account.propfirm))]
    console.log('\nPropfirms in Payout table (via Account):')
    console.log(payoutPropfirms)

    const accountCount = await prisma.account.count()
    console.log('\nTotal accounts:', accountCount)

    const payoutCount = await prisma.payout.count()
    console.log('Total payouts:', payoutCount)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
