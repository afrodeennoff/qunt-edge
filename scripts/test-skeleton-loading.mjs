#!/usr/bin/env node

/**
 * Skeleton Loading Test Script
 *
 * Tests the skeleton loading system implementation:
 * 1. Verifies skeleton components exist
 * 2. Checks feature flag integration
 * 3. Validates Suspense boundary usage
 * 4. Tests skeleton rendering
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = process.cwd();
const SKELETON_FILE = path.join(PROJECT_ROOT, 'components/ui/skeleton.tsx');
const DASHBOARD_SKELETON_FILE = path.join(PROJECT_ROOT, 'app/[locale]/dashboard/components/skeletons/dashboard-skeleton.tsx');
const DASHBOARD_TAB_SHELL_FILE = path.join(PROJECT_ROOT, 'app/[locale]/dashboard/components/dashboard-tab-shell.tsx');
const FEATURE_FLAGS_FILE = path.join(PROJECT_ROOT, 'lib/feature-flags.ts');

console.log('🔍 Testing Skeleton Loading System\n');

let passCount = 0;
let failCount = 0;

function test(name, condition, message) {
  if (condition) {
    console.log(`✅ ${name}`);
    passCount++;
  } else {
    console.log(`❌ ${name}: ${message}`);
    failCount++;
  }
}

// Test 1: Verify skeleton components exist
console.log('\n📁 Checking Skeleton Files...');
test('Skeleton component exists', fs.existsSync(SKELETON_FILE), 'File not found');
test('Dashboard skeleton exists', fs.existsSync(DASHBOARD_SKELETON_FILE), 'File not found');
test('DashboardTabShell exists', fs.existsSync(DASHBOARD_TAB_SHELL_FILE), 'File not found');
test('Feature flags file exists', fs.existsSync(FEATURE_FLAGS_FILE), 'File not found');

// Test 2: Verify skeleton component exports
console.log('\n📦 Checking Skeleton Component Exports...');
if (fs.existsSync(SKELETON_FILE)) {
  const skeletonContent = fs.readFileSync(SKELETON_FILE, 'utf-8');
  test('Exports Skeleton function',
    skeletonContent.includes('export function Skeleton') || skeletonContent.includes('export { Skeleton }'),
    'Missing export');
  test('Exports DashboardHeaderSkeleton', skeletonContent.includes('export function DashboardHeaderSkeleton'), 'Missing export');
  test('Exports WidgetGridSkeleton', skeletonContent.includes('export function WidgetGridSkeleton'), 'Missing export');
  test('Exports TableSkeleton', skeletonContent.includes('export function TableSkeleton'), 'Missing export');
  test('Exports AccountsSkeleton', skeletonContent.includes('export function AccountsSkeleton'), 'Missing export');
}

// Test 3: Verify dashboard skeleton
console.log('\n🎨 Checking Dashboard Skeleton...');
if (fs.existsSync(DASHBOARD_SKELETON_FILE)) {
  const dashboardSkeletonContent = fs.readFileSync(DASHBOARD_SKELETON_FILE, 'utf-8');
  test('Imports skeleton components', dashboardSkeletonContent.includes('from "@/components/ui/skeleton"'), 'Missing import');
  test('Exports DashboardSkeleton function', dashboardSkeletonContent.includes('export function DashboardSkeleton'), 'Missing export');
  test('Has activeTab prop', dashboardSkeletonContent.includes('activeTab'), 'Missing prop');
  test('Renders widgets skeleton', dashboardSkeletonContent.includes('activeTab === "widgets"'), 'Missing widgets skeleton');
  test('Renders table skeleton', dashboardSkeletonContent.includes('activeTab === "table"'), 'Missing table skeleton');
  test('Renders accounts skeleton', dashboardSkeletonContent.includes('activeTab === "accounts"'), 'Missing accounts skeleton');
  test('Renders chart skeleton', dashboardSkeletonContent.includes('activeTab === "chart"'), 'Missing chart skeleton');
}

// Test 4: Verify Suspense integration
console.log('\n⏳ Checking Suspense Integration...');
if (fs.existsSync(DASHBOARD_TAB_SHELL_FILE)) {
  const tabShellContent = fs.readFileSync(DASHBOARD_TAB_SHELL_FILE, 'utf-8');
  test('Imports Suspense', tabShellContent.includes('import') && tabShellContent.includes('Suspense'), 'Missing Suspense import');
  test('Imports DashboardSkeleton', tabShellContent.includes('DashboardSkeleton'), 'Missing DashboardSkeleton import');
  test('Imports FEATURE_FLAGS', tabShellContent.includes('FEATURE_FLAGS'), 'Missing feature flags import');
  test('Uses Suspense wrapper', tabShellContent.includes('<Suspense'), 'Missing Suspense boundary');
  test('Has skeleton fallback', tabShellContent.includes('fallback='), 'Missing skeleton fallback');
  test('Checks feature flag', tabShellContent.includes('ENABLE_SKELETON_LOADING'), 'Missing feature flag check');
}

// Test 5: Verify feature flag
console.log('\n🚩 Checking Feature Flag Configuration...');
if (fs.existsSync(FEATURE_FLAGS_FILE)) {
  const featureFlagsContent = fs.readFileSync(FEATURE_FLAGS_FILE, 'utf-8');
  test('Defines ENABLE_SKELETON_LOADING flag', featureFlagsContent.includes('ENABLE_SKELETON_LOADING'), 'Missing flag definition');
  test('Reads from environment', featureFlagsContent.includes('NEXT_PUBLIC_ENABLE_SKELETON_LOADING'), 'Missing env variable');
}

// Test 6: Verify animation classes
console.log('\n✨ Checking Skeleton Animation...');
if (fs.existsSync(SKELETON_FILE)) {
  const skeletonContent = fs.readFileSync(SKELETON_FILE, 'utf-8');
  test('Uses animate-pulse class', skeletonContent.includes('animate-pulse'), 'Missing animation');
  test('Uses white/5 background', skeletonContent.includes('bg-white/5'), 'Using wrong background color');
  test('Has rounded corners', skeletonContent.includes('rounded-md'), 'Missing border radius');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log(`✅ Passed: ${passCount}`);
console.log(`❌ Failed: ${failCount}`);
console.log(`📊 Success Rate: ${((passCount / (passCount + failCount)) * 100).toFixed(1)}%`);

if (failCount === 0) {
  console.log('\n🎉 All skeleton loading tests passed!\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. Please review the output above.\n');
  process.exit(1);
}
