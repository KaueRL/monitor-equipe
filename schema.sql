-- TABELAS SIMPLIFICADAS PARA SISTEMA FECHADO

CREATE TABLE IF NOT EXISTS public.rotinas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_prestador TEXT NOT NULL,
  titulo TEXT NOT NULL,
  prazo_dias INT DEFAULT 3,
  ultimo_checkin TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'ativo',
  criado_em TIMESTAMPTZ DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.historico_alertas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rotina_id UUID REFERENCES public.rotinas(id) ON DELETE CASCADE,
  telefone_destinatario TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  sucesso BOOLEAN DEFAULT true,
  enviado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.rotinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_alertas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso completo para usuarios autenticados" ON public.rotinas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Historico visivel para autenticados" ON public.historico_alertas
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
