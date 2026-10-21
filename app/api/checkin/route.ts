import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(request: Request) {
  try {
    const { rotinaId } = await request.json();

    if (!rotinaId) {
      return NextResponse.json({ erro: 'ID da rotina é obrigatório' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('rotinas')
      .update({
        ultimo_checkin: new Date().toISOString(),
        atualizado_em: new Date().toISOString(),
      })
      .eq('id', rotinaId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ erro: error.message }, { status: 500 });
    }

    return NextResponse.json({
      status: 'sucesso',
      mensagem: 'Procedimento confirmado com sucesso!',
      rotina: data,
    });
  } catch (err: any) {
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}
