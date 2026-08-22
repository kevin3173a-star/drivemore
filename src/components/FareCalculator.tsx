"use client"
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calculator, MapPin, Building2, Fuel, Car, Coins, Trash2 } from "lucide-react";
import { CAR_CATEGORIES, CarCategory, COMPANIES, FUEL_TYPES, type Company, type FareRangeData, type FuelType } from "@/lib/companies";
import { Search } from "lucide-react";
import { toast } from "./ui/sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
interface CarModelRow {
  id: string;
  name: string;
  fuel_type: FuelType;
  category: CarCategory;
  ranges: FareRangeData[];
}

interface CalculationResult {
  id:string;
  company: string;
  carModel: string;
  distance: number;
  rangeDetails: { range: string; distance: number; rate: number; fare: number }[];
  totalFare: number;
  timestamp: Date;
}

const StepHeader = ({
  n,
  icon: Icon,
  title,
  active,
  done,
}: {
  n: number;
  icon: typeof Building2;
  title: string;
  active: boolean;
  done: boolean;
}) => (
  <div className="flex items-center gap-2">
    <div
      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-colors ${
        done
          ? "bg-primary text-primary-foreground"
          : active
          ? "bg-primary/10 text-primary ring-primary/40"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {n}
    </div>
    <Icon className={`w-4 h-4 ${active || done ? "text-primary" : "text-muted-foreground"}`} />
    <span className={`text-sm font-medium ${active || done ? "text-foreground" : "text-muted-foreground"}`}>
      {title}
    </span>
  </div>
);

export const FareCalculator = () => {
  const [distance, setDistance] = useState<string>("");
  const [company, setCompany] = useState<Company | null>(null);
  const [fuel, setFuel] = useState<FuelType | null>(null);
  const [selectedCar, setSelectedCar] = useState<CarModelRow | null>(null);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [history, setHistory] = useState<CalculationResult[]>([]);
  const [carKeyword, setCarKeyword] = useState("");
  const [carCategory, setCarCategory] = useState<CarCategory | "all">("all");
  const qc = useQueryClient();
  const { data: models = [], isLoading } = useQuery({
    queryKey: ["car_models", company],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("car_models")
        .select("id, name, fuel_type, category, ranges")
        .eq("company", company as string)
        .order("name");
      if (error) throw error;
      return data as unknown as CarModelRow[];
    },
    enabled: !!company,
  });

  const filteredModels = useMemo(
    () => (fuel ? models.filter((m) => m.fuel_type === fuel) : []),
    [models, fuel]
  );

  const fareRanges = selectedCar?.ranges ?? [];

  const pickCompany = (c: Company) => {
    setCompany(c);
    setFuel(null);
    setSelectedCar(null);
    setResult(null);
  };

  const pickFuel = (f: FuelType) => {
    setFuel(f);
    setSelectedCar(null);
    setResult(null);
  };

  const pickCar = (m: CarModelRow) => {
    setSelectedCar(m);
    setResult(null);
  };

  const calculateFare = () => {
    const distanceNum = parseFloat(distance);
    if (isNaN(distanceNum) || !selectedCar) return;

    let remaining = distanceNum;
    let total = 0;
    const rangeDetails: CalculationResult["rangeDetails"] = [];
    const sorted = [...fareRanges].sort((a, b) => a.start - b.start);

    for (const r of sorted) {
      if (remaining <= 0) break;
      const end = r.end ?? Infinity;
      const span = end - r.start;
      const applied = Math.min(remaining, span);
      const fare = applied * r.rate;
      total += fare;
      rangeDetails.push({
        range: r.end ? `${r.start}~${r.end}km` : `${r.start}km 이상`,
        distance: applied,
        rate: r.rate,
        fare,
      });
      remaining -= applied;
    }

    const calc: CalculationResult = {
      id: crypto.randomUUID(),
      company: company as string,
      carModel: selectedCar.name,
      distance: distanceNum,
      rangeDetails,
      totalFare: total,
      timestamp: new Date(),
    };
    setResult(calc);
    const nextHistory = [calc, ...history].slice(0, 5);

    setHistory(nextHistory);

    localStorage.setItem(
      "fare-history",
      JSON.stringify(nextHistory)
    );
  };

  const handleReset = () => {
    setDistance("");
    setResult(null);
  };
  
  /* 검색차종에 차종분류 추가 */
  const searchedModels = filteredModels.filter((m) => {
    const keywordMatch = m.name
      .toLowerCase()
      .includes(carKeyword.toLowerCase());

    const categoryMatch =
      carCategory === "all" || m.category === carCategory;

    return keywordMatch && categoryMatch;
  });

  const removeHistory = (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;

    const nextHistory = history.filter((item) => item.id !== id);

    setHistory(nextHistory);

    localStorage.setItem(
      "fare-history",
      JSON.stringify(nextHistory)
    );

    toast.success("삭제되었습니다.");
  };
  
  useEffect(() => {
    const saved = localStorage.getItem("fare-history");

    if (!saved) return;

    const parsed = JSON.parse(saved);

    setHistory(
      parsed.map((item: CalculationResult) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      }))
    );
  }, []);
  return (
    
    <div className="w-full mx-auto space-y-6">
      <Card className="max-w-full  w-[485.22px] mx-auto overflow-x-hidden hover:shadow-lg">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary-glow">
              <Calculator className="w-6 h-6 text-white " />
            </div>
            <CardTitle className="text-2xl">주행료 계산</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className=" min-w-0 space-y-5">
          {/* Step 1: 업체 선택 */}
          <div className="space-y-2">
            <StepHeader n={1} icon={Building2} title="업체 선택" active={!company} done={!!company} />
            <div className="bg-gray-100 flex gap-2 p-1 rounded-lg bg-muted/50">
              {COMPANIES.map((c) => {
                const active = company === c;
                return (
                  <Button
                    key={c}
                    type="button"
                    variant={active ? "default" : "ghost"}
                    size="sm"
                    onClick={() => pickCompany(c)}
                    className={`flex-1 h-9 transition-all cursor-pointer ${
                      active
                        ? "bg-primary from-primary to-primary-glow text-white shadow-sm"
                        : "text-gray-500 hover:text-foreground"
                    }`}
                  >
                    {c}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Step 2: 연료 선택 */}
          <div className={`space-y-2 transition-opacity ${company ? "" : "opacity-40 pointer-events-none"}`}>
            <StepHeader n={2} icon={Fuel} title="연료 선택" active={!!company && !fuel} done={!!fuel} />
            <div className="bg-gray-100 flex gap-2 p-1 rounded-lg bg-muted/50">
              {FUEL_TYPES.map((f) => {
                const active = fuel === f.value;
                return (
                  <Button
                    key={f.value}
                    type="button"
                    variant={active ? "default" : "ghost"}
                    size="sm"
                    onClick={() => pickFuel(f.value)}
                    className={`flex-1 h-9 transition-all cursor-pointer ${
                      active
                        ? "bg-primary from-primary to-primary-glow text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Step 3: 차종 선택 */}
          <div className={`space-y-2 transition-opacity ${fuel ? "" : "opacity-40 pointer-events-none"}`}>
            <StepHeader n={3} icon={Car} title="차종 선택" active={!!fuel && !selectedCar} done={!!selectedCar} />
            <div className="w-full min-w-0 overflow-x-hidden rounded-lg border border-input bg-card h-56 overflow-y-auto">
              <div className="relative p-2 border-b border-input">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  className="pl-9 pr-28"
                  placeholder="차종 검색..."
                  value={carKeyword}
                  onChange={(e) => setCarKeyword(e.target.value)}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-24">
                  <Select
                    value={carCategory}
                    onValueChange={(v) => setCarCategory(v as CarCategory | "all")}
                  >
                    <SelectTrigger  className="
                      h-8 w-25
                      shadow-none
                      px-2
                      bg-muted/50
                      text-muted-foreground
                      rounded-l-none
                      hover:text-foreground
                      transition-colors
                      cursor-pointer
                    ">
                      {carCategory === "all" ? "전체" : carCategory}
                    </SelectTrigger>

                    <SelectContent className="w-25 min-w-25 ">
                      <SelectItem className="cursor-pointer" value="all">전체</SelectItem>

                      {CAR_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category} className="cursor-pointer">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>  
              </div>
              {!fuel ? (
                <div className="h-43 flex items-center justify-center text-xs text-muted-foreground text-center">
                  업체와 연료를 먼저 선택하세요
                </div>
              ) : isLoading ? (
                <div className="p-4 text-xs text-muted-foreground text-center">불러오는 중...</div>
              ) : searchedModels.length === 0 ? (
                <div className="h-43 flex items-center justify-center text-xs text-muted-foreground ">
                  등록된 차종이 없습니다
                </div>
              ) : (
                <div className="grid w-full min-w-0 grid-cols-2 gap-1 p-1">
                  {searchedModels.map((m) => {
                    const active = selectedCar?.id === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => pickCar(m)}
                        className={`min-w-0 w-full overflow-hidden text-left px-3 py-2 text-sm whitespace-normal break-all leading-5 rounded-md transition-colors ${
                          active
                            ? "bg-primary/10 text-primary font-medium ring-1 ring-primary/40 cursor-pointer"
                            : "hover:bg-accent cursor-pointer"
                        }`}
                      >
                        {m.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Step 4: 구간별 요금 */}
          <div className={`space-y-2 transition-opacity ${selectedCar ? "" : "opacity-40 pointer-events-none"}`}>
            <StepHeader
              n={4}
              icon={Coins}
              title="구간별 요금"
              active={!!selectedCar}
              done={!!selectedCar}
            />
            <div className="rounded-lg border border-input bg-muted/30 divide-y divide-gray-200">
              {selectedCar ? (
                fareRanges.map((r, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                    <span className="text-muted-foreground">
                      {r.end ? `${r.start} ~ ${r.end} km` : `${r.start} km 이상`}
                    </span>
                    <span className="font-medium text-foreground">
                      {r.rate.toLocaleString()}원 / km
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-xs text-muted-foreground text-center">
                  차종을 선택하면 요금표가 표시됩니다
                </div>
              )}
            </div>
          </div>

          {/* Distance input + calculate */}
          <div className={`space-y-3 pt-1 transition-opacity ${selectedCar ? "" : "opacity-40 pointer-events-none"}`}>
            <div className="space-y-2">
              <StepHeader
              n={5}
              icon={MapPin}
              title="주행 거리 (km)"
              active={!!selectedCar}
              done={!!selectedCar}
            />
              {/* <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                주행 거리 (km)
              </label> */}
              <Input
                type="number"
                placeholder=""
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                className="text-lg"
                step="0.1"
                disabled={!selectedCar}
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={calculateFare}
                className="flex-1 h-12 text-base font-semibold cursor-pointer"
                disabled={!distance || !selectedCar}
              >
                <Calculator className="w-5 h-5 mr-2" />
                계산하기
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                className="h-12 px-6 cursor-pointer"
                disabled={!distance && !result}
              >
                초기화
              </Button>
            </div>
          </div>

          {result && (
            <div className="p-6 rounded-xl bg-gradient-to-br from-accent/50 to-accent/20 border border-accent space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">구간별 주행 요금</div>
                {result.rangeDetails.map((detail, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm text-muted-foreground pl-4"
                  >
                    <span>
                      {detail.range}: {detail.distance.toFixed(1)}km × {detail.rate.toLocaleString()}원
                    </span>
                    <span className="font-medium">{detail.fare.toLocaleString()}원</span>
                  </div>
                ))}
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center justify-between text-xl font-bold text-primary">
                <span>총 주행료</span>
                <span>{result.totalFare.toLocaleString()}원</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">최근 계산 내역</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                > <div>
                  
                    <div className="text-sm">{item.company} · {item.carModel}</div>
                    <div className="text-sm text-muted-foreground">{item.distance}km</div>
                  </div>
                  <div className="text-right flex items-center">
                    <div>
                    <div className="font-semibold text-foreground">
                      {item.totalFare.toLocaleString()}원
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.timestamp.toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    </div>
                  <Button className="cursor-pointer" size="sm" variant="ghost" onClick={() => removeHistory(item.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
