-- SCRIPT SQL PARA O SUPABASE (SQL EDITOR)

-- 1. Tabela com o perfil dos usuários e telefones
CREATE TABLE IF NOT EXISTS public.perfis (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL, -- Formato internacional: 5511999999999
  tipo TEXT DEFAULT 'prestador', -- 'admin' ou 'prestador'
  criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabela de rotinas e procedimentos
CREATE TABLE IF NOT EXISTS public.rotinas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  prestador_id UUID REFERENCES public.perfis(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  prazo_dias INT DEFAULT 3, -- Disparar alerta se passar de X dias sem atividade
  ultimo_checkin TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'ativo',
  atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de histórico de alertas enviados pelo WhatsApp
CREATE TABLE IF NOT EXISTS public.historico_alertas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rotina_id UUID REFERENCES public.rotinas(id) ON DELETE CASCADE,
  telefone_destinatario TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  sucesso BOOLEAN DEFAULT true,
  enviado_em TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rotinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_alertas ENABLE ROW LEVEL SECURITY;

-- Políticas
CREATE POLICY "Permitir leitura de perfis para autenticados" ON public.perfis 
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Prestador visualiza suas próprias rotinas" ON public.rotinas 
  FOR SELECT TO authenticated USING (auth.uid() = prestador_id);

CREATE POLICY "Prestador atualiza seu próprio checkin" ON public.rotinas 
  FOR UPDATE TO authenticated USING (auth.uid() = prestador_id);

-- Trigger para criar perfil automaticamente quando um usuário se cadastrar no Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.perfis (id, nome, email, telefone, tipo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Prestador'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'telefone', ''),
    COALESCE(NEW.raw_user_meta_data->>'tipo', 'prestador')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
