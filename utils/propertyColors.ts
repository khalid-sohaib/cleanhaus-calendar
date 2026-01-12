/**
 * Property color palette - extracted for standalone package
 * These colors cycle through properties for consistent coloring
 * Property colors can be customized via Calendar props
 */

/**
 * Default property color palette using all 7 secondary colors
 * These colors cycle through properties: property 0 gets color 0, property 7 gets color 0 again
 * Used consistently across calendar, filters, and headers
 */
export const DEFAULT_PROPERTY_COLORS = [
  "#E6E489", // YELLOW KEY 500
  "#FFB562", // ORANGE KEY 500
  "#F68F9F", // PINK KEY 500
  "#BD5EA1", // MAUVE KEY 500
  "#42ABE3", // SKY KEY 500
  "#5C75C1", // BLUE KEY 500
  "#6CB281", // GREEN KEY 500
];

/**
 * Default darker property colors for other services (Landscaper, Pool/Spa Tech, Contractors)
 * Uses 700 shade from each color palette for darker appearance
 * These colors correspond to DEFAULT_PROPERTY_COLORS by index
 */
export const DEFAULT_PROPERTY_COLORS_DARK = [
  "#B8B66E", // YELLOW 700 - darker than secondary1
  "#CC914E", // ORANGE 700 - darker than secondary2
  "#C5727F", // PINK 700 - darker than secondary3
  "#974B81", // MAUVE 700 - darker than secondary4
  "#3589B6", // SKY 700 - darker than secondary5
  "#4A5E9A", // BLUE 700 - darker than secondary6
  "#568E67", // GREEN 700 - darker than secondary7
];

/**
 * Legacy exports for backward compatibility
 * @deprecated Use DEFAULT_PROPERTY_COLORS instead
 */
export const PROPERTY_COLORS = DEFAULT_PROPERTY_COLORS;
export const PROPERTY_COLORS_DARK = DEFAULT_PROPERTY_COLORS_DARK;

/**
 * Get property color by index with fallback
 * @param index - The index of the property
 * @param colors - Optional custom color array, defaults to DEFAULT_PROPERTY_COLORS
 * @returns The color for the property
 */
export function getPropertyColor(
  index: number,
  colors: string[] = DEFAULT_PROPERTY_COLORS
): string {
  return colors[index % colors.length];
}

/**
 * Get property color by property ID from available properties list
 * @param propertyId - The ID of the property
 * @param availableProperties - Array of available properties
 * @param colors - Optional custom color array, defaults to DEFAULT_PROPERTY_COLORS
 * @returns The color for the property
 */
export function getPropertyColorById(
  propertyId: number,
  availableProperties: Array<{ id?: number; entityId?: number }>,
  colors: string[] = DEFAULT_PROPERTY_COLORS
): string {
  const index = availableProperties.findIndex(
    (p) => (p.id ?? p.entityId) === propertyId
  );
  return getPropertyColor(index >= 0 ? index : 0, colors);
}

