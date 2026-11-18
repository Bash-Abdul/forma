import { FitnessProfile } from '@/types';
export type Units = FitnessProfile['units'];
export const weightUnit = (units: Units): string =>
  units === 'imperial' ? 'lb' : 'kg';
export const toDisplayWeight = (kg: number, units: Units): number =>
  units === 'imperial' ? kg * 2.2046226218 : kg;
export const toKg = (value: number, units: Units): number =>
  units === 'imperial' ? value / 2.2046226218 : value;
export const toDisplayHeight = (cm: number, units: Units): number =>
  units === 'imperial' ? cm / 2.54 : cm;
export const toCm = (value: number, units: Units): number =>
  units === 'imperial' ? value * 2.54 : value;
export const formatWeight = (kg: number, units: Units): string =>
  `${Number(toDisplayWeight(kg, units).toFixed(1))} ${weightUnit(units)}`;
