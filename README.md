# 📋 Process Management Frontend

Sistema de gestão e mapeamento de processos organizacionais desenvolvido com React, TypeScript e Vite.

## 🚀 Funcionalidades

### 📊 Gestão de Processos
- **Processos Raiz** - Criação e gerenciamento de processos principais
- **Subprocessos** - Hierarquia de processos com árvore navegável
- **Associações** - Vinculação de ferramentas, responsáveis e documentos (apenas processos raiz)
- **Categorização** - Organização por áreas, tipos, status e prioridades

### 🏢 Áreas e Organização
- Visualização em árvore de processos por área
- Cores personalizadas para identificação visual
- Estatísticas e contadores por área

### 🔧 Ferramentas, Responsáveis e Documentos
- Cadastro de ferramentas utilizadas nos processos
- Gerenciamento de responsáveis com funções e departamentos
- Documentação vinculada aos processos

### 📈 Analytics e Relatórios
- Dashboard com métricas e KPIs
- Insights sobre processos
- Visualização de distribuição por tipo, status e prioridade

### 📜 Changelog
- Auditoria completa de alterações
- Histórico de criação, edição e exclusão
- Possibilidade de restaurar versões anteriores

## 🛠️ Tecnologias

- **React 18** - Biblioteca JavaScript para interfaces
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **React Router** - Navegação SPA
- **Axios** - Cliente HTTP
- **Lucide React** - Ícones
- **Tailwind CSS** - Estilização (implícito)

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/JoaoVitorMouro/ProcessFrontEnd.git

# Entre na pasta do projeto
cd ProcessFrontEnd

# Instale as dependências
npm install
```

## 🔧 Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=http://localhost:8000/api
```

## 🏃 Executando o Projeto

### Desenvolvimento
```bash
npm run dev
```
Acesse: [http://localhost:5173](http://localhost:5173)

### Build para Produção
```bash
npm run build
```

### Preview da Build
```bash
npm run preview
```

## 📁 Estrutura do Projeto

```
src/
├── components/       # Componentes reutilizáveis
│   ├── layout/      # Layout (Header, Sidebar, etc)
│   └── ui/          # Componentes UI (Button, Modal, etc)
├── pages/           # Páginas da aplicação
├── services/        # Serviços de API
├── types/           # Tipos TypeScript
├── hooks/           # Hooks customizados
└── main.tsx         # Entry point
```

## 🎨 Principais Páginas

- `/` - Dashboard
- `/areas` - Gestão de Áreas
- `/areas/:id/tree` - Árvore de Processos por Área
- `/processes` - Lista de Processos
- `/processes/:id` - Detalhes do Processo
- `/tools` - Ferramentas
- `/responsibles` - Responsáveis
- `/documents` - Documentos
- `/analytics` - Analytics
- `/changelog` - Histórico de Alterações

## 🔑 Recursos Especiais

### Processos Raiz vs Subprocessos
- **Processos Raiz**: Podem ter ferramentas, responsáveis e documentos associados
- **Subprocessos**: Herdam contexto do processo pai, sem associações diretas

### Associações com Observações
Ao vincular ferramentas, responsáveis ou documentos, é possível adicionar observações específicas para cada item.

## 📄 Licença

Este projeto está sob licença MIT.

## 👥 Autor

**João Vitor Mouro**  
GitHub: [@JoaoVitorMouro](https://github.com/JoaoVitorMouro)
