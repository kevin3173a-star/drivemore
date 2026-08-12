"use client"
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, useIsAdmin } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, Pencil, ArrowLeft,Search } from "lucide-react";
import { toast } from "sonner";
import {  CAR_CATEGORIES, type CarCategory, COMPANIES, FUEL_TYPES, type Company, type FareRangeData, type FuelType } from "@/lib/companies";

interface CarModel {
  id: string;
  company: string;
  name: string;
  fuel_type: FuelType;
  category: CarCategory | null;
  ranges: FareRangeData[];
}

interface FormState {
  id?: string;
  company: Company;
  name: string;
  fuel_type: FuelType;
  category: CarCategory | "";
  ranges: FareRangeData[];
}

const DEFAULT_RANGES: Record<Company, Record<FuelType, FareRangeData[]>> = {
  쏘카: {
    gasoline: [
      { start: 0, end: 30, rate: 0 },
      { start: 30, end: null, rate: 270 },
    ],
    hybrid: [
      { start: 0, end: 30, rate: 0 },
      { start: 30, end: null, rate: 270 },
    ],
    diesel: [
        { start: 0, end: 30, rate: 210 },
        { start: 30, end: 100, rate: 190 },
        { start: 100, end: null, rate: 170 }
      ],
    lpg: [
        { start: 0, end: 30, rate: 210 },
        { start: 30, end: 100, rate: 190 },
        { start: 100, end: null, rate: 170 }
      ],
    electric: [
      { start: 0, end: null, rate: 0 },
    ],
  },
  "G car": {
      gasoline: [
        { start: 0, end: 30, rate: 210 },
        { start: 30, end: 100, rate: 190 },
        { start: 100, end: null, rate: 170 }
      ],
      hybrid: [
        { start: 0, end: 30, rate: 210 },
        { start: 30, end: 100, rate: 190 },
        { start: 100, end: null, rate: 170 }
      ],
      diesel: [
        { start: 0, end: 30, rate: 210 },
        { start: 30, end: 100, rate: 190 },
        { start: 100, end: null, rate: 170 }
      ],
      lpg: [
        { start: 0, end: 30, rate: 210 },
        { start: 30, end: 100, rate: 190 },
        { start: 100, end: null, rate: 170 }
      ],
      electric: [
        { start: 0, end: null, rate: 90 },
      ],
  },
  투루카: {
      gasoline: [
        { start: 0, end: 50, rate: 210 },
        { start: 50, end: 100, rate: 190 },
        { start: 100, end: null, rate: 170 }
      ],
      hybrid: [
        { start: 0, end: 50, rate: 210 },
        { start: 50, end: 100, rate: 190 },
        { start: 100, end: null, rate: 170 }
      ],
      diesel: [
        { start: 0, end: 50, rate: 210 },
        { start: 50, end: 100, rate: 190 },
        { start: 100, end: null, rate: 170 }
      ],
      lpg: [
        { start: 0, end: 50, rate: 210 },
        { start: 50, end: 100, rate: 190 },
        { start: 100, end: null, rate: 170 }
      ],
      electric: [
        { start: 0, end: null, rate: 50 },
      ],
  },
};

const emptyForm = (): FormState => ({
  company: "쏘카",
  name: "",
  fuel_type: "gasoline",
  category: "",
  ranges: structuredClone(DEFAULT_RANGES["쏘카"]["gasoline"]),
});

const Admin = () => {
  const router = useRouter();
  const qc = useQueryClient();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useIsAdmin(user?.id);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  
  /* 차종관리 필터추가 */
  const [filterCompany, setFilterCompany] = useState<Company | "all">("all");
  const [filterFuel, setFilterFuel] = useState<FuelType | "all">("all");
  const [filterCategory, setFilterCategory] = useState<CarCategory | "all">("all");

  useEffect(() => {
    if (!authLoading && !user) router.push("/auth");
  }, [authLoading, user, router]);

  const { data: models = [], isLoading } = useQuery({
    queryKey: ["car_models_admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("car_models")
        .select("id, company, name, fuel_type, category, ranges")
        .order("company")
        .order("name");
      if (error) throw error;
      return data as unknown as CarModel[];
    },
    enabled: isAdmin,
  });

  /* 차종 검색 추가 */
  const [carKeyword, setCarKeyword] = useState("");

  /* 필터 배열 */
  const filteredModels = models.filter((m) => {
    const companyMatch =
      filterCompany === "all" || m.company === filterCompany;

    const fuelMatch =
      filterFuel === "all" || m.fuel_type === filterFuel;

    const categoryMatch =
      filterCategory === "all" || m.category === filterCategory;

    const keywordMatch =
      carKeyword === "" || m.name.includes(carKeyword);

    return companyMatch && fuelMatch && categoryMatch && keywordMatch;
  });
  
  
  
  const openNew = () => {
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (m: CarModel) => {
    setForm({
      id: m.id,
      company: m.company as Company,
      name: m.name,
      fuel_type: m.fuel_type,
      category: m.category ?? "",
      ranges: m.ranges,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    console.log("Saving form:");
    if (!form.name.trim()) {
      toast.error("차종명을 입력하세요");
      return;
    }

    if (!form.category) {
      toast.error("차량 분류를 선택하세요");
      return;
    }
    const payload = {
      company: form.company,
      category: form.category,
      name: form.name.trim(),
      fuel_type: form.fuel_type,
      ranges: form.ranges as unknown as never,
    };
    const { error } = form.id
      ? await supabase.from("car_models").update(payload).eq("id", form.id)
      : await supabase.from("car_models").insert(payload);
    if (error) {
      console.error(error);
      toast.error(error.message);
      return;
    }
    
    toast.success("저장되었습니다");
    setDialogOpen(false);
    qc.invalidateQueries({ queryKey: ["car_models_admin"] });
    qc.invalidateQueries({ queryKey: ["car_models"] });
  };

  const remove = async (id: string) => {
    if (!confirm("삭제하시겠습니까?")) return;
    const { error } = await supabase.from("car_models").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("삭제되었습니다");
    qc.invalidateQueries({ queryKey: ["car_models_admin"] });
    qc.invalidateQueries({ queryKey: ["car_models"] });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const updateRange = (i: number, field: keyof FareRangeData, val: number | null) => {
    const next = [...form.ranges];
    next[i] = { ...next[i], [field]: val };
    if (field === "end" && i < next.length - 1 && val !== null) {
      next[i + 1] = { ...next[i + 1], start: val };
    }
    setForm({ ...form, ranges: next });
  };

  if (authLoading || roleLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">로딩 중...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-muted-foreground">관리자 권한이 없습니다.</p>
        <Button variant="outline" onClick={() => router.push("/")}>홈으로</Button>
        <Button variant="ghost" onClick={signOut}>로그아웃</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold">차종 관리</h1>
          </div>
          <div className="flex gap-2">
            <Button
              className="cursor-pointer"
              size="sm"
              variant="outline"
              onClick={() => router.push("/admin/users")}
            >
              관리자 관리
            </Button>      
          </div>
        </div>

        <Card className="w-[1024px] max-w-[calc(100vw-2rem)] mx-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              등록된 차종 ({filteredModels.length})
            </CardTitle>

            <Button className="cursor-pointer" size="sm" onClick={openNew}>
              <Plus className="w-4 h-4 mr-1" />
              차종 추가
            </Button>
          </CardHeader>
          <CardContent>
            {/* 차종 검색 추가 */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

              <Input
                className="pl-9"
                placeholder="차종 검색..."
                value={carKeyword}
                onChange={(e) => setCarKeyword(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {/* 업체 필터 */}
              <Select
                value={filterCompany}
                onValueChange={(v) => setFilterCompany(v as Company | "all")}
              >
                <SelectTrigger className="cursor-pointer">
                  {filterCompany === "all" ? "전체 업체" : filterCompany}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="cursor-pointer" value="all">전체 업체</SelectItem>

                  {COMPANIES.map((company) => (
                    <SelectItem className="cursor-pointer" key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 연료 필터 */}
              <Select
                value={filterFuel}
                onValueChange={(v) => setFilterFuel(v as FuelType | "all")}
              >
                <SelectTrigger className="cursor-pointer">
                  {filterFuel === "all"
                    ? "전체 연료"
                    : FUEL_TYPES.find((f) => f.value === filterFuel)?.label}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="cursor-pointer" value="all">전체 연료</SelectItem>

                  {FUEL_TYPES.map((fuel) => (
                    <SelectItem className="cursor-pointer" key={fuel.value} value={fuel.value}>
                      {fuel.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 분류 필터 */}
              <Select
                value={filterCategory}
                onValueChange={(v) =>
                  setFilterCategory(v as CarCategory | "all")
                }
              >
                <SelectTrigger className="cursor-pointer">
                  {filterCategory === "all" ? "전체 분류" : filterCategory}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem className="cursor-pointer" value="all">전체 분류</SelectItem>

                  {CAR_CATEGORIES.map((category) => (
                    <SelectItem className="cursor-pointer" key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {isLoading ? (
              <p className="text-sm text-muted-foreground text-center">
                불러오는 중...
              </p>
            ) : models.length === 0 ? (
              // DB에 등록된 차종 자체가 없는 경우
              <p className="text-sm text-muted-foreground text-center py-8">
                등록된 차종이 없습니다. "차종 추가" 버튼을 눌러 추가하세요.
              </p>
            ) : filteredModels.length === 0 ? (
              // 차종은 있지만 필터 결과가 없는 경우
              <p className="text-sm text-muted-foreground text-center py-8">
                선택한 조건에 맞는 차종이 없습니다.
              </p>
            ) : (
              // 필터 결과도 있는 경우
              <Table className="table-fixed">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[10%]">업체</TableHead>
                    <TableHead className="w-[20%]">차종</TableHead>
                    <TableHead className="w-[10%]">연료</TableHead>
                    <TableHead className="w-[10%]">분류</TableHead>
                    <TableHead className="w-[30%]">구간별 요금</TableHead>
                    <TableHead className="w-[10%]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredModels.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className=" whitespace-nowrap" >{m.company}</TableCell>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell className=" whitespace-nowrap">
                        {FUEL_TYPES.find((f) => f.value === m.fuel_type)?.label}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {m.category ?? "분류 없음"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground break-words">
                        {m.ranges
                          .map((r) =>
                            r.end
                              ? `${r.start}~${r.end}km ${r.rate}원`
                              : `${r.start}km이상 ${r.rate}원`
                          )
                          .join(" / ")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button className="cursor-pointer" size="sm" variant="ghost" onClick={() => openEdit(m)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button className="cursor-pointer" size="sm" variant="ghost" onClick={() => remove(m.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg [&>button]:cursor-pointer">
            <DialogHeader>
              <DialogTitle>{form.id ? "차종 수정" : "차종 추가"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">업체</label>
                  <Select
                    value={form.company}
                    onValueChange={(v) => {
                      const company = v as Company;
                      const fuel: FuelType = "gasoline";

                      const ranges = structuredClone(
                        DEFAULT_RANGES[company][fuel]
                      );

                      setForm({
                        ...form,
                        company,
                        fuel_type: fuel,
                        ranges,
                      });
                    }}
                  >
                    <SelectTrigger className="cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANIES.map((c) => (
                        <SelectItem className="cursor-pointer" key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">연료</label>
                  <Select
                    value={form.fuel_type}
                    onValueChange={(v) => {
                      const fuel = v as FuelType;

                      const ranges = structuredClone(
                        DEFAULT_RANGES[form.company][fuel]
                      );
            
                      setForm({ ...form, fuel_type: fuel, ranges });
                    }}
                  >
                    <SelectTrigger className="cursor-pointer"> 
                      {/* INPUT창에도 한글LABEL로 표시되게 VALUE를 LABEL로 변환 */}
                      <SelectValue>
                        {FUEL_TYPES.find((f) => f.value === form.fuel_type)?.label}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {FUEL_TYPES.map((f) => (
                        <SelectItem className="cursor-pointer" key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* 차량 분류 추가 */}
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">
                  차량 분류
                </label>

                <Select
                  value={form.category}
                  onValueChange={(v) =>
                    setForm({
                      ...form,
                      category: v as CarCategory,
                    })
                  }
                >
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="차량 분류를 선택하세요" />
                  </SelectTrigger>

                  <SelectContent>
                    {CAR_CATEGORIES.map((category) => (
                      <SelectItem className="cursor-pointer" key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">차종명</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="예: 아반떼 CN7"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">구간별 km당 요금</label>
                {form.ranges.map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={r.start}
                      disabled
                      className="w-20"
                    />
                    <span className="text-muted-foreground">~</span>
                    <Input
                      type="number"
                      value={r.end ?? ""}
                      onChange={(e) =>
                        updateRange(i, "end", e.target.value ? parseFloat(e.target.value) : null)
                      }
                      className="w-20"
                      disabled={i === form.ranges.length - 1}
                    />
                    <span className="text-muted-foreground">km</span>
                    <Input
                      type="number"
                      value={r.rate}
                      onChange={(e) => updateRange(i, "rate", parseFloat(e.target.value) || 0)}
                      step="10"
                      className="flex-1"
                    />
                    <span className="text-muted-foreground">원</span>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" className="cursor-pointer" onClick={() => setDialogOpen(false)}>
                취소
              </Button>
              <Button className="cursor-pointer" onClick={save}>
                저장
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Admin;