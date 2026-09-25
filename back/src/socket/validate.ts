import { GameError } from "../game/types";

// Les payloads viennent du client : on ne leur fait jamais confiance.

export const payload = (value: unknown): Record<string, unknown> => {
  if (typeof value !== "object" || value === null) throw new GameError("INVALID_PAYLOAD");
  return value as Record<string, unknown>;
};

export const text = (value: unknown, maxLength = 30): string => {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed || trimmed.length > maxLength) throw new GameError("INVALID_PAYLOAD");
  return trimmed;
};

export const integer = (value: unknown, min: number, max: number): number => {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    throw new GameError("INVALID_PAYLOAD");
  }
  return value;
};

export const bool = (value: unknown): boolean => {
  if (typeof value !== "boolean") throw new GameError("INVALID_PAYLOAD");
  return value;
};
