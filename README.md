# 🍔 AppFood – Protótipo Full-Stack com Pythagora

![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18-green?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express.js-server-lightgrey?style=for-the-badge&logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-database-brightgreen?style=for-the-badge&logo=mongodb)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3.x-teal?style=for-the-badge&logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=for-the-badge&logo=typescript)

---

## 📄 Descrição do Projeto

**AppFood** é um protótipo de aplicação de gerenciamento de restaurantes, desenvolvido usando **React + Vite** no front-end e **Node.js/Express** no back-end, com persistência em **MongoDB**.  

A aplicação inclui funcionalidades de:

- Dashboard administrativo com métricas de vendas, pedidos e produtos.
- Gestão de categorias, produtos, estoque e pedidos.
- Carrinho de compras, checkout e rastreamento de pedidos.
- Painel de analytics com gráficos e relatórios.
- Autenticação segura com tokens JWT e refresh tokens.
- Integração front-end/back-end via API REST.

> 🔎 Contexto: projeto desenvolvido como experimento usando **Pythagora**, explorando boas práticas de arquitetura full-stack e UI moderna com TailwindCSS + shadcn/ui.

---

## 🧠 Arquitetura Geral

```text
[Cliente - React/TS] ----> [Servidor - Node.js/Express]
        |                           |
        |  UI + Context API         |  Rotas REST, Serviços, Analytics
        |                           |
        v                           v
  [Tailwind + shadcn/ui]      [Banco de Dados MongoDB]

🛠️ Tecnologias e Ferramentas

Front-end

- React + Vite
- TypeScript
- TailwindCSS + shadcn/ui
- Context API (Auth, Hooks customizados)
- React Router (rotas públicas e protegidas)

Back-end

- Node.js + Express
- Serviços modulares (auth, analytics, inventory, orders, products, categories, cart)
- JWT + Refresh Tokens
- Sessões com `connect-mongo`
- Middleware de autenticação e autorização

Infraestrutura

- MongoDB
- Estrutura modular `client/`, `server/`, `shared/`
- Configuração via `dotenv` e `server/config/database.js`
- Proxy dev-server via Vite para `/api`

---

## 📂 Estrutura do Código

AppFood/
│
├── client/              # Front-end (React + TS + Vite + Tailwind)
│   ├── src/
│   │   ├── api/         # Consumo de rotas do backend
│   │   ├── components/  # Componentes reutilizáveis
│   │   ├── contexts/    # AuthContext e hooks customizados
│   │   ├── pages/       # Páginas (Login, AdminDashboard, Analytics, Checkout, etc.)
│   │   └── lib/         # Funções utilitárias
│
├── server/              # Back-end (Node.js + Express)
│   ├── config/          # Configuração do banco de dados (database.js)
│   ├── models/          # Modelos Mongoose (User, Product, Order, Cart, Stock, etc.)
│   ├── routes/          # Rotas e middlewares
│   │   └── middlewares/ # Middlewares de autenticação
│   ├── services/        # Lógica de negócio (Analytics, Inventory, User, LLM)
│   └── utils/           # Funções auxiliares (auth, password)
│
├── shared/              # Tipos e configs compartilhados
│   ├── config/
│   └── types/
│
└── package.json / tsconfig.json / vite.config.ts

---

## 🔎 Estado Atual

✅ Estrutura modular funcional no Pythagora.  
✅ Integração front-end/back-end local funcionando.  
✅ Autenticação JWT + Refresh Tokens implementada.  
✅ Dashboard administrativo e analytics com gráficos.  
✅ Gestão de categorias, produtos, estoque e pedidos implementada.  
✅ Carrinho de compras, checkout e rastreamento de pedidos funcionando.  
⏳ Integração completa com LLM Service em desenvolvimento.  
⏳ Deploy em nuvem ainda não configurado.

---

## 🧪 Próximas Etapas

✅ Finalizar testes automatizados (unitários e integração).  
✅ Implementar notificações em tempo real para pedidos.  
✅ Melhorar UI/UX com novos componentes shadcn/ui.  
✅ Implementar funcionalidades avançadas de analytics e relatórios.  
⏳ Configurar deploy em nuvem (Railway/Render/Heroku).  

---

## ⚡ Desafios e Soluções

Durante o desenvolvimento do **AppFood**, uma das etapas mais complexas foi migrar o sistema de **dados mockados** (hard-coded) para **dados vindos diretamente do backend via API**.  

Os principais desafios enfrentados foram:

- **Estrutura dos dados:** Os dados mockados eram simplificados, enquanto o backend retornava objetos com IDs, arrays aninhados e campos opcionais, exigindo ajustes nos tipos e no TypeScript.  
- **Tratamento de estados e carregamento:** Foi necessário implementar estados de carregamento (`loading`) e fallback para exibir placeholders ou mensagens quando a API ainda não retornava dados.  
- **Erro e autenticação:** Integração com o backend exigiu lidar com erros HTTP, tokens JWT e refresh tokens, algo inexistente nos mocks.  
- **Performance e renderização dinâmica:** Componentes como dashboards e gráficos precisaram ser refatorados para atualizar automaticamente quando os dados reais chegavam, evitando re-renderizações desnecessárias.  
- **Mapeamento de métricas e gráficos:** Alguns dados vindos do backend precisaram ser transformados (por exemplo, contagem de pedidos por status, receita diária) antes de alimentar os componentes de visualização.

**Soluções implementadas:**

1. Criação de hooks customizados e serviços (`analyticsService`, `inventoryService`) para centralizar o consumo da API e tratamento de erros.  
2. Uso de `useState` e `useEffect` no front-end para gerenciar carregamento, erros e atualização dinâmica dos dados.  
3. Adaptação dos componentes existentes para aceitar dados do backend, mantendo fallback para exibição segura enquanto os dados chegam.  
4. Implementação de tratamento de tokens JWT com interceptors do Axios, garantindo autenticação segura sem quebrar o fluxo da UI.

> 🎯 Resultado: hoje o **AppFood** consegue consumir dados reais do backend de forma confiável, com atualização dinâmica no dashboard, analytics e gerenciamento de pedidos, mantendo a interface responsiva e interativa.

-----

## 📢 Nota Final

O **AppFood** nasceu como experimento para explorar boas práticas full-stack usando **Pythagora**, React, Node.js e MongoDB.  
O projeto demonstra integração completa entre front-end moderno e back-end robusto, com foco em métricas, analytics e gerenciamento de restaurantes.  

🚀 A iniciativa permitiu validar padrões de arquitetura, autenticação segura, fluxos de dados e UI interativa, servindo como base para evoluções futuras e deploy real em produção.
