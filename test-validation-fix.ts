// Test script to verify the validation fix
import { z } from 'zod';

const importTradeSchema = z.object({
    accountNumber: z.string().min(1, 'Account number is required'),
    instrument: z.string().min(1, 'Instrument is required'),
    side: z.string().optional(),
    quantity: z.coerce.number().positive('Quantity must be positive'),
    entryPrice: z.coerce.number(),
    closePrice: z.coerce.number(),
    pnl: z.coerce.number(),
    commission: z.coerce.number().default(0),
    entryDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid entry date'),
    closeDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid close date'),
    timeInPosition: z.coerce.number().optional(),
    entryId: z.string().optional(),
    closeId: z.string().optional(),
    comment: z.string().optional(),
    tags: z.array(z.string()).optional(),
    groupId: z.string().nullish(),
});

// Test case 1: String numbers (was failing before)
const testTrade1 = {
    accountNumber: 'TEST123',
    instrument: 'M2K',
    quantity: '10',              // String instead of number ✅
    entryPrice: '123.45',        // String instead of number ✅
    closePrice: '125.50',        // String instead of number ✅
    pnl: '20.50',                // String instead of number ✅
    commission: '2.50',          // String instead of number ✅
    entryDate: '2024-01-01T10:00:00Z',
    closeDate: '2024-01-01T11:00:00Z',
    timeInPosition: '3600',      // String instead of number ✅
    groupId: null,               // Null value ✅
};

// Test case 2: Null groupId (was failing before)
const testTrade2 = {
    accountNumber: 'TEST456',
    instrument: 'MGC',
    quantity: 5,
    entryPrice: 2000.00,
    closePrice: 2010.00,
    pnl: 50.00,
    commission: 1.25,
    entryDate: '2024-01-02T10:00:00Z',
    closeDate: '2024-01-02T11:00:00Z',
    groupId: null,               // Null value ✅
};

// Test case 3: With groupId (should still work)
const testTrade3 = {
    accountNumber: 'TEST789',
    instrument: 'ES',
    quantity: 2,
    entryPrice: 4500.00,
    closePrice: 4510.00,
    pnl: 20.00,
    commission: 1.00,
    entryDate: '2024-01-03T10:00:00Z',
    closeDate: '2024-01-03T11:00:00Z',
    groupId: 'group-123',        // String value ✅
};

console.log('Testing trade validation...\n');

console.log('Test 1: String numbers with null groupId');
const result1 = importTradeSchema.safeParse(testTrade1);
if (result1.success) {
    console.log('✅ PASS - Trade validated successfully');
    console.log('Parsed values:', {
        entryPrice: result1.data.entryPrice,
        closePrice: result1.data.closePrice,
        quantity: result1.data.quantity,
        groupId: result1.data.groupId,
    });
} else {
    console.log('❌ FAIL - Validation errors:', result1.error.issues);
}

console.log('\nTest 2: Numbers with null groupId');
const result2 = importTradeSchema.safeParse(testTrade2);
if (result2.success) {
    console.log('✅ PASS - Trade validated successfully');
    console.log('Parsed values:', {
        entryPrice: result2.data.entryPrice,
        closePrice: result2.data.closePrice,
        groupId: result2.data.groupId,
    });
} else {
    console.log('❌ FAIL - Validation errors:', result2.error.issues);
}

console.log('\nTest 3: With groupId string');
const result3 = importTradeSchema.safeParse(testTrade3);
if (result3.success) {
    console.log('✅ PASS - Trade validated successfully');
    console.log('Parsed values:', {
        entryPrice: result3.data.entryPrice,
        closePrice: result3.data.closePrice,
        groupId: result3.data.groupId,
    });
} else {
    console.log('❌ FAIL - Validation errors:', result3.error.issues);
}

console.log('\n=== All tests completed ===');
