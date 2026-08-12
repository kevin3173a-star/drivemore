import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/requireAdmin";

export async function DELETE(req: Request) {
  try {

    /* 관리자 권한 확인 */
    await requireAdmin(req);

    const body = await req.json();
    const {
      user_id
    } = body;

    if (!user_id) {
      return NextResponse.json(
        {
          error: "user_id가 없습니다."
        },
        {
          status:400
        }
      );
    }

    const { data: admins, error: adminsError } = await supabaseAdmin
        .from("user_roles")
        .select("user_id")
        .eq("role", "admin");


        if (adminsError) {
        return NextResponse.json(
            {
            error: adminsError.message
            },
            {
            status:500
            }
        );
        }


        if (admins.length <= 1) {
        return NextResponse.json(
            {
            error: "마지막 관리자는 해제할 수 없습니다."
            },
            {
            status:400
            }
        );
    }

    const { error } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", user_id)
      .eq("role", "admin");

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