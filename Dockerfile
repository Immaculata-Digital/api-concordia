# Dockerfile para API Concordia (Node.js/TypeScript)
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar todas as dependências (incluindo devDependencies para o build)
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Stage de produção
FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --only=production

# Copiar arquivos buildados do stage anterior
COPY --from=builder /app/dist ./dist

# Variável de ambiente padrão para a porta
ENV PORT=3001
ENV NODE_ENV=production

# Expor a porta que a aplicação vai rodar (internamente)
EXPOSE 3001

# Iniciar a aplicação
CMD ["npm", "start"]
