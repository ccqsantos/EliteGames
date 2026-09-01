# 🎮 EliteGames - E-commerce de Gaming & Periféricos

![EliteGames Banner](https://via.placeholder.com/1200x400/0a0a0a/7c3aed?text=EliteGames)

## 📋 Sobre o Projeto

**EliteGames** é uma plataforma de e-commerce focada em produtos de alto valor (big ticket) para gamers, como consoles, monitores, periféricos premium e acessórios gamers. O projeto foi desenvolvido com React e possui um design moderno com tema escuro e destaques em roxo.

### 🎯 Objetivo
Criar uma experiência de compra premium para gamers que buscam equipamentos de alta performance, com uma interface elegante, intuitiva e focada em conversão.

## ✨ Funcionalidades

### 🚀 Implementadas
- ✅ Página inicial com hero section, categorias e produtos em destaque
- ✅ Sistema de autenticação (Login e Cadastro)
- ✅ Header responsivo com menu mobile
- ✅ Footer completo com newsletter e links institucionais
- ✅ Design system com tema escuro e roxo
- ✅ Formulários com validação em tempo real
- ✅ Suporte a roles (Gamer e Elite)
- ✅ Responsividade para todos os dispositivos

### 🔄 Em Desenvolvimento
- ⏳ Sistema de carrinho de compras
- ⏳ Checkout e integração com pagamentos
- ⏳ Dashboard do usuário
- ⏳ Catálogo de produtos com filtros
- ⏳ Sistema de avaliações e reviews
- ⏳ Área administrativa

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca principal
- **React Router DOM** - Roteamento e navegação
- **React Icons** - Ícones customizados
- **CSS3** - Estilização com temas escuros
- **Context API** - Gerenciamento de estado (Autenticação)

### Design System
- **Tema**: Dark Mode com tons de preto (#0a0a0a) e cinza
- **Cores Primárias**: Roxo (#7c3aed, #a855f7)
- **Tipografia**: Sistema com pesos 500-800
- **Componentes**: Cards, botões, inputs estilizados

## 📁 Estrutura do Projeto

elitegames/
├── public/
│ └── index.html
├── src/
│ ├── assets/
│ │ └── elitegames_logo2_outline.png
│ ├── components/
│ │ ├── Header.jsx
│ │ ├── Footer.jsx
│ │ ├── Home.jsx
│ │ ├── Login.jsx
│ │ └── Join.jsx
│ ├── css/
│ │ ├── Home.css
│ │ ├── Header.css
│ │ ├── Footer.css
│ │ └── Auth.css
│ ├── context/
│ │ └── AuthContext.js
│ ├── App.js
│ ├── App.css
│ └── index.js
├── package.json
└── README.md

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js (versão 14 ou superior)
- NPM ou Yarn

### Instalação

1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/elitegames.git
cd elitegames

2. Instale as dependênciasênciasências

```bash
npm install
# ou
yarn install

3. Inicie o servidor de desenvolvimento   Inicie o servidor de desenvolvimento

```bbashbash
npm start
# ou
yarn start

4. Acesse no navegador

http://localhost:3000

🔐 Autenticação
O sistema de autenticação possui dois tipos de usuário:

🎯 Gamer
Acesso para comprar produtos

Visualização do catálogo

Histórico de compras

⭐ Elite
Acesso premium

Ofertas exclusivas

Prioridade em lançamentos

Benefícios especiais
