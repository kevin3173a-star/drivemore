"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth,useIsAdmin  } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { LogOut, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface PendingUser {
  id: string;
  email: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const { user, loading: authLoading  } = useAuth();
  /* 권한 상태 추가 */
  const { isAdmin, loading: roleLoading } = useIsAdmin(user?.id);
  const [users, setUsers] = useState<PendingUser[]>([]);
  const router = useRouter();
  interface AdminUser {
  id: string;
  email: string;
  approved_at: string | null;
  approved_by: string | null;
  }
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
        try {
            const {
            data: { session },
            } = await supabase.auth.getSession();

            const res = await fetch("/api/admin/users", {
            headers: {
                Authorization: `Bearer ${session?.access_token}`,
            },
            });

            const data = await res.json();

            setUsers(data.pendingUsers ?? []);
            setAdmins(data.admins ?? []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
  };
  
  /* 관리자 승인 함수 */
  const approveUser = async (userId:string)=>{

  if(!user) return;

  const {
  data: { session },
} = await supabase.auth.getSession();

const res = await fetch("/api/admin/approve", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session?.access_token}`,
  },
  body: JSON.stringify({
    user_id: userId,
  }),
});

  if(res.ok){
        alert("승인 완료");
        fetchUsers();
    } else {
        const data = await res.json();
        alert(data.error);
    }
    };

    useEffect(() => {
    if (isAdmin) {
        fetchUsers();
    }
    }, [isAdmin]);
 
  /* 관리자 해제 함수 */
  const removeAdmin = async (userId:string)=>{

  const {
    data: { session },
    } = await supabase.auth.getSession();

  const res = await fetch("/api/admin/remove",{
    method:"DELETE",
    headers:{
      "Content-Type":"application/json",
      Authorization: `Bearer ${session?.access_token}`,
    },
    body:JSON.stringify({
      user_id:userId
    })
  });

  if(res.ok){
    alert("관리자 해제 완료");
    fetchUsers();
  } else {
    const data = await res.json();
    alert(data.error);
  }
};

if (authLoading || roleLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      로딩 중...
    </div>
  );
}

if (!isAdmin) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-muted-foreground">
        관리자 권한이 없습니다.
      </p>
    </div>
  );
}

const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
};

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
                <Link href="/admin" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-xl font-bold">관리자 관리</h1>
            </div>
            <div className="flex gap-2">
                <Button className="cursor-pointer" size="sm" variant="ghost" onClick={signOut}>
                  로그아웃<LogOut className="w-4 h-4" />
                </Button>
            </div>
        </div>
        <Card className="w-[1024px] max-w-[calc(100vw-2rem)] mx-auto">
          <CardHeader>
            <CardTitle className="text-base">
              승인 대기 회원 ({users.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
                <p className="text-sm text-muted-foreground text-center">
                  불러오는 중...
                </p>
            ) : users.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center">
                승인 대기 회원이 없습니다.
              </p>

            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      이메일
                    </TableHead>
                    <TableHead>
                      가입일
                    </TableHead>
                    <TableHead>
                      관리
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {users.map((user)=>(
                    <TableRow key={user.id}>
                      <TableCell>
                        {user.email}
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at)
                          .toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                            className="cursor-pointer"
                            size="sm"
                            onClick={()=>approveUser(user.id)}
                        >
                            승인
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* 관리자 목록 */}
        <Card className="mt-6">
            <CardHeader>
                <CardTitle className="text-base">
                관리자 목록 ({admins.length})
                </CardTitle>
            </CardHeader>
            <CardContent>
                 {loading ? (
                    <p className="text-sm text-muted-foreground text-center">
                    불러오는 중...
                    </p>
                ) : admins.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center">
                    등록된 관리자가 없습니다.
                    </p>
                ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>이메일</TableHead>
                        <TableHead>승인자</TableHead>
                        <TableHead>승인일</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {admins.map((admin)=>(
                        <TableRow key={admin.id}>
                            <TableCell>
                            {admin.email}
                            </TableCell>
                            <TableCell>
                            {admin.approved_by ?? "-"}
                            </TableCell>
                            <TableCell>
                            {
                                admin.approved_at
                                ?
                                new Date(admin.approved_at)
                                .toLocaleDateString()
                                :
                                "-"
                            }
                            </TableCell>
                            <TableCell>
                                <Button
                                    className="cursor-pointer"
                                    size="sm"
                                    variant="destructive"
                                    onClick={()=>removeAdmin(admin.id)}
                                >
                                    관리자 해제
                                </Button>
                            </TableCell>
                        </TableRow>

                        ))}
                    </TableBody>
                </Table>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}