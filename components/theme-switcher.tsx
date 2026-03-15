'use client'

import { Moon, Sun, Palette } from 'lucide-react'
import { useTheme } from '@/context/theme-provider'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from './ui/dropdown-menu'
import { Slider } from './ui/slider'

export function ThemeSwitcher() {
  const { setTheme, setColorTheme, colorTheme, intensity, setIntensity } = useTheme()

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
  }

  const handleColorThemeChange = (newColorTheme: 'default' | 'tiesen') => {
    setColorTheme(newColorTheme)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleThemeChange('light')}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('system')}>
          System
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Palette className="mr-2 h-4 w-4" />
            Color Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => handleColorThemeChange('default')}>
              <span className="mr-2 h-3 w-3 rounded-full bg-[#F5E6D3]" />
              Default (Gold)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleColorThemeChange('tiesen')}>
              <span className="mr-2 h-3 w-3 rounded-full bg-[#8B5CF6]" />
              Tiesen (Purple)
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Intensity</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <div className="p-4">
              <Slider
                value={[intensity]}
                onValueChange={([value]) => setIntensity(value)}
                min={90}
                max={100}
                step={1}
                className="w-[200px]"
              />
              <div className="mt-2 text-sm text-muted-foreground">
                {intensity}%
              </div>
            </div>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 