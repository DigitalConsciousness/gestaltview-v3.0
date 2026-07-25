FROM node:22-alpine

WORKDIR /app

COPY package.json tsconfig.json vitest.config.ts ./
COPY setup ./setup
COPY scripts ./scripts
COPY config ./config
COPY api ./api
COPY components ./components
COPY pages ./pages
COPY docs ./docs
COPY supabase ./supabase
COPY tests ./tests
COPY README.md PLAYBOOK.md CONSULTING.md LICENSE.md CHANGELOG.md CODEX_PROMPT.md SPEC.md ./

RUN npm install

EXPOSE 4177

CMD ["npm", "run", "cli", "--", "status"]
