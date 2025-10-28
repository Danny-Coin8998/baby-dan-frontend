/**
 * Package Data Utility
 * Loads and manages package data from static JSON file
 */

export interface PackageItem {
  p_id: number;
  p_name: string;
  p_percent: number;
  p_period: string;
  p_amount: number;
  p_order: number;
  required_baby_dan?: number;
  can_afford?: boolean;
  user_balance?: number;
  dan_price?: number;
}

export interface PackageData {
  success: boolean;
  data: {
    packages: PackageItem[];
    total_count: number;
    dan_price: number;
    user_balance: number;
  };
}

/**
 * Fetches packages from static JSON file
 * @returns Promise with packages data
 */
export const getStaticPackages = async (): Promise<PackageItem[]> => {
  try {
    const response = await fetch('/json/package.json');
    if (!response.ok) {
      throw new Error('Failed to fetch package data');
    }
    const data: PackageData = await response.json();
    return data.data.packages;
  } catch (error) {
    console.error('Error loading static packages:', error);
    throw error;
  }
};

/**
 * Get package by ID
 * @param packages - Array of packages
 * @param id - Package ID
 * @returns Package item or undefined
 */
export const getPackageById = (
  packages: PackageItem[],
  id: number
): PackageItem | undefined => {
  return packages.find((pkg) => pkg.p_id === id);
};

/**
 * Get package color by amount
 * @param amount - Package amount
 * @returns Hex color string
 */
export const getPackageColor = (amount: number): string => {
  const colorMap: Record<number, string> = {
    10: '#3B82F6',
    100: '#10B981',
    300: '#F97316',
    500: '#EF4444',
    1000: '#FFD700',
    3000: '#6366F1',
    5000: '#EC4899',
    10000: '#EAB308',
  };
  return colorMap[amount] || '#6B7280';
};

