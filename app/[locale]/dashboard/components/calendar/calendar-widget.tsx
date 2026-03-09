'use client'

import React from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import MobileCalendarPnl from "./mobile-calendar";
import DesktopCalendarPnl from "./desktop-calendar";
import { useDashboardStats } from "@/context/data-provider";

export default function CalendarPnl() {
  const { calendarData } = useDashboardStats()
  const isMobile = useMediaQuery("(max-width: 640px)")

  return isMobile ? (
    <MobileCalendarPnl calendarData={calendarData} />
  ) : (
    <DesktopCalendarPnl calendarData={calendarData} />
  )
}