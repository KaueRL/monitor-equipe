import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { enviarMensagemWhatsApp } from '@/lib/waha';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 });
    }

    // Busca todas as rotinas ativas
    const { data: rotinas, error } = await supabaseAdmin
      .from('rotinas')
      .select('*')
      .eq('status', 'ativo');

    if (error) {
      console.error('Erro ao buscar rotinas no Supabase:', error);
      return NextResponse.json({ erro: error.message }, { status: 500 });
    }

    const agora = new Date();
    const pendencias = [];

    for (const rotina of rotinas || []) {
      const ultimoCheckin = new Date(rotina.ultimo_checkin);
      const diferencaDias = (agora.getTime() - ultimoCheckin.getTime()) / (1000 * 60 * 60 * 24);
      const prazoLimite = rotina.prazo_dias || 3;

      if (diferencaDias >= prazoLimite) {
        pendencias.push({
          rotinaId: rotina.id,
          nomePrestador: rotina.nome_prestador || 'Prestador',
          titulo: rotina.titulo,
          diasAtraso: Math.floor(diferencaDias),
          ultimoCheckin: ultimoCheckin.toLocaleDateString('pt-BR'),
        });
      }
    }

    if (pendencias.length === 0) {
      return NextResponse.json({
        mensagem: 'Todos os membros estão em dia! Nenhum atraso identificado.',
        pendencias: 0,
      });
    }

    // WhatsApp do Gestor
    const telefoneGestor = process.env.TELEFONE_GESTOR || '5588981848592';
    const relatorioEnvios = [];

    for (const item of pendencias) {
      const mensagemAlerta = 
        `🚨 *ALERTA DE MONITORAMENTO DA EQUIPE*\n\n` +
        `O membro *${item.nomePrestador}* não realizou a função nos últimos *${item.diasAtraso} dias*!\n` +
        `📋 *Procedimento pendente:* ${item.titulo}\n` +
        `📅 *Último registro feito:* ${item.ultimoCheckin}\n\n` +
        `_Alerta automático disparado pelo sistema de monitoramento._`;

      try {
        await enviarMensagemWhatsApp(telefoneGestor, mensagemAlerta);

        // Registra histórico
        await supabaseAdmin.from('historico_alertas').insert({
          rotina_id: item.rotinaId,
          telefone_destinatario: telefoneGestor,
          mensagem: mensagemAlerta,
          sucesso: true,
        });

        relatorioEnvios.push({ prestador: item.nomePrestador, status: 'alerta_enviado_whatsapp' });
      } catch (envioErr: any) {
        console.error(`Falha ao disparar alerta para ${item.nomePrestador}:`, envioErr);
        relatorioEnvios.push({ prestador: item.nomePrestador, status: 'erro', detalhe: envioErr.message });
      }
    }

    return NextResponse.json({
      status: 'concluido',
      totalAtrasados: pendencias.length,
      envios: relatorioEnvios,
    });
  } catch (err: any) {
    console.error('Erro na execução do Cron:', err);
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}
