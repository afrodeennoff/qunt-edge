import { logger } from '@/lib/logger';

export function checkRequiredWhopEnv() {
    const required = [
        'WHOP_API_KEY',
        'WHOP_CLIENT_SECRET',
        'WHOP_WEBHOOK_SECRET',
        'WHOP_COMPANY_ID',
        'NEXT_PUBLIC_WHOP_APP_ID'
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        logger.warn('[Whop] Missing required environment variables:', missing);
        return false;
    }
    return true;
}
