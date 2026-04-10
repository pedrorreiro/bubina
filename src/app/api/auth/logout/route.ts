import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  
  // O signOut do supabase-server limpa os cookies automaticamente via o handler de cookies
  return NextResponse.json({ success: true });
}
