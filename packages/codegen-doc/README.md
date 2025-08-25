# Aiexec Codegen Document

This custom [graphql-code-generator](https://graphql-code-generator.com/) plugin takes the Aiexec GraphQL [schema](../sdk/src/schema.graphql) and generates GraphQL [fragments and operations](../sdk/src/_generated_documents.graphql). 

Usage in [codegen.doc.yml](../sdk/codegen.doc.yml).

## Output

The [@aiexec/sdk](../sdk/README.md) uses this code generator [plugin](./src/plugin.ts) to generate:

A fragment for each model in the Aiexec API containing:
- all scalar fields on the model
- required fields for any nested object with a matching query
- fragment spreads for any nested object with no matching query

An operation for each query and mutation in the Aiexec API containing:
- all available variables
- fragment spread for the matching model

An operation for each nested query within a model containing:
- all available variables for both the root and child query
- fragment spread for the matching child model
- a query name joining the root and child query fields (eg `query user_assignedIssues`)

## Flow

1. The GraphQL schema is parsed using a reusable [ContextVisitor](./src/context-visitor.ts) to provide consistent information across the Aiexec code generator plugins
2. The context is visited using the [FragmentVisitor](./src/fragment-visitor.ts) to return a list of printed GraphQL fragments
3. The fragments and context are visited using the [OperationVisitor](./src/operation-visitor.ts) to return a list of printed GraphQL operations
4. The printed fragments and operations are returned to be printed 

<!-- AUTO-GENERATED-CONTENT:START (TEXT_SECTION:id=license&src=../../README.md) -->
<!-- TEXT_SECTION:header:START -->
<h1 align="center">🚀 Aiexec API</h1>

<h3 align="center">
  The purpose-built tool for planning and building products
</h3>

<p align="center">
  Streamline issues, projects, and product roadmaps<br/>
  with the system for modern software development.
</p>

<p align="center">
  <a href="https://github.com/khulnasoft-lab/aiexec/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" />
  </a>
  <a href="https://github.com/khulnasoft-lab/aiexec/actions/workflows/build.yaml">
    <img src="https://github.com/khulnasoft-lab/aiexec/actions/workflows/build.yaml/badge.svg" alt="Build Status" />
  </a>
  <a href="https://github.com/khulnasoft-lab/aiexec/actions/workflows/release.yaml">
    <img src="https://github.com/khulnasoft-lab/aiexec/actions/workflows/release.yaml/badge.svg" alt="Release Status" />
  </a>
  <a href="https://github.com/khulnasoft-lab/aiexec/actions/workflows/schema.yaml">
    <img src="https://github.com/khulnasoft-lab/aiexec/actions/workflows/schema.yaml/badge.svg" alt="Schema Status" />
  </a>
  <a href="https://github.com/khulnasoft-lab/aiexec/actions/workflows/dependencies.yaml">
    <img src="https://github.com/khulnasoft-lab/aiexec/actions/workflows/dependencies.yaml/badge.svg" alt="Dependencies Status" />
  </a>
</p>
<!-- TEXT_SECTION:header:END -->

---

## 📖 Overview

This is the **Aiexec Monorepo**.  
If you’re looking for documentation on the Aiexec **SDK** or **API**, please visit 👉 [**developers.aiexec.khulnasoft.com**](https://developers.aiexec.khulnasoft.com/docs).

---

## 🧩 Monorepo Structure

The Aiexec Client uses custom [GraphQL Code Generator](https://graphql-code-generator.com/) plugins to produce a fully typed SDK for all operations and models exposed by the Aiexec production API.

- Uses **`yarn workspaces`** + **`lerna`** for package management and publishing
- Generated code uses the prefix **`_generated`** (do not edit manually)

### 📦 Open Source Packages
- [**sdk**](./packages/sdk/README.md) → The Aiexec Client SDK for interacting with the GraphQL API  
- [**import**](./packages/import/README.md) → Import tooling for uploading from external systems  
- [**codegen-doc**](./packages/codegen-doc/README.md) → GraphQL codegen plugin for generating fragments & documents  
- [**codegen-sdk**](./packages/codegen-sdk/README.md) → GraphQL codegen plugin for generating a TypeScript SDK  
- [**codegen-test**](./packages/codegen-test/README.md) → GraphQL codegen plugin for generating Jest tests  

---

## 🚀 Get Started

```bash
# Install dependencies
yarn

# Build all packages
yarn build

# Run all tests
yarn test

# Update schema from production API
yarn schema

# Create a changeset for generating CHANGELOG.md
yarn changeset
<!-- AUTO-GENERATED-CONTENT:END -->
