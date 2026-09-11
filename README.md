# React Admin Clientes — V2

Projeto administrativo full stack com arquitetura em camadas.

## Frontend
- React + Vite
- React Router
- Axios
- Lucide React
- Dashboard
- Sidebar administrativo
- Tabelas
- Busca/filtro
- Modais
- Preview de imagens
- Login JWT

## Backend
- Node.js
- Express
- SQLite + Sequelize
- JWT
- bcrypt
- Multer
- Swagger
- Middleware de autenticação/autorização
- Validação
- Logger em arquivo
- Tratamento centralizado de erros
- Services e Repositories

## Arquitetura

```text
Frontend
  ↓
API REST
  ↓
Routes
  ↓
Controllers
  ↓
Services
  ↓
Repositories
  ↓
Models / Sequelize
  ↓
SQLite
```

## Funcionalidades

### Página inicial
Menu com acesso ao Administrativo.

### Administrativo
Login obrigatório.

Dashboard:
- total de usuários
- total de clientes
- clientes ativos

Usuários:
- ID
- Login
- Password
- UserType
- pesquisa
- cadastro
- edição
- exclusão

Clientes:
- ID
- Nome
- Apelido
- Ícone BLOB
- Banner BLOB
- Status
- pesquisa
- cadastro
- edição
- exclusão
- preview de imagem

## Executar

Terminal 1:

```powershell
cd backend
npm install
npm run dev
```

Terminal 2:

```powershell
cd frontend
npm install
npm run dev
```

URLs:

```text
Frontend: http://localhost:5173
API:      http://localhost:3000
Swagger:  http://localhost:3000/api-docs
Health:   http://localhost:3000/health
```

Usuário inicial:

```text
login: admin
senha: admin123
usertype: ADMIN
```

## Próximos passos recomendados

Para produção, recomenda-se:
- refresh token
- recuperação de senha
- paginação no backend
- validação com Joi/Zod
- testes unitários e integração
- Docker
- variáveis de ambiente separadas
- migrations Sequelize
- armazenamento de imagens em objeto/S3 em vez de BLOB para grande volume
- auditoria das alterações
