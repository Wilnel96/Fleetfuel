export const SOUTH_AFRICAN_FUEL_BRANDS = [
  'Shell',
  'BP',
  'Engen',
  'Sasol',
  'Total',
  'Caltex',
  'Puma Energy',
  'Astron Energy',
  'United Petroleum',
  'Independent'
] as const;

export type FuelBrand = typeof SOUTH_AFRICAN_FUEL_BRANDS[number];
