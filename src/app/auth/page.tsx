"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
const { data } = await supabase.auth.getSession();
const Auth = () => {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.push("/admin");
    });
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });
      console.log("signup error:", error);
      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("가입 완료. 관리자 승인 후 로그인 가능합니다.");

      // 입력값 초기화
      setEmail("");
      setPassword("");

      // 로그인 모드 변경
      setMode("signin");

    } else {
      setLoading(true);

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim()
        });

        console.log("error:", error);
        console.log("email:", email);
        console.log("password:", password);
        console.log("session:", data?.session);

        if (error) {
          toast.error("이메일 또는 비밀번호가 올바르지 않습니다.");
          return;
        }

        // 관리자 권한 확인
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.user.id)
          .maybeSingle();

        if (!roleData || roleData.role !== "admin") {
          await supabase.auth.signOut();

          toast.error("관리자 승인 후 로그인 가능합니다.");
          return;
        }

        router.push("/admin");

      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/10 px-4">
      <div className="w-full max-w-md mx-auto">
        <div className="mb-3">
          <Button
            variant="ghost"
            className="px-2 cursor-pointer"
            onClick={() => router.push("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-1 " />
            홈으로
          </Button>
        </div>

        <Card className="relative w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl">
              관리자 {mode === "signin" ? "로그인" : "등록하기"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <Input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <Button type="submit" className="w-full cursor-pointer" disabled={loading}>
                {mode === "signin" ? "로그인" : "등록하기"}
              </Button>
              <button
                type="button"
                className="w-full text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              >
                {mode === "signin" ? "관리자 등록하기" : "이미 관리자로 승인받으셨나요? 로그인"}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
