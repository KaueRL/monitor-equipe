# Monitor de Equipe & Alertas Automáticos de WhatsApp (WAHA)

Sistema completo de monitoramento de rotinas para funcionários e prestadores de serviço com:
- **Frontend & Backend**: Next.js (App Router) hospedado na **Vercel**
- **Agendamento**: Vercel Cron Job diário (`vercel.json`)
- **Autenticação & Banco de Dados**: Supabase (PostgreSQL + RLS)
- **Disparo de WhatsApp**: Integração REST via **WAHA** (WhatsApp HTTP API)

---

## 🚀 Como subir este projeto no GitHub e Vercel (Passo a Passo)

### 1. Inicializar o Git e Subir para o GitHub

No terminal, dentro da pasta deste projeto:

```bash
git init
git add .
git commit -m "feat: setup monitor-equipe completo"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```

---

### 2. Configurar o Supabase

1. Crie um projeto no [Supabase](https://supabase.com).
2. Vá em **SQL Editor** e execute o script que está no arquivo `schema.sql` deste projeto.
3. Vá em **Project Settings > API** e copie:
   - `Project URL` (URL do projeto)
   - `anon public` (Chave pública)
   - `service_role` (Chave secreta de administrador)

---

### 3. Conectar na Vercel

1. Acesse o [Vercel Dashboard](https://vercel.com/dashboard).
2. Clique em **"Add New..." > "Project"**.
3. Selecione o repositório que você acabou de subir no GitHub.
4. Na seção **Environment Variables**, adicione as seguintes variáveis:
   - `NEXT_PUBLIC_SUPABASE_URL`: sua URL do Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: sua chave pública do Supabase
   - `SUPABASE_SERVICE_ROLE_KEY`: sua chave de serviço/admin do Supabase
   - `WAHA_API_URL`: URL pública do seu container WAHA (ex: `https://meu-waha.onrender.com`)
   - `WAHA_API_KEY`: A chave secreta que você configurou no WAHA
   - `TELEFONE_GESTOR`: Seu número de WhatsApp com DDI e DDD (ex: `5511999999999`)
   - `CRON_SECRET`: Uma chave segura qualquer para proteger o cron job da Vercel
5. Clique em **Deploy**!

A cada `git push origin main`, a Vercel atualizará seu sistema automaticamente.
O cron job configurado no `vercel.json` fará a checagem automática das tarefas todos os dias e disparará alertas pelo WAHA sempre que alguém atingir o prazo de tolerância (2 a 3 dias).
