export const COMPANIES = ["쏘카", "G car", "투루카"] as const;
export type Company = (typeof COMPANIES)[number];

export const FUEL_TYPES = [
  { value: "gasoline", label: "가솔린" },
  { value: "hybrid", label: "하이브리드" },
  { value: "electric", label: "전기차" },
  { value: "diesel", label: "디젤" },
  { value: "lpg", label: "LPG" },
] as const;

export type FuelType = (typeof FUEL_TYPES)[number]["value"];

export interface FareRangeData {
  start: number;
  end: number | null;
  rate: number;
}

export const CAR_CATEGORIES = [
  "경형",
  "소형",
  "준중형",
  "중형",
  "준대형",
  "대형",
  "SUV",
  "RV/승합",
  "스포츠",
] as const;

export type CarCategory = (typeof CAR_CATEGORIES)[number];