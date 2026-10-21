'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Send, 
  LogOut, 
  User, 
  RefreshCw, 
  Calendar, 
  Plus
} from 'lucide-react';

interface Rotina {
  id: string;
  titulo: string;
  prazo_dias: number;
  ultimo_checkin: string;
  status: string;
  prestador?: {
    nome: string;
    telefone: string;
    email: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [rotinas, setRotinas] = useState<Rotina[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [cronRunning, setCronRunning] = useState(false);
  const [cronResult, setCronResult] = useState<any>(null);

  // Modal para criar nova rotina
  const [showModal, setShowModal] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novoPrazo, setNovoPrazo] = useState(3);

  useEffect(() => {
    carregarUsuario();
  }, []);

  const carregarUsuario = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    setUser(session.user);
    carregarRotinas(session.user.id);
  };

  const carregarRotinas = async (userId: string) => {
    setLoading(true);
    // Busca as rotinas do usuário logado
    const { data, error } = await supabase
      .from('rotinas')
      .select('*')
      .eq('prestador_id', userId)
      .order('criado_em', { ascending: false });

    if (!error && data) {
      setRotinas(data);
    }
    setLoading(false);
  };

  const fazerCheckin = async (rotinaId: string) => {
    setActionLoading(rotinaId);
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rotinaId }),
      });

      if (res.ok) {
        if (user) carregarRotinas(user.id);
      } else {
        alert('Erro ao registrar procedimento.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const criarRotina = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoTitulo.trim() || !user) return;

    const { error } = await supabase.from('rotinas').insert({
      prestador_id: user.id,
      titulo: novoTitulo,
      prazo_dias: novoPrazo,
      ultimo_checkin: new Date().toISOString(),
      status: 'ativo',
    });

    if (!error) {
      setShowModal(false);
      setNovoTitulo('');
      carregarRotinas(user.id);
    } else {
      alert(error.message);
    }
  };

  const testarCronDisparo = async () => {
    setCronRunning(true);
    setCronResult(null);
    try {
      const res = await fetch('/api/cron/verificar');
      const data = await res.json();
      setCronResult(data);
    } catch (err: any) {
      setCronResult({ erro: err.message });
    } finally {
      setCronRunning(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Calcula dias desde o último check-in
  const getStatusRotina = (ultimoCheckinStr: string, prazoDias: number) => {
    const agora = new Date();
    const ultimo = new Date(ultimoCheckinStr);
    const diffHoras = (agora.getTime() - ultimo.getTime()) / (1000 * 60 * 60);
    const diffDias = Math.floor(diffHoras / 24);

    const atrasado = diffDias >= prazoDias;
    return {
      diffDias,
      atrasado,
      restanteDias: Math.max(0, prazoDias - diffDias),
    };
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Topo */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/30">
            M
          </div>
          <div>
            <h1 className="font-semibold text-sm leading-tight text-white">Painel de Monitoramento</h1>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={testarCronDisparo}
            disabled={cronRunning}
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition disabled:opacity-50"
            title="Simula a execução do cron da Vercel agora mesmo"
          >
            <Send className="w-3.5 h-3.5" />
            {cronRunning ? 'Verificando...' : 'Testar Alerta WhatsApp'}
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sair
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-5xl mx-auto w-full px-6 py-10 flex-1">
        {/* Banner do teste de cron */}
        {cronResult && (
          <div className="mb-6 p-4 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300">
            <span className="font-bold text-amber-400">Resultado do Teste do Cron:</span>
            <pre className="mt-2 p-3 bg-slate-950 rounded-lg overflow-x-auto text-[11px] text-emerald-400">
              {JSON.stringify(cronResult, null, 2)}
            </pre>
          </div>
        )}

        {/* Cabeçalho da seção */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-white">Suas Rotinas e Procedimentos</h2>
            <p className="text-slate-400 text-sm">
              Confirme seus procedimentos periódicos para manter seu status em dia.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-xs transition"
          >
            <Plus className="w-4 h-4" />
            Nova Rotina / Tarefa
          </button>
        </div>

        {/* Lista de Rotinas */}
        {loading ? (
          <div className="text-center py-20 text-slate-500 text-sm">Carregando rotinas...</div>
        ) : rotinas.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800">
            <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="font-semibold text-white mb-1">Nenhum procedimento cadastrado</h3>
            <p className="text-sm text-slate-400 mb-6">
              Clique no botão abaixo para adicionar a primeira tarefa periódica.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition"
            >
              Criar Rotina de Teste
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rotinas.map((rotina) => {
              const status = getStatusRotina(rotina.ultimo_checkin, rotina.prazo_dias);
              const dataFormatada = new Date(rotina.ultimo_checkin).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={rotina.id}
                  className={`p-6 rounded-2xl border transition ${
                    status.atrasado
                      ? 'bg-red-950/20 border-red-500/30'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h3 className="font-bold text-white text-base">{rotina.titulo}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Último check-in: {dataFormatada}
                      </div>
                    </div>

                    {status.atrasado ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold">
                        <AlertTriangle className="w-3 h-3" />
                        Atrasado ({status.diffDias} dias)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        Em dia ({status.restanteDias}d restantes)
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 mb-6">
                    Prazo de tolerância de <strong className="text-slate-300">{rotina.prazo_dias} dias</strong> antes do alerta ser disparado no WhatsApp.
                  </p>

                  <button
                    onClick={() => fazerCheckin(rotina.id)}
                    disabled={actionLoading === rotina.id}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {actionLoading === rotina.id
                      ? 'Gravando...'
                      : 'Confirmar Procedimento Feito Hoje'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal para criar rotina */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-2">Adicionar Procedimento</h3>
            <p className="text-xs text-slate-400 mb-4">
              Defina o nome da tarefa e o número de dias limite de inatividade.
            </p>

            <form onSubmit={criarRotina} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Título do Procedimento</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Atualização de Planilha / Relatório"
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Prazo de Alerta (Dias)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={novoPrazo}
                  onChange={(e) => setNovoPrazo(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
