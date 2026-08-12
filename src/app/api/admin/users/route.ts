import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/requireAdmin";

export async function GET(request: Request) {
   try{
    /* 관리자 권한 확인 */
    await requireAdmin(request);

    // 모든 auth 사용자 가져오기
    const {
        data: usersData,
        error: usersError
    } = await supabaseAdmin.auth.admin.listUsers();
    if (usersError) {
        return NextResponse.json(
        {
            error: usersError.message
        },
        {
            status:500
        }
        );
    }

    // user_roles 가져오기
    const {
        data: roles,
        error: rolesError
    } = await supabaseAdmin
        .from("user_roles")
        .select(
        "user_id, role, approved_at, approved_by"
        );

    if (rolesError) {
        return NextResponse.json(
        {
            error: rolesError.message
        },
        {
            status:500
        }
        );
    }
    const users = usersData.users;

    /*승인 대기 회원 user_roles에 없는 사용자*/
    const pendingUsers = users
        .filter(
        (user)=>
            !roles.some(
            (role)=>
                role.user_id === user.id
            )
        )
        .map((user)=>({
        id:user.id,
        email:user.email,
        created_at:user.created_at
        }));

    /*관리자 목록*/
    const admins = roles
        .filter((role) => role.role === "admin")
        .map((admin)=>{

            const user = users.find(
            (u)=>u.id === admin.user_id
            );

            const approver = users.find(
            (u)=>u.id === admin.approved_by
            );

            return {
            id: admin.user_id,
            email: user?.email,
            approved_at: admin.approved_at,
            approved_by: approver?.email ?? null
            };
        });
        return NextResponse.json({
          pendingUsers,
          admins
        });
        
    } catch(error) {

    return NextResponse.json(
      {
        error:
          error instanceof Error
          ? error.message
          : "서버 오류"
      },
      {
        status:403
      }
    );

  }
}