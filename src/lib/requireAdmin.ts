import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "./supabaseAdmin";

export async function requireAdmin(
  request: Request
) {
  const authHeader = request.headers.get(
    "Authorization"
  );

  if (!authHeader) {
    throw new Error("인증 토큰이 없습니다.");
  }

  const token = authHeader.replace(
    "Bearer ",
    ""
  );

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const {
    data:{
      user
    },
    error
  } = await supabase.auth.getUser(token);


  if(error || !user){
    throw new Error("로그인이 필요합니다.");
  }

  const {
    data:role,
    error:roleError
  } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();


  if(roleError || role?.role !== "admin"){
    throw new Error("관리자 권한이 없습니다.");
  }

  return user;
}