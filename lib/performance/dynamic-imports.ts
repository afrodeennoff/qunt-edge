import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

export type DynamicImportOptions = {
  ssr?: boolean;
  loading?: ComponentType<{ error?: boolean; retry?: () => void }>;
};

export const createDynamicImport = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  options: DynamicImportOptions = {}
) => {
  return dynamic(() => importFn(), {
    ssr: options.ssr ?? true,
    loading: options.loading,
  });
};

export const DynamicComponents = {
  Chart: createDynamicImport(() => import('@/components/lazy/charts')),
  ConsentBanner: createDynamicImport(() => import('@/components/lazy/consent-banner-lazy')),
  ScrollLockFix: createDynamicImport(() => import('@/components/lazy/scroll-lock-fix-lazy')),
};

export const createDynamicComponent = <T extends ComponentType<any>>(
  componentPath: string,
  options: DynamicImportOptions = {}
) => {
  return dynamic(() => import(componentPath), {
    ssr: options.ssr ?? true,
    loading: options.loading,
  });
};
