My Metas - Aplicativo Gerenciador de Metas
Este é um aplicativo mobile, desenvolvido em React Native com Expo, para ajudar usuários a gerenciar suas metas pessoais. O projeto utiliza Supabase como backend para autenticação, banco de dados e armazenamento de arquivos.

🚀 Tecnologias Principais
Frontend: React Native (com Expo Router) e TypeScript

Backend: Supabase (PostgreSQL, Auth, Storage)

✅ Pré-requisitos
Node.js (versão 20.x ou superior)

npm ou yarn

App Expo Go no seu celular (Android/iOS)

Uma conta gratuita no Supabase

🔧 Como Rodar a Aplicação
1. Configure o Backend no Supabase
Crie um novo projeto no Supabase.

No Table Editor, crie as tabelas Metas e Steps com as colunas necessárias.

No Storage, crie um bucket público chamado avatars.

Configure as Políticas de Segurança (RLS) para as tabelas e para o bucket, permitindo que apenas usuários autenticados gerenciem seus próprios dados.

2. Configure o Frontend
Clone este repositório para a sua máquina.

Navegue até a pasta do projeto e instale as dependências:

npm install

Crie um arquivo chamado .env na raiz do projeto.

Adicione suas chaves do Supabase ao arquivo .env:

EXPO_PUBLIC_SUPABASE_URL="SUA_URL_DO_PROJETO_SUPABASE"
EXPO_PUBLIC_SUPABASE_ANON_KEY="SUA_CHAVE_ANON_SUPABASE"

(Você encontra essas chaves em Project Settings > API no seu painel do Supabase).

3. Inicie o Aplicativo
Com tudo configurado, inicie o servidor de desenvolvimento do Expo:

npx expo start

Escaneie o QR Code com o aplicativo Expo Go no seu celular.

📱 Uso
Crie uma conta e faça login.

Na tela principal, você pode criar, buscar e ver suas metas.

Clique em uma meta para ver os detalhes e gerenciar suas etapas.

Acesse seu perfil para alterar seu nome, senha e foto.

Use o ícone de sol/lua na tela de perfil para alternar entre os temas claro e escuro.

Desenvolvido por Ian Thalles Lima Rocha.