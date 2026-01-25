export const AVAILABLE_FUEL_TYPES = [
  { value: 'ULP-93', label: 'ULP-93 Octane' },
  { value: 'ULP-95', label: 'ULP-95 Octane' },
  { value: 'ULP-97', label: 'ULP-97 Octane' },
  { value: 'Diesel-10', label: 'Diesel-10 PPM' },
  { value: 'Diesel-50', label: 'Diesel-50 PPM' },
  { value: 'Diesel-500', label: 'Diesel-500 PPM' },
  { value: 'LRP', label: 'Lead Replacement Petrol (LRP)' },
  { value: 'AdBlue', label: 'AdBlue (Diesel Exhaust Fluid)' },
] as const;

export const getFuelTypeDisplayName = (fuelType: string): string => {
  const displayNames: { [key: string]: string } = {
    'ULP-93': 'ULP-93 Octane',
    'ULP-95': 'ULP-95 Octane',
    'ULP-97': 'ULP-97 Octane',
    'Diesel-10': 'Diesel-10 PPM',
    'Diesel-50': 'Diesel-50 PPM',
    'Diesel-500': 'Diesel-500 PPM',
    'LRP': 'Lead Replacement Petrol (LRP)',
    'AdBlue': 'AdBlue (Diesel Exhaust Fluid)'
  };
  return displayNames[fuelType] || fuelType;
};

export const sortFuelTypes = (fuelTypes: string[]): string[] => {
  const order = [
    'ULP-93',
    'ULP-95',
    'ULP-97',
    'LRP',
    'Diesel-10',
    'Diesel-50',
    'Diesel-500',
    'AdBlue'
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
