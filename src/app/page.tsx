import { FareCalculator } from "@/components/FareCalculator";
import { Car } from "lucide-react";
import Link from "next/link";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <header className="text-center mb-12 space-y-4">
          <div className="flex justify-center mb-4">
            <div 
              className="p-4 rounded-2xl bg-gradient-to-br from-primary to-primary-glow inline-block animate-in zoom-in duration-700"
              style={{ boxShadow: 'var(--shadow-elegant)' }}
            >
              <Car className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent animate-in fade-in slide-in-from-top-4 duration-700">
            카셰어링 주행료 계산기
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-top-6 duration-700 delay-100">
            쏘카, G car, 투루카 등 카셰어링 주행료를 정확하게 계산하세요!
          </p>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          <FareCalculator />
        </div>

        <footer className="mt-16 text-center text-sm text-muted-foreground animate-in fade-in duration-700 delay-300 space-y-2">
          <p>© 2026 카셰어링 주행료 계산기. 정확하고 빠른 요금 계산</p>
          {/* <Link href="/admin" className="text-xs hover:text-foreground underline">관리자</Link> */}
        </footer>
      </div>
    </div>
  );
};

export default Index;