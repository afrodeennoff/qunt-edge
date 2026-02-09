'use client'
import Image from 'next/image'
import { useTheme } from '@/context/theme-provider'
import { useI18n } from '@/locales/client'

export default function Partners() {
    const { effectiveTheme } = useTheme()
    const t = useI18n()

    return (
        <section className="py-fluid-xl">
            <div className="container-fluid">
                <div className="flex flex-col items-center space-y-fluid-sm text-center">
                    <div className="space-y-fluid-xs">
                        <h2 className="text-fluid-3xl md:text-fluid-5xl font-bold tracking-tighter">
                            {t('landing.partners.title')}
                        </h2>
                        <p className="mx-auto max-w-[700px] text-zinc-500 md:text-fluid-lg leading-relaxed">
                            {t('landing.partners.description')}
                        </p>
                    </div>
                    <div className="grid grid-fluid gap-fluid-lg items-center justify-items-center w-full mt-fluid-md">
                        <a className="relative w-full h-16 flex items-center justify-center touch-optimized" href="https://ninjatraderdomesticvendor.sjv.io/e1VQMz" target="_blank" rel="noopener noreferrer">
                            <Image
                                src="/logos/ninjatrader-ob.svg"
                                alt="NinjaTrader"
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-contain filter dark:brightness-0 dark:invert"
                                priority
                            />
                        </a>
                        <a className="relative w-full h-16 flex items-center justify-center touch-optimized">
                            <Image
                                src={effectiveTheme === 'dark' ? '/logos/rithmic-logo-white.png' : '/logos/rithmic-logo-black.png'}
                                alt="Rithmic"
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-contain"
                                priority
                            />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    )
}
