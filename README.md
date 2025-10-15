# Produtivamente

![Produtivamente Logo](https://img.shields.io/badge/Produtivamente-App%20de%20Produtividade%20com%20IA-blue)

## 📋 Sobre o Projeto

Produtivamente é um aplicativo de produtividade pessoal que utiliza inteligência artificial para sugerir rotinas e tarefas personalizadas com base no comportamento do usuário. O aplicativo incorpora elementos de gamificação como pontos, níveis, conquistas e desafios diários para aumentar a motivação e o engajamento.

### 🎯 Objetivos

- Aumentar a produtividade dos usuários através de metas e desafios diários
- Melhorar o foco e a organização pessoal
- Tornar o processo de organização mais divertido e engajador com gamificação
- Oferecer sugestões personalizadas com IA, otimizando o tempo do usuário

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** - Ambiente de execução JavaScript
- **Express** - Framework web para Node.js
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticação baseada em tokens
- **Bcrypt** - Criptografia de senhas
- **Axios** - Cliente HTTP para requisições externas
- **Google Gemini API** - API de inteligência artificial para recomendações personalizadas

### Frontend
- **React 18** - Biblioteca JavaScript para construção de interfaces
- **TypeScript** - Superset tipado de JavaScript
- **Material UI** - Biblioteca de componentes React
- **React Router** - Roteamento para aplicações React
- **Axios** - Cliente HTTP para requisições à API
- **Chart.js** - Biblioteca para visualização de dados
- **Formik & Yup** - Gerenciamento e validação de formulários

## 🏗️ Arquitetura do Projeto

```
produtivamente/
├── backend/
│   ├── config/         # Configurações (banco de dados, chaves)
│   ├── controllers/    # Controladores da API
│   ├── middleware/     # Middlewares (autenticação, etc.)
│   ├── models/         # Modelos de dados (Mongoose)
│   ├── routes/         # Rotas da API
│   └── server.js       # Ponto de entrada do servidor
│
└── frontend/
    ├── public/         # Arquivos estáticos
    └── src/
        ├── components/ # Componentes React reutilizáveis
        ├── contexts/   # Contextos React (autenticação, etc.)
        ├── pages/      # Páginas da aplicação
        └── services/   # Serviços (API, etc.)
```

## 🔧 Instalação e Configuração

### Pré-requisitos
- Node.js (v14 ou superior)
- npm ou yarn
- MongoDB (local ou na nuvem)
- Conta Google Cloud com acesso à API Gemini

### Backend

1. Navegue até a pasta do backend:
```bash
cd produtivamente/backend
```

2. Instale as dependências:
```bash
npm install
```

4. Inicie o servidor:
```bash
npm start
```
ou em modo de desenvolvimento:
```bash
npm run dev
```

### Frontend

1. Navegue até a pasta do frontend:
```bash
cd produtivamente/frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o aplicativo:
```bash
npm start
```

4. Para criar uma build de produção:
```bash
npm run build
```

## 🌟 Funcionalidades

### 🔐 Autenticação
- Registro de usuários
- Login com JWT
- Proteção de rotas privadas

### 📋 Gerenciamento de Tarefas
- Criação, edição e exclusão de tarefas
- Categorização por prioridade
- Marcação de tarefas concluídas
- Visualização de tarefas pendentes e concluídas

### 🏆 Sistema de Gamificação
- Pontos por tarefas concluídas
- Sistema de níveis baseado em pontos
- Conquistas desbloqueáveis
- Desafios diários

### 🤖 Recomendações de IA
- Sugestões de tarefas personalizadas
- Rotinas diárias otimizadas
- Dicas de produtividade contextuais

### 📊 Dashboard
- Visão geral de produtividade
- Estatísticas de tarefas e conquistas
- Progresso de nível e pontos
- Recomendações personalizadas

## 📱 Telas Principais

### Dashboard
Visão geral da produtividade do usuário, com estatísticas, tarefas recentes, conquistas e recomendações de IA.

### Tarefas
Gerenciamento completo de tarefas, com criação, edição, exclusão e marcação de conclusão.

### Conquistas
Visualização de conquistas desbloqueadas e disponíveis, com sistema de pontos e recompensas.

### Recomendações IA
Sugestões personalizadas de tarefas, rotinas diárias e dicas de produtividade geradas pela API Gemini.

### Perfil
Informações do usuário, estatísticas de produtividade e configurações da conta.

## 🔌 Integração com API Gemini

O aplicativo utiliza a API Gemini do Google para gerar recomendações personalizadas. A integração é feita através do controlador `aiController.js` no backend, que se comunica com a API para:

1. Gerar sugestões de tarefas personalizadas
2. Criar rotinas diárias otimizadas
3. Fornecer dicas de produtividade contextuais

## 🔄 Fluxo de Dados

1. O usuário interage com a interface React
2. O frontend faz requisições à API Express
3. O backend processa as requisições e se comunica com o MongoDB
4. Para recomendações personalizadas, o backend consulta a API Gemini
5. Os resultados são retornados ao frontend e exibidos ao usuário
