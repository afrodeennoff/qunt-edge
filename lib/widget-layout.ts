import { WIDGET_METADATA } from "@/app/[locale]/dashboard/config/widget-metadata";
import { Widget, WidgetSize, WidgetType } from "@/app/[locale]/dashboard/types/dashboard";

export type DashboardLayoutMode = "desktop" | "mobile";

const MOBILE_GRID_BY_SIZE: Record<WidgetSize, { w: number; h: number }> = {
  tiny: { w: 12, h: 1 },
  small: { w: 12, h: 2 },
  "small-long": { w: 12, h: 2 },
  medium: { w: 12, h: 3 },
  large: { w: 12, h: 4 },
  "extra-large": { w: 12, h: 4 },
};

const DESKTOP_GRID_BY_SIZE: Record<WidgetSize, { w: number; h: number }> = {
  tiny: { w: 3, h: 1 },
  small: { w: 3, h: 4 },
  "small-long": { w: 6, h: 2 },
  medium: { w: 6, h: 4 },
  large: { w: 6, h: 8 },
  "extra-large": { w: 12, h: 8 },
};

export const FALLBACK_WIDGET_TYPE: WidgetType = "statisticsWidget";
export const FALLBACK_WIDGET_SIZE: WidgetSize = "medium";

export function sizeToGrid(
  size: WidgetSize,
  isSmallScreen = false,
): { w: number; h: number } {
  return isSmallScreen ? MOBILE_GRID_BY_SIZE[size] : DESKTOP_GRID_BY_SIZE[size];
}

export function getWidgetGrid(
  type: WidgetType,
  size: WidgetSize,
  isSmallScreen = false,
): { w: number; h: number } {
  const config = WIDGET_METADATA[type];
  if (!config) {
    return isSmallScreen ? { w: 12, h: 4 } : { w: 6, h: 4 };
  }

  return sizeToGrid(size, isSmallScreen);
}

export function isRegisteredWidgetType(type: string): type is WidgetType {
  return type in WIDGET_METADATA;
}

export function getAllowedWidgetTypes(): WidgetType[] {
  return Object.keys(WIDGET_METADATA) as WidgetType[];
}

export function normalizeWidgetType(type: unknown): WidgetType {
  if (typeof type === "string" && isRegisteredWidgetType(type)) {
    return type;
  }

  return FALLBACK_WIDGET_TYPE;
}

export function normalizeWidgetSize(
  type: WidgetType,
  size: unknown,
): WidgetSize {
  const config = WIDGET_METADATA[type];
  if (typeof size === "string" && config.allowedSizes.includes(size as WidgetSize)) {
    return size as WidgetSize;
  }

  return config.defaultSize;
}

export function getEffectiveWidgetSize(
  type: WidgetType,
  requestedSize: WidgetSize,
  isMobile: boolean,
): WidgetSize {
  const config = WIDGET_METADATA[type];
  if (!config) {
    return requestedSize;
  }

  if (config.requiresFullWidth) {
    return config.defaultSize;
  }

  if (config.allowedSizes.length === 1) {
    return config.allowedSizes[0];
  }

  if (isMobile && requestedSize !== "tiny") {
    if (config.allowedSizes.includes("small")) {
      return "small";
    }

    return config.allowedSizes[0];
  }

  if (config.allowedSizes.includes(requestedSize)) {
    return requestedSize;
  }

  return config.defaultSize;
}

export function coerceWidgetForLayout(
  widget: Partial<Widget>,
  mode: DashboardLayoutMode,
): Widget {
  const type = normalizeWidgetType(widget.type);
  const size = normalizeWidgetSize(type, widget.size);
  const grid = getWidgetGrid(type, size, mode === "mobile");

  return {
    i:
      typeof widget.i === "string" && widget.i.length > 0
        ? widget.i
        : `widget_${Date.now()}`,
    type,
    size,
    x: mode === "mobile" ? 0 : Math.max(0, Math.min(11, Number(widget.x) || 0)),
    y: Math.max(0, Number(widget.y) || 0),
    w: Math.max(1, Math.min(12, Number(widget.w) || grid.w)),
    h: Math.max(1, Math.min(12, Number(widget.h) || grid.h)),
    static: typeof widget.static === "boolean" ? widget.static : undefined,
    minW: typeof widget.minW === "number" ? widget.minW : undefined,
    minH: typeof widget.minH === "number" ? widget.minH : undefined,
    maxW: typeof widget.maxW === "number" ? widget.maxW : undefined,
    maxH: typeof widget.maxH === "number" ? widget.maxH : undefined,
    updatedAt: widget.updatedAt ?? null,
  };
}

export function generateResponsiveLayouts(widgets: Widget[]) {
  const widgetArray = Array.isArray(widgets) ? widgets : [];

  return {
    lg: widgetArray.map((widget) => ({
      ...widget,
      ...getWidgetGrid(widget.type, widget.size, false),
    })),
    md: widgetArray.map((widget) => ({
      ...widget,
      ...getWidgetGrid(widget.type, widget.size, false),
    })),
    sm: widgetArray.map((widget) => ({
      ...widget,
      ...getWidgetGrid(widget.type, widget.size, true),
      x: 0,
    })),
    xs: widgetArray.map((widget) => ({
      ...widget,
      ...getWidgetGrid(widget.type, widget.size, true),
      x: 0,
    })),
    xxs: widgetArray.map((widget) => ({
      ...widget,
      ...getWidgetGrid(widget.type, widget.size, true),
      x: 0,
    })),
  };
}

export function getNextWidgetPlacement(
  widgets: Widget[],
  type: WidgetType,
  size: WidgetSize,
  mode: DashboardLayoutMode,
) {
  const grid = getWidgetGrid(type, size, mode === "mobile");
  const nextY = widgets.reduce((max, widget) => {
    return Math.max(max, widget.y + widget.h);
  }, 0);

  return {
    x: 0,
    y: nextY,
    w: grid.w,
    h: grid.h,
  };
}
