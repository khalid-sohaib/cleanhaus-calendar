import { CalendarEvent } from "../../types";
import { extractEntityId } from "../../utils/eventHelpers";
import {
  INDICATOR_COLLAPSED_ROWS,
  PROPERTY_BAR_HEIGHT,
  PROPERTY_BAR_VERTICAL_GAP,
} from "../constants";

export function getPropertyIndicatorsWithRows(propertyIndicators: any[]) {
  const propertyIdToRow = new Map<string, number>();
  return propertyIndicators.map((ind) => {
    if (!propertyIdToRow.has(ind.propertyId)) {
      propertyIdToRow.set(ind.propertyId, propertyIdToRow.size);
    }
    const row = propertyIdToRow.get(ind.propertyId)!;
    return { ...ind, row };
  });
}

export function splitVisibleAndOverflow(
  indicatorsWithRows: any[],
  visibleLimit: number
) {
  let hidden = 0;
  const visible: typeof indicatorsWithRows = [];
  const perDay = new Array(7).fill(0);
  indicatorsWithRows.forEach((ind) => {
    if (ind.row >= visibleLimit) {
      hidden += 1;
      for (let d = ind.startDay; d <= ind.endDay; d++) perDay[d] += 1;
    } else {
      visible.push(ind);
    }
  });
  return {
    visibleIndicators: visible,
    overflowCount: hidden,
    overflowByDay: perDay,
  };
}

export function getWeekVisibleLimit(expanded: boolean, maxRowInWeek: number) {
  return expanded ? maxRowInWeek + 1 : INDICATOR_COLLAPSED_ROWS;
}

export function getPropertyBarHeight(
  visibleLimit: number,
  expanded: boolean,
  overflowCount: number
) {
  const rows = visibleLimit;
  if (rows <= 0) return 0;
  const baseHeight =
    rows * PROPERTY_BAR_HEIGHT + (rows - 1) * PROPERTY_BAR_VERTICAL_GAP;
  const needsControlRow = !expanded && overflowCount > 0;
  const controlHeight = needsControlRow
    ? PROPERTY_BAR_VERTICAL_GAP + PROPERTY_BAR_HEIGHT
    : 0;
  return baseHeight + controlHeight;
}

export function extractPropertyId(event: CalendarEvent): string | undefined {
  const entityId = extractEntityId(event.eventId);
  return entityId !== null ? entityId.toString() : undefined;
}

export function calculateDayOverflow(events: CalendarEvent[]): number {
  if (events.length === 0) return 0;
  const points: Array<{ t: number; d: number }> = [];
  events.forEach((e) => {
    points.push({ t: new Date(e.start).getTime(), d: 1 });
    points.push({ t: new Date(e.end).getTime(), d: -1 });
  });
  points.sort((a, b) => (a.t === b.t ? a.d - b.d : a.t - b.t));
  let cur = 0;
  let maxOverlap = 0;
  for (const p of points) {
    cur += p.d;
    if (cur > maxOverlap) maxOverlap = cur;
  }
  return Math.max(0, maxOverlap - 2);
}
