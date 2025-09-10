# Webhook Catcher Backend - Restructured

Este é o backend do Webhook Catcher reestruturado seguindo os padrões arquiteturais do projeto statement-consolidation.

## Estrutura do Projeto

```
src/
├── main/
│   ├── controllers/          # Controllers HTTP
│   │   ├── ApiController.ts
│   │   └── WebhookController.ts
│   ├── models/              # Entidades TypeORM
│   │   ├── WebhookEndpoint.ts
│   │   └── WebhookRequest.ts
│   ├── repositories/        # Repositórios de dados
│   │   ├── webhookEndpoint/
│   │   └── webhookRequest/
│   └── useCases/           # Regras de negócio
│       ├── endpoint/
│       └── webhook/
└── shared/
    ├── config/             # Configurações
    ├── container/          # Injeção de dependência
    ├── database/           # Configuração do banco
    ├── errors/             # Classes de erro
    ├── http/              # Configuração HTTP
    └── util/              # Utilitários
```

## Principais Melhorias

### 1. **Arquitetura Limpa**
- Separação clara entre camadas (Controllers, Use Cases, Repositories)
- Inversão de dependência com Inversify
- Princípios SOLID aplicados

### 2. **Tratamento de Erros**
- Classes de erro padronizadas (AppError, UseCaseError, RepositoryError)
- Middleware centralizado de tratamento de erros
- Logs estruturados com Pino

### 3. **Injeção de Dependência**
- Container Inversify configurado
- Tipos bem definidos
- Fácil testabilidade

### 4. **TypeScript**
- Tipagem forte em todo o projeto
- Interfaces bem definidas
- Configuração otimizada

## Instalação

```bash
# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Compilar TypeScript
npm run build

# Executar em desenvolvimento
npm run dev

# Executar em produção
npm start
```

## Configuração do Banco de Dados

O projeto usa PostgreSQL com TypeORM. As tabelas são criadas automaticamente em modo de desenvolvimento.

### Variáveis de Ambiente

```env
NODE_ENV=dev
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=webhook_catcher
DB_USER=webhook_user
DB_PASSWORD=webhook_pass
```

## Endpoints da API

### Gerenciamento de Endpoints
- `GET /api/endpoints` - Listar todos os endpoints
- `POST /api/endpoints` - Criar novo endpoint
- `GET /api/endpoints/:id/requests` - Listar requisições de um endpoint
- `GET /api/requests` - Listar todas as requisições
- `GET /api/requests/:id` - Obter requisição específica

### Webhook Handler
- `ALL /webhook/*` - Handler universal para webhooks

## Funcionalidades

### 1. **Criação de Endpoints**
- Configuração de autenticação
- Requisitos de TLS/HTTPS
- Tokens de autenticação personalizados

### 2. **Processamento de Webhooks**
- Validação de autenticação
- Verificação de TLS
- Armazenamento de requisições
- Logs detalhados

### 3. **Consulta de Dados**
- Listagem de endpoints
- Histórico de requisições
- Filtros e paginação

## Padrões Seguidos

### Use Cases
- Interface e implementação separadas
- Validação de entrada
- Tratamento de erros padronizado
- Logs estruturados

### Repositories
- Abstração da camada de dados
- Interfaces bem definidas
- Tratamento de erros específicos

### Controllers
- Apenas coordenação de fluxo
- Delegação para Use Cases
- Tratamento de HTTP

## Exemplo de Uso

### Criar um Endpoint
```bash
curl -X POST http://localhost:3001/api/endpoints \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Webhook",
    "endpoint_path": "/webhook/my-endpoint",
    "description": "Endpoint para receber webhooks",
    "require_tls": true,
    "require_auth": true,
    "auth_token": "my-secret-token"
  }'
```

### Enviar Webhook
```bash
curl -X POST http://localhost:3001/webhook/my-endpoint \
  -H "Content-Type: application/json" \
  -H "x-auth-token: my-secret-token" \
  -d '{"message": "Hello World"}'
```

## Desenvolvimento

O projeto segue os padrões estabelecidos no projeto statement-consolidation:

- **Inversify** para injeção de dependência
- **TypeORM** para ORM
- **Pino** para logs estruturados
- **Express** com decorators do inversify-express-utils
- **Graceful shutdown** implementado

## Próximos Passos

1. Implementar testes unitários
2. Adicionar validação de schema com Joi/Yup
3. Implementar cache com Redis
4. Adicionar métricas e monitoramento
5. Implementar rate limiting
