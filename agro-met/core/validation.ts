import type { GeoPoint, Parcel, WeatherData } from './contracts';

export function isValidGeoPoint(point: GeoPoint): boolean {
  return Number.isFinite(point.latitude) && Number.isFinite(point.longitude) && point.latitude >= -90 && point.latitude <= 90 && point.longitude >= -180 && point.longitude <= 180;
}

export function validateParcel(parcel: Parcel): string[] {
  const errors: string[] = [];
  if (!parcel.id.trim()) errors.push('Parsel ID boş olamaz.');
  if (!parcel.crop.trim()) errors.push('Ürün bilgisi boş olamaz.');
  if (parcel.areaHa != null && (!Number.isFinite(parcel.areaHa) || parcel.areaHa <= 0)) errors.push('Parsel alanı pozitif olmalıdır.');
  if (parcel.center && !isValidGeoPoint(parcel.center)) errors.push('Parsel koordinatı geçersiz.');
  return errors;
}

export function validateWeather(weather: WeatherData): string[] {
  const errors: string[] = [];
  if (!Number.isFinite(weather.temperatureC)) errors.push('Sıcaklık geçersiz.');
  if (!Number.isFinite(weather.humidityPct) || weather.humidityPct < 0 || weather.humidityPct > 100) errors.push('Bağıl nem 0-100 arasında olmalıdır.');
  for (const [key, value] of Object.entries(weather)) if (key !== 'pressureHpa' && value != null && typeof value === 'number' && value < 0) errors.push(`${key} negatif olamaz.`);
  return errors;
}

export function assertValid<T>(errors: string[], label = 'Veri'): asserts errors is [] {
  if (errors.length) throw new Error(`${label} doğrulaması başarısız: ${errors.join(' ')}`);
}
