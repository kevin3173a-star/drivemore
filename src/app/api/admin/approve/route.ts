import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/requireAdmin";

export async function POST(req: Request) {
  try {
    /* 관리자 권한 확인 */
    const adminUser = await requireAdmin(req);

    const body = await req.json();
    const {
      user_id,
    } = body;

    if (!user_id) {
      return NextResponse.json(
        {
          error: "필수 값이 없습니다."
        },
        {
          status:400
        }
      );
    }

    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({
        user_id,
        role: "admin",
        approved_at: new Date().toISOString(),
        approved_by: adminUser.id
      });

    if(error){
      return NextResponse.json(
        {
          error:error.message
        },
        {
          status:500
        }
      );
    }

    return NextResponse.json({
      success:true
    });

  } catch(error){

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