'use client'

import React, { useEffect, useState } from 'react'
import { Link2, FileSpreadsheet, Database, Pencil, Search, LayoutGrid, ListFilter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useI18n } from "@/locales/client"
import { platforms, PlatformConfig } from './config/platforms'
import { PlatformCard } from './components/platform-card'
import { PlatformTutorial } from './components/platform-tutorial'
import { cn } from '@/lib/utils'
import { useImportTypePreferenceStore } from '@/store/import-type-preference-store'
import { motion, AnimatePresence } from 'framer-motion'
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type ImportType = string

interface ImportTypeSelectionProps {
  selectedType: ImportType
  setSelectedType: React.Dispatch<React.SetStateAction<ImportType>>
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const categoryIcons: Record<PlatformConfig['category'], React.ReactNode> = {
  'Direct Account Sync': <Link2 className="h-4 w-4" />,
  'Intelligent Import': <FileSpreadsheet className="h-4 w-4" />,
  'Platform CSV Import': <Database className="h-4 w-4" />,
  'Manual Entry': <Pencil className="h-4 w-4" />
}

// Function to check if it's weekend
function isWeekend() {
  const day = new Date().getDay()
  return day === 0 || day === 6 // 0 is Sunday, 6 is Saturday
}

export default function ImportTypeSelection({ selectedType, setSelectedType, setIsOpen }: ImportTypeSelectionProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredCategory, setHoveredCategory] = useState<PlatformConfig['category'] | null>(null)
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const t = useI18n()
  const { lastSelectedType, setLastSelectedType } = useImportTypePreferenceStore()

  // Set default selection from store preference
  useEffect(() => {
    if (lastSelectedType && !selectedType) {
      setSelectedType(lastSelectedType)
    }
  }, [setSelectedType, lastSelectedType, selectedType])

  const getTranslatedCategory = (category: PlatformConfig['category']) => {
    switch (category) {
      case 'Direct Account Sync':
        return t('import.type.category.directSync')
      case 'Intelligent Import':
        return t('import.type.category.intelligentImport')
      case 'Platform CSV Import':
        return t('import.type.category.platformCsv')
      case 'Manual Entry':
        return t('import.type.category.manualEntry')
      default:
        return category
    }
  }

  const filteredPlatforms = platforms.filter(platform => {
    const matchesSearch =
      t(platform.name as any, { count: 1 }).toLowerCase().includes(searchQuery.toLowerCase()) ||
      t(platform.description as any, { count: 1 }).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getTranslatedCategory(platform.category).toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = activeCategory === "all" || platform.category === activeCategory

    return matchesSearch && matchesCategory;
  })

  // Get unique categories for tabs
  const allCategories = Array.from(new Set(platforms.map(p => p.category)));

  const selectedPlatform = platforms.find(p => p.type === selectedType)

  return (
    <div className="flex flex-col h-full bg-background/50 backdrop-blur-xl">
      <div className="grid lg:grid-cols-[1fr_380px] h-full divide-x divide-border overflow-hidden">
        {/* Left Side: Grid of options */}
        <div className="flex flex-col h-full min-h-0 relative">
          {/* Header & Filter */}
          <div className="p-4 space-y-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('import.type.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-secondary/50 border-transparent hover:bg-secondary/80 focus:bg-background transition-all"
              />
            </div>

            <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory} className="w-full">
              <ScrollArea className="w-full pb-2">
                <TabsList className="bg-transparent p-0 h-auto gap-2">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 rounded-full px-4 h-8"
                  >
                    <LayoutGrid className="h-3 w-3 mr-2" />
                    All
                  </TabsTrigger>
                  {allCategories.map(cat => (
                    <TabsTrigger
                      key={cat}
                      value={cat}
                      className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 rounded-full px-4 h-8"
                    >
                      {categoryIcons[cat]}
                      <span className="ml-2">{getTranslatedCategory(cat)}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </ScrollArea>
            </Tabs>
          </div>

          {/* Grid Content */}
          <ScrollArea className="flex-1 p-4 md:p-6">
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-20"
            >
              <AnimatePresence mode='popLayout'>
                {filteredPlatforms.length > 0 ? (
                  filteredPlatforms.map((platform) => (
                    <div key={platform.type} className="h-full">
                      <PlatformCard
                        platform={platform}
                        isSelected={selectedType === platform.type}
                        onSelect={(type) => {
                          setSelectedType(type as ImportType)
                          setLastSelectedType(type as ImportType)
                        }}
                        onHover={(category) => setHoveredCategory(category as PlatformConfig['category'])}
                        onLeave={() => setHoveredCategory(null)}
                        isWeekend={isWeekend()}
                      />
                    </div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full py-12 text-center text-muted-foreground"
                  >
                    <ListFilter className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>{t('import.type.noResults')}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </ScrollArea>
        </div>

        {/* Right Side: Details Panel */}
        <div className="hidden lg:block h-full bg-muted/30 border-l relative overflow-hidden">
          {selectedType && selectedPlatform ? (
            <motion.div
              key={selectedType}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full flex flex-col"
            >
              <div className="h-full overflow-y-auto p-6">
                {selectedPlatform.customComponent ? (
                  <selectedPlatform.customComponent setIsOpen={setIsOpen} />
                ) : (
                  <PlatformTutorial selectedPlatform={selectedPlatform} setIsOpen={setIsOpen} />
                )}
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                <LayoutGrid className="h-10 w-10 opacity-20" />
              </div>
              <h3 className="text-lg font-medium mb-2">Select a Platform</h3>
              <p className="max-w-xs text-sm opacity-60">
                Choose a platform from the left to view details and start importing your trades.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}