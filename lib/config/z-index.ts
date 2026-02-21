export const Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  sidebar: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
} as const

export type ZIndexKey = keyof typeof Z_INDEX
