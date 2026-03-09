"use client";

import React, { createContext, useContext, useState, useMemo, useCallback } from "react";
import { DateRange, TickRange, PnlRange, TimeRange, TickFilter, WeekdayFilter, HourFilter, TagFilter } from "@/lib/data-types";

interface FiltersContextType {
  // Filter states
  instruments: string[];
  setInstruments: React.Dispatch<React.SetStateAction<string[]>>;
  accountNumbers: string[];
  setAccountNumbers: React.Dispatch<React.SetStateAction<string[]>>;
  dateRange: DateRange | undefined;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange | undefined>>;
  tickRange: TickRange;
  setTickRange: React.Dispatch<React.SetStateAction<TickRange>>;
  pnlRange: PnlRange;
  setPnlRange: React.Dispatch<React.SetStateAction<PnlRange>>;
  timeRange: TimeRange;
  setTimeRange: React.Dispatch<React.SetStateAction<TimeRange>>;
  tickFilter: TickFilter;
  setTickFilter: React.Dispatch<React.SetStateAction<TickFilter>>;
  weekdayFilter: WeekdayFilter;
  setWeekdayFilter: React.Dispatch<React.SetStateAction<WeekdayFilter>>;
  hourFilter: HourFilter;
  setHourFilter: React.Dispatch<React.SetStateAction<HourFilter>>;
  tagFilter: TagFilter;
  setTagFilter: React.Dispatch<React.SetStateAction<TagFilter>>;
  // Utility
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export function useFilters() {
  const context = useContext(FiltersContext);
  if (!context) {
    throw new Error("useFilters must be used within FiltersProvider");
  }
  return context;
}

export function FiltersProvider({ children }: { children: React.ReactNode }) {
  const [instruments, setInstruments] = useState<string[]>([]);
  const [accountNumbers, setAccountNumbers] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [tickRange, setTickRange] = useState<TickRange>({ min: undefined, max: undefined });
  const [pnlRange, setPnlRange] = useState<PnlRange>({ min: undefined, max: undefined });
  const [timeRange, setTimeRange] = useState<TimeRange>({ range: null });
  const [tickFilter, setTickFilter] = useState<TickFilter>({ value: null });
  const [weekdayFilter, setWeekdayFilter] = useState<WeekdayFilter>({ days: [] });
  const [hourFilter, setHourFilter] = useState<HourFilter>({ hour: null });
  const [tagFilter, setTagFilter] = useState<TagFilter>({ tags: [] });

  const resetFilters = useCallback(() => {
    setInstruments([]);
    setAccountNumbers([]);
    setDateRange(undefined);
    setTickRange({ min: undefined, max: undefined });
    setPnlRange({ min: undefined, max: undefined });
    setTimeRange({ range: null });
    setTickFilter({ value: null });
    setWeekdayFilter({ days: [] });
    setHourFilter({ hour: null });
    setTagFilter({ tags: [] });
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      instruments.length > 0 ||
      accountNumbers.length > 0 ||
      dateRange !== undefined ||
      tickRange.min !== undefined ||
      tickRange.max !== undefined ||
      pnlRange.min !== undefined ||
      pnlRange.max !== undefined ||
      timeRange.range !== null ||
      tickFilter.value !== null ||
      weekdayFilter.days.length > 0 ||
      hourFilter.hour !== null ||
      tagFilter.tags.length > 0
    );
  }, [instruments, accountNumbers, dateRange, tickRange, pnlRange, timeRange, tickFilter, weekdayFilter, hourFilter, tagFilter]);

  const value = useMemo(() => ({
    instruments,
    setInstruments,
    accountNumbers,
    setAccountNumbers,
    dateRange,
    setDateRange,
    tickRange,
    setTickRange,
    pnlRange,
    setPnlRange,
    timeRange,
    setTimeRange,
    tickFilter,
    setTickFilter,
    weekdayFilter,
    setWeekdayFilter,
    hourFilter,
    setHourFilter,
    tagFilter,
    setTagFilter,
    resetFilters,
    hasActiveFilters,
  }), [
    instruments, setInstruments,
    accountNumbers, setAccountNumbers,
    dateRange, setDateRange,
    tickRange, setTickRange,
    pnlRange, setPnlRange,
    timeRange, setTimeRange,
    tickFilter, setTickFilter,
    weekdayFilter, setWeekdayFilter,
    hourFilter, setHourFilter,
    tagFilter, setTagFilter,
    resetFilters,
    hasActiveFilters
  ]);

  return (
    <FiltersContext.Provider value={value}>
      {children}
    </FiltersContext.Provider>
  );
}
