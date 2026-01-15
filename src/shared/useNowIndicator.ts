import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { MINUTES_IN_DAY } from "../utils/dateUtils";

export interface UseNowIndicatorOptions {
  /**
   * Update interval in milliseconds. Defaults to 60 seconds.
   */
  updateIntervalMs?: number;
}

interface UseNowIndicatorResult {
  /**
   * Current Dayjs instance representing "now".
   */
  now: Dayjs;
  /**
   * Minutes elapsed since the start of the current day (0-1439).
   */
  minutesSinceStartOfDay: number;
  /**
   * Helper to determine if the provided date is today.
   */
  isToday: (date: Date) => boolean;
  /**
   * Helper to find the index of "today" within a range.
   * Returns null if today is outside of the range.
   */
  getDayIndexInRange: (rangeStart: Date, totalDays: number) => number | null;
}

/**
 * Shared hook that supplies real-time information for rendering "now" indicators.
 * Keeps updates light by refreshing once per minute (configurable).
 */
export function useNowIndicator(
  options: UseNowIndicatorOptions = {}
): UseNowIndicatorResult {
  const { updateIntervalMs = 60_000 } = options;
  const [now, setNow] = useState<Dayjs>(() => dayjs());

  useEffect(() => {
    const update = () => setNow(dayjs());
    update();
    const intervalId = setInterval(update, updateIntervalMs);
    return () => clearInterval(intervalId);
  }, [updateIntervalMs]);

  const minutesSinceStartOfDay = useMemo(() => {
    const minutes = now.diff(now.startOf("day"), "minute");
    // Clamp between 0 and the last minute of the day
    return Math.min(Math.max(minutes, 0), MINUTES_IN_DAY - 1);
  }, [now]);

  const isToday = useCallback(
    (date: Date) => now.isSame(date, "day"),
    [now]
  );

  const getDayIndexInRange = useCallback(
    (rangeStart: Date, totalDays: number) => {
      const start = dayjs(rangeStart).startOf("day");
      const todayStart = now.startOf("day");
      const diff = todayStart.diff(start, "day");

      if (diff < 0 || diff >= totalDays) {
        return null;
      }

      return diff;
    },
    [now]
  );

  return {
    now,
    minutesSinceStartOfDay,
    isToday,
    getDayIndexInRange,
  };
}


