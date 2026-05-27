# BBS Admin Panel

Painel administrativo da **Bits Bytes Store** em React.

## Estrutura de arquivos

```
src/
├── App.jsx                  → raiz: roteamento + estado global
├── utils/
│   └── constants.js         → theme, storage keys, helpers, seed
├── components/
│   ├── ui.jsx               → Btn, Card, Modal, Toast, Badge, Input…
│   └── Sidebar.jsx          → menu lateral
└── pages/
    ├── Login.jsx            → autenticação admin
    ├── Dashboard.jsx        → stats + resumos
    ├── Produtos.jsx         → CRUD produtos + upload de imagem
    ├── Pedidos.jsx          → CRUD pedidos + status inline
    ├── Clientes.jsx         → CRUD clientes + endereços
    └── Usuarios.jsx         → listagem/remoção de usuários da loja
```

## Rotas (via estado `page` no App.jsx)

| page          | Componente     | Descrição                          |
|---------------|----------------|------------------------------------|
| `"dashboard"` | Dashboard.jsx  | Visão geral, stats, atalhos        |
| `"produtos"`  | Produtos.jsx   | CRUD completo + upload de imagem   |
| `"pedidos"`   | Pedidos.jsx    | CRUD + troca de status inline      |
| `"clientes"`  | Clientes.jsx   | CRUD + gerenciamento de endereços  |
| `"usuarios"`  | Usuarios.jsx   | Usuários criados na loja           |

## Credenciais padrão

| Usuário | Senha          |
|---------|----------------|
| admin   | bbs@admin2025  |
| bbs     | admin123       |

> Altere em `src/utils/constants.js` → `ADMIN_CREDS`

## Como rodar

```bash
# 1. Instale as dependências (na pasta do projeto)
npm install

# 2. Inicie o servidor de desenvolvimento
npm run dev

# 3. Acesse no navegador
http://localhost:5173
```

## Como adicionar uma nova página

1. Crie `src/pages/NovaPagina.jsx`
2. Adicione ao `NAV_ITEMS` em `src/components/Sidebar.jsx`:
   ```js
   { id: "nova", icon: "◆", label: "Nova Página", section: "Seção" }
   ```
3. Importe e adicione ao `switch` no `App.jsx`:
   ```jsx
   import NovaPagina from "./pages/NovaPagina";
   // ...
   case "nova":
     return <NovaPagina {...sharedProps} />;
   ```

## Storage

Todos os dados são salvos no `localStorage` do navegador com as chaves:

| Chave                | Conteúdo          |
|----------------------|-------------------|
| `bbs_admin_produtos` | Array de produtos |
| `bbs_pedidos`        | Array de pedidos  |
| `bbs_usuarios`       | Objeto de usuários|
