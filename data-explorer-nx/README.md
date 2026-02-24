# Nx Angular Repository

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ A repository showcasing key [Nx](https://nx.dev) features for Angular monorepos ✨
## Finish your Nx platform setup

🚀 [Finish setting up your workspace](https://cloud.nx.app/connect/kGziGtUkOs) to get faster builds with remote caching, distributed task execution, and self-healing CI. [Learn more about Nx Cloud](https://nx.dev/ci/intro/why-nx-cloud).
## 📦 Project Overview

This repository demonstrates a production-ready Angular monorepo with:

- **2 Applications**

  - `shop` - Angular e-commerce application with product listings and detail views
  - `api` - Backend API with Docker support serving product data

- **6 Libraries**

  - `@org/feature-products` - Product listing feature (Angular)
  - `@org/feature-product-detail` - Product detail feature (Angular)
  - `@org/data` - Data access layer for shop features
  - `@org/shared-ui` - Shared UI components
  - `@org/models` - Shared data models
  - `@org/products` - API product service library

- **E2E Testing**
  - `shop-e2e` - Playwright tests for the shop application

## 🚀 Quick Start

```bash
# Clone the repository
git clone <your-fork-url>
cd <your-repository-name>

# Install dependencies
# (Note: You may need --legacy-peer-deps)
npm install

# Serve the Angular shop application (this will simultaneously serve the API backend)
npx nx serve shop

# ...or you can serve the API separately
npx nx serve api

# Build all projects
npx nx run-many -t build

# Run tests
npx nx run-many -t test

# Lint all projects
npx nx run-many -t lint

# Run e2e tests
npx nx e2e shop-e2e

# Run tasks in parallel

npx nx run-many -t lint test build e2e --parallel=3

# Visualize the project graph
npx nx graph
```

## ⭐ Featured Nx Capabilities

This repository showcases several powerful Nx features:

### 1. 🔒 Module Boundaries

Enforces architectural constraints using tags. Each project has specific dependencies it can use:

- `scope:shared` - Can be used by all projects
- `scope:shop` - Shop-specific libraries
- `scope:api` - API-specific libraries
- `type:feature` - Feature libraries
- `type:data` - Data access libraries
- `type:ui` - UI component libraries

**Try it out:**

```bash
# See the current project graph and boundaries
npx nx graph

# View a specific project's details
npx nx show project shop --web
```

[Learn more about module boundaries →](https://nx.dev/features/enforce-module-boundaries)

### 2. 🐳 Docker Integration

The API project includes Docker support with automated targets and release management:

```bash
# Build Docker image
npx nx docker:build api

# Run Docker container
npx nx docker:run api

# Release with automatic Docker image versioning
npx nx release
```

**Nx Release for Docker:** The repository is configured to use Nx Release for managing Docker image versioning and publishing. When running `nx release`, Docker images for the API project are automatically versioned and published based on the release configuration in `nx.json`. This integrates seamlessly with semantic versioning and changelog generation.

[Learn more about Docker integration →](https://nx.dev/recipes/nx-release/release-docker-images)

### 3. 🎭 Playwright E2E Testing

End-to-end testing with Playwright is pre-configured:

```bash
# Run e2e tests
npx nx e2e shop-e2e

# Run e2e tests in CI mode
npx nx e2e-ci shop-e2e
```

[Learn more about E2E testing →](https://nx.dev/technologies/test-tools/playwright/introduction#e2e-testing)

### 4. ⚡ Vitest for Unit Testing

Fast unit testing with Vite for Angular libraries:

```bash
# Test a specific library
npx nx test data

# Test all projects
npx nx run-many -t test
```

[Learn more about Vite testing →](https://nx.dev/recipes/vite)

### 5. 🔧 Self-Healing CI

The CI pipeline includes `nx fix-ci` which automatically identifies and suggests fixes for common issues:

```bash
# In CI, this command provides automated fixes
npx nx fix-ci
```

This feature helps maintain a healthy CI pipeline by automatically detecting and suggesting solutions for:

- Missing dependencies
- Incorrect task configurations
- Cache invalidation issues
- Common build failures

[Learn more about self-healing CI →](https://nx.dev/ci/features/self-healing-ci)

## 📁 Project Structure

```
├── apps/
│   ├── shop/           [scope:shop]    - Angular e-commerce app
│   ├── shop-e2e/                       - E2E tests for shop
│   └── api/            [scope:api]     - Backend API with Docker
├── libs/
│   ├── shop/
│   │   ├── feature-products/        [scope:shop,type:feature] - Product listing
│   │   ├── feature-product-detail/  [scope:shop,type:feature] - Product details
│   │   ├── data/                    [scope:shop,type:data]    - Data access
│   │   └── shared-ui/               [scope:shop,type:ui]      - UI components
│   ├── api/
│   │   └── products/    [scope:api]    - Product service
│   └── shared/
│       └── models/      [scope:shared,type:data] - Shared models
├── nx.json             - Nx configuration
├── tsconfig.json       - TypeScript configuration
└── eslint.config.mjs   - ESLint with module boundary rules
```

## 🏷️ Understanding Tags

This repository uses tags to enforce module boundaries:

| Project            | Tags                         | Can Import From              |
| ------------------ | ---------------------------- | ---------------------------- |
| `shop`             | `scope:shop`                 | `scope:shop`, `scope:shared` |
| `api`              | `scope:api`                  | `scope:api`, `scope:shared`  |
| `feature-products` | `scope:shop`, `type:feature` | `scope:shop`, `scope:shared` |
| `data`             | `scope:shop`, `type:data`    | `scope:shared`               |
| `models`           | `scope:shared`, `type:data`  | Nothing (base library)       |

## 📚 Useful Commands

```bash
# Project exploration
npx nx graph                                    # Interactive dependency graph
npx nx list                                     # List installed plugins
npx nx show project shop --web                 # View project details

# Development
npx nx serve shop                              # Serve Angular app
npx nx serve api                               # Serve backend API
npx nx build shop                              # Build Angular app
npx nx test data                               # Test a specific library
npx nx lint feature-products                   # Lint a specific library

# Running multiple tasks
npx nx run-many -t build                       # Build all projects
npx nx run-many -t test --parallel=3          # Test in parallel
npx nx run-many -t lint test build            # Run multiple targets

# Affected commands (great for CI)
npx nx affected -t build                       # Build only affected projects
npx nx affected -t test                        # Test only affected projects

# Docker operations
npx nx docker:build api                        # Build Docker image
npx nx docker:run api                          # Run Docker container
```

## 🎯 Adding New Features

### Generate a new Angular application:

```bash
npx nx g @nx/angular:app my-app
```

### Generate a new Angular library:

```bash
npx nx g @nx/angular:lib my-lib
```

### Generate a new Angular component:

```bash
npx nx g @nx/angular:component my-component --project=my-lib
```

### Generate a new API library:

```bash
npx nx g @nx/node:lib my-api-lib
```

You can use `npx nx list` to see all available plugins and `npx nx list <plugin-name>` to see all generators for a specific plugin.

## Nx Cloud

Nx Cloud ensures a [fast and scalable CI](https://nx.dev/ci/intro/why-nx-cloud?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) pipeline. It includes features such as:

- [Remote caching](https://nx.dev/ci/features/remote-cache?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task distribution across multiple machines](https://nx.dev/ci/features/distribute-task-execution?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Automated e2e test splitting](https://nx.dev/ci/features/split-e2e-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task flakiness detection and rerunning](https://nx.dev/ci/features/flaky-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## 🔗 Learn More

- [Nx Documentation](https://nx.dev)
- [Angular Monorepo Tutorial](https://nx.dev/getting-started/tutorials/angular-monorepo-tutorial)
- [Module Boundaries](https://nx.dev/features/enforce-module-boundaries)
- [Docker Integration](https://nx.dev/recipes/nx-release/release-docker-images)
- [Playwright Testing](https://nx.dev/technologies/test-tools/playwright/introduction#e2e-testing)
- [Vite with Angular](https://nx.dev/recipes/vite)
- [Nx Cloud](https://nx.dev/ci/intro/why-nx-cloud)
- [Releasing Packages](https://nx.dev/features/manage-releases)

## 💬 Community

Join the Nx community:

- [Discord](https://go.nx.dev/community)
- [X (Twitter)](https://twitter.com/nxdevtools)
- [LinkedIn](https://www.linkedin.com/company/nrwl)
- [YouTube](https://www.youtube.com/@nxdevtools)
- [Blog](https://nx.dev/blog)
