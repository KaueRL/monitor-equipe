import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { enviarMensagemWhatsApp } from '@/lib/waha';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // 1. Validação de segurança do cron da Vercel
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 });
    }

    // 2. Busca todas as rotinas ativas com os dados do prestador
    const { data: rotinas, error } = await supabaseAdmin
      .from('rotinas')
      .select(`
        id,
        titulo,
        prazo_dias,
        ultimo_checkin,
        status,
        prestador:perfis (id, nome, email, telefone)
      `)
      .eq('status', 'ativo');

    if (error) {
      console.error('Erro ao buscar rotinas no Supabase:', error);
      return NextResponse.json({ erro: error.message }, { status: 500 });
    }

    const agora = new Date();
    const pendencias = [];

    // 3. Itera sobre as rotinas e verifica o prazo de inatividade
    for (const rotina of rotinas || []) {
      const prestador = Array.isArray(rotina.prestador) ? rotina.prestador[0] : rotina.prestador;
      if (!prestador) continue;

      const ultimoCheckin = new Date(rotina.ultimo_checkin);
      const diferencaDias = (agora.getTime() - ultimoCheckin.getTime()) / (1000 * 60 * 60 * 24);
      const prazoLimite = rotina.prazo_dias || 3;

      if (diferencaDias >= prazoLimite) {
        pendencias.push({
          rotinaId: rotina.id,
          titulo: rotina.titulo,
          diasAtraso: Math.floor(diferencaDias),
          ultimoCheckin: ultimoCheckin.toLocaleDateString('pt-BR'),
          prestadorNome: prestador.nome,
          prestadorTelefone: prestador.telefone,
        });
      }
    }

    if (pendencias.length === 0) {
      return NextResponse.json({
        mensagem: 'Nenhum atraso detectado. Todos os prestadores estão em dia!',
        pendencias: 0,
      });
    }

    // 4. Dispara os alertas via WAHA
    const telefoneGestor = process.env.TELEFONE_GESTOR;
    const relatorioEnvios = [];

    for (const item of pendencias) {
      const mensagemGestor = 
        `🚨 *ALERTA DE MONITORAMENTO*\n\n` +
        `O prestador *${item.prestadorNome}* está inativo há *${item.diasAtraso} dias*!\n` +
        `📋 *Procedimento pendente:* ${item.titulo}\n` +
        `📅 *Último registro:* ${item.ultimoCheckin}\n` +
        `📞 *Contato:* ${item.prestadorTelefone || 'Não informado'}\n\n` +
        `_Ação necessária: Entre em contato ou acesse o painel._`;

      try {
        // Envia para o WhatsApp do Gestor
        if (telefoneGestor) {
          await enviarMensagemWhatsApp(telefoneGestor, mensagemGestor);
        }

        // Se o prestador tiver telefone cadastrado, envia um lembrete para ele também
        if (item.prestadorTelefone) {
          const mensagemPrestador =
            `Olá, *${item.prestadorNome}*!\n\n` +
            `Notamos que você ainda não realizou o check-in do procedimento *${item.titulo}* nos últimos ${item.diasAtraso} dias.\n` +
            `Por favor, acesse o painel da equipe para registrar sua atividade pendente. Obrigado!`;

          await enviarMensagemWhatsApp(item.prestadorTelefone, mensagemPrestador);
        }

        // Registra histórico no banco
        await supabaseAdmin.from('historico_alertas').insert({
          rotina_id: item.rotinaId,
          telefone_destinatario: telefoneGestor || item.prestadorTelefone || 'N/A',
          mensagem: mensagemGestor,
          sucesso: true,
        });

        relatorioEnvios.push({ prestador: item.prestadorNome, status: 'enviado' });
      } catch (envioErr: any) {
        console.error(`Falha ao disparar alerta para ${item.prestadorNome}:`, envioErr);
        relatorioEnvios.push({ prestador: item.prestadorNome, status: 'falha', erro: envioErr.message });
      }
    }

    return NextResponse.json({
      status: 'concluido',
      totalPendentes: pendencias.length,
      envios: relatorioEnvios,
    });
  } catch (err: any) {
    console.error('Erro na execução do Cron:', err);
    return NextResponse.json({ erro: err.message }, { status: 500 });
  }
}
