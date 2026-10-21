'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, BellRing, ShieldCheck, Clock } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl border border-emerald-500/30">
            M
          </div>
          <span className="font-semibold text-lg tracking-tight">Monitor Equipe</span>
        </div>
        <Link
          href="/login"
          className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-medium text-sm transition"
        >
          Acessar Painel
        </Link>
      </header>

      {/* Hero Section */}
      <main className="max-w-4xl mx-auto px-6 py-20 text-center flex-1 flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-6">
          <Clock className="w-3.5 h-3.5" />
          Monitoramento Automático 2 a 3 Dias
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6">
          Controle de procedimentos e alertas via <span className="text-emerald-400">WhatsApp</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mb-10">
          Seus prestadores e funcionários realizam o check-in das tarefas obrigatórias. Caso passem 3 dias sem atualizar, nosso sistema dispara um alerta direto no WhatsApp.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold text-base transition shadow-lg shadow-emerald-500/20"
          >
            Fazer Login com Supabase
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-base transition border border-slate-700"
          >
            Ver Dashboard
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full text-left">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-3" />
            <h3 className="font-semibold text-white mb-1">Check-in Descomplicado</h3>
            <p className="text-sm text-slate-400">O prestador acessa pelo celular ou computador e confirma o procedimento em um clique.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <BellRing className="w-8 h-8 text-amber-400 mb-3" />
            <h3 className="font-semibold text-white mb-1">Alertas pelo WAHA</h3>
            <p className="text-sm text-slate-400">Notificações automáticas no WhatsApp para você e para o colaborador em atraso.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <ShieldCheck className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="font-semibold text-white mb-1">Hospedagem Gratuita</h3>
            <p className="text-sm text-slate-400">Estrutura 100% pronta para Vercel Serverless com banco Supabase.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        Monitor Equipe © 2026 • Vercel + Supabase + WAHA
      </footer>
    </div>
  );
}
