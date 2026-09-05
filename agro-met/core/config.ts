export type RuntimeEnvironment = 'development' | 'staging' | 'production' | 'test';

export type AgroConfig = Readonly<{
  environment: RuntimeEnvironment;
  engineVersion: string;
  staleAfterMinutes: number;
  cacheTtlMinutes: number;
  maxForecastHours: number;
  minDecisionConfidence: number;
}>;

const numberEnv = (value: string | undefined, fallback: number, min: number, max: number): number => {
  const parsed = value === undefined ? fallback : Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) return fallback;
  return parsed;
};

export function loadConfig(env: Record<string, string | undefined> = {}) : AgroConfig {
  const environment = (env.AGRO_ENV ?? 'production') as RuntimeEnvironment;
  if (!['development', 'staging', 'production', 'test'].includes(environment)) {
    throw new Error(`AGRO_ENV geçersiz: ${environment}`);
  }
  return Object.freeze({
    environment,
    engineVersion: env.AGRO_ENGINE_VERSION ?? '3.0.0',
    staleAfterMinutes: numberEnv(env.AGRO_STALE_AFTER_MINUTES, 60, 1, 10080),
    cacheTtlMinutes: numberEnv(env.AGRO_CACHE_TTL_MINUTES, 30, 1, 1440),
    maxForecastHours: numberEnv(env.AGRO_MAX_FORECAST_HOURS, 72, 1, 168),
    minDecisionConfidence: numberEnv(env.AGRO_MIN_DECISION_CONFIDENCE, 70, 0, 100),
  });
}

export const DEFAULT_CONFIG = loadConfig({ AGRO_ENV: 'production' });
