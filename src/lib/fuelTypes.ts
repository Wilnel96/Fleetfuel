export const getFuelTypeDisplayName = (fuelType: string): string => {
  const displayNames: { [key: string]: string } = {
    'ULP-93': 'ULP-93 Octane',
    'ULP-95': 'ULP-95 Octane',
    'Diesel-10': 'Diesel-10 PPM',
    'Diesel-50': 'Diesel-50 PPM',
    'Diesel-500': 'Diesel-500 PPM'
  };
  return displayNames[fuelType] || fuelType;
};

export const sortFuelTypes = (fuelTypes: string[]): string[] => {
  const order = [
    'ULP-93',
    'ULP-95',
    'Diesel-10',
    'Diesel-50',
    'Diesel-500'
  ];

  return [...fuelTypes].sort((a, b) => {
    const indexA = order.indexOf(a);
    const indexB = order.indexOf(b);

    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;

    return indexA - indexB;
  });
};

export const FUEL_TYPES = [
  'ULP-93',
  'ULP-95',
  'Diesel-10',
  'Diesel-50',
  'Diesel-500'
] as const;

export type FuelType = typeof FUEL_TYPES[number];
