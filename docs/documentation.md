- ### WebSocket vs. polling

  Price and auction state updates use WebSocket streams where available. Client‑side polling for these views is disabled via React Query configuration (e.g., `refetchOnWindowFocus=false`, `refetchInterval=0`) and guarded enable flags. Transaction confirmations still use standard RPC calls.

---

## Performance methodology

- Device: recent laptop class, Chrome stable with default settings
- Network: throttled Fast 3G in DevTools for worst‑case checks
- Build metrics: `next build` output for bundle size and build time
- TTI: first interactive UI ready state measured in local tests
- WebSocket latency: round‑trip time/2 using ping frames to the configured `NEXT_PUBLIC_WS_URL`

Numbers in this document are indicative under the above constraints.

---

## CI details

- **Contract coverage**: 92.39% lines for core contract
- Workflow: `.github/workflows/ci.yml` (contracts job uploads `contracts/lcov.info` to Codecov).
- Local coverage check: `forge coverage --report lcov`

---
# DutchBasar Technical Documentation

Version: 1.0.0  
Author: Christopher Schulze  

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Contracts](#contracts)
- [On‑Chain API (Frontend ABI alignment)](#onchain-api-frontend-abi-alignment)
- [Frontend](#frontend)
- [Wallets & Chains](#wallets--chains)
- [Subgraph (Optional)](#subgraph-optional)
- [Deployment](#deployment)
- [Security](#security)
- [BSC Compatibility](#bsc-compatibility)
- [Development & Testing](#development--testing)
- [Setup (First Run)](#setup-first-run)
- [Repository File Map (Full)](#repository-file-map-full)
- [Detailed Wiremap](#detailed-wiremap)
- [Guides](#guides)
- [Quality Assurance & Testing](#quality-assurance--testing)
- [Performance & UX](#performance--ux)
- [Operations Runbook](#operations-runbook)
- [CI/CD](#cicd)
- [Troubleshooting (Extended)](#troubleshooting-extended)
- [Changelog (excerpt)](#changelog-excerpt)
- [Glossary](#glossary)
- [Credits & License](#credits--license)

## Overview

DutchBasar is an NFT marketplace built around the Dutch auction mechanism. It combines gas‑efficient smart contracts with a modern Next.js frontend and multi‑chain support (with a focus on L2s) to deliver a fast and cost‑effective user experience.

### Current Stats (verified)
- **Gas usage**: 159,992 (allowlist/bitmap) / 123,192 (public single) / 340,866 (batch-10 total, 34,086 per NFT)
- **Test coverage**: 92.39% lines for core DutchBasar.sol; Total 73.48% lines (forge coverage)
- **Test suite**: 84/84 tests passing (100% success rate)
- **Bundle size**: 173 KB First Load JS (per latest build output)
- **Chains**: Ethereum, Base, Polygon, Arbitrum, Optimism, Scroll, zkSync Era, BSC
- **Stack**: Next.js 15.5.3, Solidity 0.8.28, ERC-721A, Foundry, Wagmi v2

## Benchmarks (verified)

| Operation | Gas (measured) |
|-----------|-----------------|
| Allowlist mint (bitmap) | 159,992 |
| Public mint (single) | 123,192 |
| Batch mint (10) total | 340,866 |
| Batch mint (per NFT) | 34,086 |
| reveal (average) | 64,034 |
| configureAuction (average) | 71,670 |

### Features Implemented
- Real-time price streaming (no RPC polling)
- Live activity feed with mint events
- Advanced analytics (GA4 + custom)
- Performance monitoring dashboard
- Security headers (CSP, XSS protection)
- CI/CD pipeline (GitHub Actions)

### Advanced features

Optional extension modules provide additional functionality. Located in `contracts/src/extensions/`, these are not included in the base deployment.

**Core Features:**
- **EIP-712 signature minting**: Gasless transactions via typed data signatures
- **Bitmap allowlist**: Efficient storage (256 addresses per slot)
- **Flash loan protection**: Same-block mint prevention
- **Circuit breaker**: Emergency pause with time-locked recovery
- **Gas refund pool**: Refunds to incentivize early activity

**Extension Modules:**
- **Multi-signature wallet**: 2-of-3 requirement for critical operations
- **AI-powered pricing**: Chainlink oracle integration for dynamic pricing
- **DAO governance**: On-chain voting with delegation and time locks
- **NFT staking**: Configurable rewards with boost mechanics
- **Cross-chain bridge**: LayerZero integration for NFT transfers

---

## Environment variables

Set deployed addresses in `app/.env.local` so the frontend connects to live contracts (no code edits needed).

Required:

```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
```

Contracts per chain (env names):

- Ethereum — `NEXT_PUBLIC_ETHEREUM_CONTRACT`
- Base — `NEXT_PUBLIC_BASE_CONTRACT`
- Polygon — `NEXT_PUBLIC_POLYGON_CONTRACT`
- Arbitrum — `NEXT_PUBLIC_ARBITRUM_CONTRACT`
- Optimism — `NEXT_PUBLIC_OPTIMISM_CONTRACT`
- Scroll — `NEXT_PUBLIC_SCROLL_CONTRACT`
- BSC — `NEXT_PUBLIC_BSC_CONTRACT`
- zkSync Era — `NEXT_PUBLIC_ZKSYNC_CONTRACT`

Testnets (only if used):

- Sepolia — `NEXT_PUBLIC_SEPOLIA_CONTRACT`
- Base Sepolia — `NEXT_PUBLIC_BASE_SEPOLIA_CONTRACT`
- Polygon Amoy — `NEXT_PUBLIC_POLYGON_AMOY_CONTRACT`
- Arbitrum Sepolia — `NEXT_PUBLIC_ARBITRUM_SEPOLIA_CONTRACT`
- Optimism Sepolia — `NEXT_PUBLIC_OPTIMISM_SEPOLIA_CONTRACT`
- Scroll Sepolia — `NEXT_PUBLIC_SCROLL_SEPOLIA_CONTRACT`
- BSC Testnet — `NEXT_PUBLIC_BSC_TESTNET_CONTRACT`
- zkSync Sepolia — `NEXT_PUBLIC_ZKSYNC_SEPOLIA_CONTRACT`

Guidelines:

- Leave variables empty for chains you do not use. The app treats missing/zero addresses as disabled for that chain.
- After deploying, paste the checksummed contract address (e.g., `0xAbC…1234`).
- Env variable names must match exactly what `app/src/lib/wagmi.ts` reads.

Optional endpoints:

```
NEXT_PUBLIC_ANALYTICS_ENDPOINT=
NEXT_PUBLIC_WS_URL=
```

---

## Architecture

- Contracts (Foundry): `contracts/`
  - Core auction contract `DutchBasar.sol`
  - Factory `DutchBasarFactory.sol` for standardized deployments
  - Utilities: Merkle allowlist verification
- Frontend (Next.js App Router): `app/`
  - App shell and providers (Wagmi, RainbowKit, React Query)
  - Feature components: `AuctionCard`, `MintSection`, `PriceChart`, `GasOptimizationDisplay`
  - Chain config and ABIs in `src/lib/`
- Subgraph (optional): `subgraph/`
  - Graph schema, `subgraph.yaml`, mapping sources
- Documentation: `docs/documentation.md` (this file)

Data flow (high-level):
- User interacts with Next.js UI → wallet connected via RainbowKit/Wagmi → writes/reads on the chain against `DutchBasar` → (optional) Subgraph indexes events for analytics → UI shows live auction price and metrics.

---

## Contracts

Primary contract:
- `contracts/src/DutchBasar.sol` - Main implementation with all advanced features
- `contracts/src/extensions/DutchBasarMultiSig.sol` - Multi-signature wallet
- `contracts/src/extensions/DutchBasarAI.sol` - AI-powered pricing
- `contracts/src/extensions/DutchBasarDAO.sol` - Governance token & voting
- `contracts/src/extensions/DutchBasarStaking.sol` - NFT staking with rewards
- `contracts/src/extensions/DutchBasarBridge.sol` - Cross-chain bridge

Features:
- Linear Dutch auction with packed storage and assembly for critical paths.
- Allowlist mint using Merkle proofs.
- Public mint with per-tx limits.
- Reveal (baseURI + provenance hash) and EIP‑2981 royalties.
- Emergency controls: Pausable, guarded withdrawals, owner batch mint.

Gas-oriented considerations:
- Unchecked arithmetic where safe
- Packed structs (`AuctionConfig`, `MintConfig`)
- Minimal external calls and efficient event emissions
- ERC‑721A for batch efficiency
- **NEW**: Bitmap storage for allowlist (256 addresses per slot)
- **NEW**: Assembly optimizations in critical paths
- **NEW**: Transient storage patterns (future‑ready; disabled by default)
- **NEW**: SSTORE2 patterns for metadata
- **NEW**: Custom errors instead of strings

Factory: `contracts/src/DutchBasarFactory.sol`
- Authorizes deployers, records deployments, supports batch deployment.
- Fee accounting and controlled withdrawals.

Tests:
- `contracts/test/DutchBasar.t.sol` - Main contract tests
- `contracts/test/DutchBasarExtensions.t.sol` - Extension contracts tests
- `contracts/test/Benchmarks.t.sol` - Gas optimization benchmarks
- Deployment, auction dynamics, minting (allowlist/public), reveal, access control, reentrancy protection, royalties, invariants, fuzzing, and gas reporting.

---

## On‑Chain API (Frontend ABI alignment)

The frontend uses `DUTCH_BASAR_ABI` (see `app/src/lib/contracts.ts`) mirroring the on-chain API. Key calls:
- Views: `getCurrentPrice()`, `getCurrentPhase()`, `getAuctionInfo()`, `getMintInfo()`, `totalSupply()`, `getRemainingSupply()`, `revealed()`.
- Allowlist helpers: `isAllowlisted(account,maxAllowed,proof)`, `allowlistMinted(account)`.
- Mints: `allowlistMint(quantity,maxAllowed,proof)`, `publicMint(quantity)` (payable), `signatureMint(quantity,maxPrice,deadline,signature)` (EIP‑712).
- Admin: `configureAuction`, `configureMint`, `configureAllowlist`, `reveal`, `updateBaseURI`, `updateRoyalty`, `setPhase`, `pause/unpause`, `withdraw/withdrawTo`.

Phase mapping: `NotStarted=0`, `Allowlist=1`, `Public=2`, `Ended=3` (exposed as `PHASE_NAMES` in the frontend).

### EIP‑712 Signature Mint (API)

```
function signatureMint(
  uint256 quantity,
  uint256 maxPrice,
  uint256 deadline,
  bytes calldata signature
) external payable;

event SignatureMint(address indexed minter, uint256 nonce, uint256 quantity);

// EIP‑712 Domain: { name: "DutchBasar", version: "1", chainId, verifyingContract }
// Typehash: Mint(address to,uint256 quantity,uint256 maxPrice,uint256 nonce,uint256 deadline)
// Anti‑replay: per‑address nonce mapping
```

## Frontend

### Extensions (Optional Modules)

These production-style modules are included under `contracts/src/extensions/` and covered by tests in `contracts/test/DutchBasarExtensions.t.sol`:

- `DutchBasarMultiSig.sol`: Lightweight multi-signature guardian for owner operations (proposal/sign/execute with expiry)
- `DutchBasarAI.sol`: Heuristic pricing utilities (market data ingestion, optimal price calculation, user scoring)
- `DutchBasarDAO.sol`: Minimal governance token + proposals/voting flow for protocol changes
- `DutchBasarStaking.sol`: NFT staking with reward accrual and boost mechanics
- `DutchBasarBridge.sol`: LZ-style bridging helper (trusted remote lookup, escrow/bridge flows)

Use only what you need; keep core minimal for production deployments.

Stack:
- Next.js 15 (App Router), TypeScript, Tailwind v3, shadcn/ui, Framer Motion
- Wagmi v2 + RainbowKit for wallets (MetaMask & WalletConnect ready)
- React Query for caching and background refresh

Providers: `app/src/app/providers.tsx`
- Theme provider wraps the app for styled shadcn/ui components.
- `WagmiProvider` uses `config` from `app/src/lib/wagmi.ts`.
- `RainbowKitProvider` configured with theme and `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`.
- `QueryClientProvider` with stable sane defaults.

Tailwind v3 setup: `app/src/app/globals.css`
- `@tailwind base; @tailwind components; @tailwind utilities;`
- PostCSS configured via `postcss.config.mjs`

UI Components:
- `AuctionCard.tsx` – auction status, price, progress, stats.
- `MintSection.tsx` – quantity selection, mint button, transaction state, wallet info.
- `PriceChart.tsx` – canvas-based animated price chart with smooth transitions.
- `GasOptimizationDisplay.tsx` – chain-aware gas estimates with BSC (56/97) included.
- `components/ui/Button.tsx` – unified button component with variant/size mapping.

Animations: Framer Motion sprinkled across hero, cards, tabs, and charts.

---

## Wallets & Chains

Wallets:
- MetaMask and other WalletConnect-compatible wallets via RainbowKit.

Chains (see `app/src/lib/wagmi.ts`):
- Mainnets: Ethereum (1), Base (8453), Polygon (137), Arbitrum (42161), Optimism (10), Scroll (534352), BSC (56), zkSync Era (324).
- Testnets: Sepolia (11155111), Base Sepolia, Polygon Amoy (80002), Arbitrum Sepolia, Optimism Sepolia, Scroll Sepolia, BSC Testnet (97), zkSync Sepolia (300).

Contract addresses are configured via environment variables in the frontend (`.env.local`) and resolved at runtime in `app/src/lib/wagmi.ts`.
Update the appropriate `NEXT_PUBLIC_*_CONTRACT` variables per chain; no code edits are required.

---

## Subgraph (Optional, Scaffolding Included)

This repository ships with a `subgraph/` scaffold (placeholders for addresses and start blocks). Adjust `subgraph.yaml`, `schema.graphql`, and mappings under `subgraph/src/` to your deployment, then deploy with Graph CLI to Hosted Service or Studio.

---

## Deployment

Contracts (Foundry):
- Configure `.env` with RPCs and explorer API keys.
- Use `forge script` to deploy `DutchBasar` or go via `DutchBasarFactory`.
- Verify on explorers and set auction/mint parameters (see examples in the original guides).

Frontend (Vercel or custom):
- `bun install && bun run build` in `app/`.
- Configure `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` and contract addresses in `.env.local`.

Subgraph:
- `graph auth` and `graph deploy` per network.

Monitoring & Analytics:
- Consider OpenZeppelin Defender, custom Prometheus, or third‑party.

---

## Security

- Reentrancy protected (`nonReentrant`), CEI pattern, pausability.
- Merkle allowlist with on-chain verification.
- EIP‑2981 royalties, withdrawal safety checks, error-based reverts.
- Tests include unit, fuzz, invariants; static analysis with Slither/Mythril recommended.

Deployment security checklist:
- Hardware wallet for mainnet; multisig ownership where applicable.
- Verify on all explorers; monitor transactions and errors.
- Incident response playbook ready (pause/unpause tested).

---

## BSC Compatibility

- Chains 56 (BSC) and 97 (BSC Testnet) defined in `wagmi` config and `GasOptimizationDisplay` visuals.
- RPCs and explorer links provided; ensure accurate `CONTRACT_ADDRESSES` per env.
- Pricing/decimals are ETH-based in UI labels; adapt to BNB labeling if preferred.

---

## Development & Testing

- Install: `bun install` in `app/`, `forge install` in `contracts/`.
- Frontend dev: `bun run dev` (Turbopack).
- Typecheck/build: `bun run build` in `app/`, `forge test` in `contracts/`.
- Lints: ESLint configured; Tailwind v3 standard setup.

---

## Setup (First Run)

1) Copy environment template and set WalletConnect Project ID

```
cp app/.env.local.example app/.env.local
# Edit app/.env.local and set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
```

2) Install and run frontend (Next.js)

```
cd app
bun install
bun run dev
```

3) Deploy contracts and update addresses

- Deploy contracts with Foundry (see Contracts section)
- Update addresses in `app/.env.local` via `NEXT_PUBLIC_*_CONTRACT` variables (no code edits necessary)

4) Production build

```
cd app
bun run build
bun start
```

### Troubleshooting

- Web3Modal 403 during build: occurs when `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is missing/invalid. Set a valid project ID in `app/.env.local`.

---

## File Tree & Wiremap

```
DutchBasar/
├── app/
│   ├── next.config.js
│   ├── package.json
│   ├── postcss.config.mjs
│   └── src/
│       ├── app/
│       │   ├── globals.css              # Tailwind v3 styles
│       │   ├── layout.tsx               # Root layout
│       │   ├── page.tsx                 # Landing page (hero, tabs, cards)
│       │   └── providers.tsx            # HeroUI + Wagmi + RainbowKit + ReactQuery
│       ├── components/
│       │   ├── AuctionCard.tsx
│       │   ├── GasOptimizationDisplay.tsx
│       │   ├── MintSection.tsx
│       │   ├── PriceChart.tsx
│       │   └── ui/Button.tsx            # shadcn/ui button component
│       ├── hooks/
│       │   ├── useDutchBasar.ts         # Core hook: reads, writes, tx state, charts
│       │   ├── useAnalytics.ts          # GA4 integration & custom events
│       │   ├── useWebSocket.ts          # Real-time price streaming
│       │   └── useTransactionFeedback.ts # Transaction state management
│       └── lib/
│           ├── contracts.ts             # ABI + types + helpers
│           ├── utils.ts                 # UI formatting helpers
│           └── wagmi.ts                 # Chains, BSC support, WalletConnect config
├── contracts/
│   ├── foundry.toml
│   ├── src/
│   │   ├── DutchBasar.sol               # Main ERC‑721A auction
│   │   ├── DutchBasarFactory.sol        # Deploy factory
│   │   ├── utils/MerkleAllowlist.sol
│   │   └── extensions/
│   │       ├── DutchBasarMultiSig.sol
│   │       ├── DutchBasarAI.sol
│   │       ├── DutchBasarDAO.sol
│   │       ├── DutchBasarStaking.sol
│   │       └── DutchBasarBridge.sol
│   └── test/
│       └── DutchBasar.t.sol             # Comprehensive suite
├── subgraph/
│   ├── schema.graphql
│   ├── subgraph.yaml
│   └── src/
└── docs/
    └── documentation.md                 # Single source of truth (this file)
```

Wiremap (key interactions):
- UI ↔ Wagmi/RainbowKit (`providers.tsx`) ↔ Contracts (`DutchBasar.sol`).
- UI charts (`PriceChart`) consume `useDutchBasar` price history.
- Optional Subgraph for analytics outside critical path.

---

## Operations Checklist

- Contracts:
  - Configure auction & mint params.
  - Set allowlist Merkle root if used.
  - Reveal metadata with provenance hash.
- Frontend:
  - Set WalletConnect project ID.
  - Update contract addresses per chain.
  - Verify BSC RPCs and explorers.
- Security:
  - Pause/unpause tested; withdrawal paths verified.
  - Post-deploy monitoring configured.

---

## Recent Updates

### v1.0.0 (Current)
- **Performance**: React Strict Mode, optimized bundle splitting, image optimization (AVIF/WebP)
- **DX**: TypeScript strict mode, Prettier config, comprehensive npm scripts
- **Reliability**: Error boundaries, React Query retry logic, graceful fallbacks
- **Real-time**: WebSocket integration for live updates, analytics tracking
- **Testing**: 100% coverage gate (enforced), fuzz testing, invariant testing
- **CI/CD**: GitHub Actions for tests, linting, coverage gate
- **Documentation**: Single source of truth, complete API reference

### Latest Updates (v1.0.0)
- **WebSocket Integration**: Real-time price updates without RPC polling
- **Live Activity Feed**: Shows mints, price drops, whale alerts
- **Analytics System**: GA4 + custom endpoints, privacy-first
- **Performance Monitor**: FPS, memory, load time tracking
- **Security Middleware**: CSP headers, XSS protection
- **CI/CD Pipeline**: Automated testing, coverage, deployment
- **Multi-chain Optimizations**: Per-chain gas configurations

---

## Credits & License

**Author:** Christopher Schulze  
**License:** MIT  
**Repository:** https://github.com/christopherschulze/DutchBasar

---

## Complete File Structure (authoritative)

```
DutchBasar/
├── .github/
│   └── workflows/
│       ├── ci.yml              # CI/CD pipeline
│       ├── contracts.yml       # Contracts CI
│       └── frontend.yml        # Frontend tests
├── app/
│   ├── .env.local.example
│   ├── bun.lock
│   ├── eslint.config.mjs
│   ├── next-env.d.ts
│   │   │   ├── live-activity-feed.tsx  # Real-time activity display
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── ui/
│   │   │       └── Button.tsx
│   │   ├── hooks/
│   │   │   ├── useDutchBasar.ts
│   │   │   ├── useAnalytics.ts         # Analytics integration
│   │   │   ├── useWebSocket.ts         # WebSocket connection
│   │   │   └── useTransactionFeedback.ts # Transaction state management
│   │   ├── lib/
│   │   │   ├── wagmi.ts        # Chain configs
│   │   │   ├── contracts.ts    # ABIs
│   │   │   └── utils.ts
│   │   └── middleware.ts       # Security headers
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── .prettierrc.json
│   └── .env.local.example
├── contracts/
│   ├── src/
│   │   ├── DutchBasar.sol      # Main contract
│   │   └── DutchBasarFactory.sol
│   ├── test/
│   └── script/
├── docs/
│   ├── assets/                 # Images used in README/docs
│   └── documentation.md        # This file
└── README.md                   # Project README
```

## Repository File Map (Full)

The following tree includes relevant tracked files (excluding transient artifacts such as `node_modules/`, `.next/`, and OS files). Legacy artifacts have been removed from the active codebase.

```
DutchBasar/
├── .editorconfig
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Combined CI pipeline
│       ├── contracts.yml          # Contracts CI
│       └── frontend.yml           # Frontend CI
├── app/
│   ├── .env.local.example
│   ├── bun.lock
│   ├── eslint.config.mjs
│   ├── next-env.d.ts
│   ├── next.config.js
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── public/
│   └── src/
│       ├── app/
│       │   ├── globals.css
│       │   ├── layout.tsx
│       │   ├── page.tsx
│       │   └── providers.tsx
│       ├── components/
│       │   ├── AuctionCard.tsx
│       │   ├── GasOptimizationDisplay.tsx
│       │   ├── LiveActivityFeed.tsx
│       │   ├── MintSection.tsx
│       │   ├── PerformanceMonitor.tsx
│       │   ├── PriceChart.tsx
│       │   └── ui/Button.tsx
│       ├── hooks/
│       │   ├── useAnalytics.ts
│       │   ├── useDutchBasar.ts
│       │   └── useWebSocket.ts
│       ├── lib/
│       │   ├── contracts.ts
│       │   ├── utils.ts
│       │   └── wagmi.ts
│       └── middleware.ts
├── contracts/
│   ├── foundry.toml
│   ├── script/
│   │   └── Deploy.s.sol
│   ├── src/
│   │   ├── DutchBasar.sol
│   │   ├── DutchBasarFactory.sol
│   │   └── utils/MerkleAllowlist.sol
│   └── test/
│       ├── DutchBasar.t.sol
│       ├── DutchBasarFactory.t.sol
│       ├── DutchBasar.More.t.sol
│       └── MerkleAllowlist.t.sol
├── docs/
│   ├── assets/
│   │   ├── DutchBasar.png
│   │   └── Mock_frontend.jpeg
│   └── documentation.md
├── subgraph/
│   ├── schema.graphql
│   ├── src/
│   └── subgraph.yaml
├── LICENSE
└── README.md
```

---

## Detailed Wiremap

- Application shell
  - `app/src/app/layout.tsx` → exports `metadata` and `viewport`; wraps `<Providers/>`.
  - `app/src/app/providers.tsx` → composes `HeroUIProvider` → `WagmiProvider(config from lib/wagmi.ts)` → `QueryClientProvider` → `RainbowKitProvider`.

- Chain & wallet configuration
  - `app/src/lib/wagmi.ts` → defines chains (incl. `bsc`, `bscTestnet`, `zkSync*`), `getDefaultConfig` with `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`, `CONTRACT_ADDRESSES`, `CHAIN_CONFIGS`.

- Domain/UI components
  - `AuctionCard.tsx` → nutzt `useDutchBasar()` (Phase, Price, Supply), `format*` aus `lib/utils`.
  - `MintSection.tsx` → nutzt `useDutchBasar()` (public/allowlist mint), `Button` (HeroUI), Tx-Status.
  - `PriceChart.tsx` → nutzt `useDutchBasar`-Realtime-Preisverlauf; Canvas-Rendering.
  - `GasOptimizationDisplay.tsx` → CHAIN_CONFIGS + heuristische Gas/Kosten-Übersicht, BSC inkludiert.
  - `components/ui/Button.tsx` → Adapter um `@heroui/react`.

- Hooks & Utils
  - `useDutchBasar.ts` → kapselt Reads/Writes, Tx-State, Preis-Historie/Animation.
  - `lib/contracts.ts` → ABI & Typen.
  - `lib/utils.ts` → Formatierungen, `cn`-Helper.

---

## Guides

### Prerequisites
- Node.js 18+
- Bun (für Frontend)
- Foundry (`forge`, `cast`) für Contracts
- Graph CLI (optional für Subgraph)

### Frontend Guide
1. Environment setzen
   - Kopiere `.env.local.example` nach `.env.local` und trage `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` ein.
2. Development
   - `cd app && bun install && bun run dev`
3. Production
   - `bun run build && bun start`

### Contracts Guide
- Konfiguration: `contracts/foundry.toml`
- Deployment (Beispiel, vereinfacht):
  ```bash
  cd contracts
  forge build
  forge script script/Deploy.s.sol:Deploy --rpc-url $RPC_URL --private-key $PK --broadcast --verify
  ```
- Nach Deployment: Adressen in `app/src/lib/wagmi.ts` → `CONTRACT_ADDRESSES` je Chain eintragen.

### Subgraph Guide (optional)
```bash
cd subgraph
graph codegen
graph build
```

Note: `subgraph.yaml` contains placeholder `address` and `startBlock` values and event signatures tailored for a typical setup. Adjust the ABI/events and fill actual addresses/blocks before deploying.

```bash
graph auth --product hosted-service <ACCESS_TOKEN>
graph deploy --product hosted-service <ORG/NAME>
```
Passe `subgraph.yaml` und `schema.graphql` entsprechend an.

### Wallet & Chain Guide
- WalletConnect: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` erforderlich.
- Chains: in `lib/wagmi.ts` pflegen (Hinzufügen/Entfernen, RPCs, Explorer).
- Contract-Adresse: `CONTRACT_ADDRESSES[chainId]` aktualisieren.

### Theming & Styling Guide
- Tailwind v3: `app/src/app/globals.css`
  - `@tailwind base; @tailwind components; @tailwind utilities;`
  - `@custom-variant dark (&:is(.dark *))`
- Komponenten: HeroUI-kompatibel, Dark-Mode über `.dark`-Klasse.

---

## Quality Assurance & Testing

- Frontend
  - Typecheck/Build: `cd app && bun run build`
  - Dev: `bun run dev`
  - Lint: `bun run lint` (ESLint Next 15)

- Contracts
  - Tests: `cd contracts && forge test -vvv`
  - Static & Invariants: Siehe `test/` inkl. `invariant/`

---

## Performance & UX

- HeroUI + Tailwind v3 für leichte, schnelle UI.
- Canvas-basiertes Charting mit batched Repaints.
- SSR aktiviert (Wagmi `ssr: true`) für schnelleren First Paint.
- Empfehlungen:
  - Aktivierung von Bildoptimierung (Next Image) für große Grafiken (z. B. `DutchBasar.png`).
  - Prefetching/Partial Hydration nach Bedarf.

---

## Operations Runbook

### Incident Response
- Ownership & Access
  - Owner/Multisig hält Admin-Rollen (Pause/Unpause, Withdraw, Reveal, Configure*)
  - Hardware Wallets für Mainnet-Verwaltung
- Common Scenarios
  - Unexpected mint reverts → prüfen: Phase, Allowlist, Supply, `totalCost`, Gaslimit; Logs/Explorer einsehen
  - Price desync (UI) → Frontend neu laden; `useDutchBasar` Price-History prüfen; RPC Health check
  - Paused state → `unpause()` nur nach Root Cause Analyse; Ereignis dokumentieren
  - Reveal verfrüht/spät → Kommunikationsplan + korrektes `baseURI` mit Provenance Hash setzen
- Rollback Plan
  - Bei kritischen UI-Regressions: voriger Frontend-Build re-deployen
  - Contract Issues: falls irreparabel → Post-Mortem; Hotfix-Deployment via Factory (neue Adresse), UI-Umstellung, Transfer-Plan

### Oncall & Monitoring
- Oncall Rotation: definieren (Zeiten, Erreichbarkeit)
- Monitoring: Explorer Alerts (failed tx spikes), Backend RPC Health, Frontend Uptime (Statuspage)
- Logging: Frontend Sentry/console sampling, On-Chain Events via Indexer/Subgraph

### Change Management
- Releases mit Changelog; Semver für Frontend-Pakete
- Contract-Änderungen nur via Review + Tests + formale Verifikation, wenn möglich

---

## CI/CD

- `.github/workflows/ci.yml` → Combined pipeline with separate jobs for Contracts and Frontend, including a 100% Contracts coverage gate.

---

## Glossary

- ERC‑721A: Gas-optimierter ERC‑721 Standard für Batch-Minting.
- CEI Pattern: Checks-Effects-Interactions Reihenfolge zur Reentrancy-Prävention.
- Merkle Allowlist: On-Chain verifizierte Zugehörigkeit mittels Merkle Proofs; Off-Chain generierte Liste.
- SSR: Server-Side Rendering von Next.js; verbessert First Paint & SEO.
- Turbopack: Next.js Dev-Bundler (schnellere Dev-Builds). Produktion nutzt Webpack-Build.

---

## Troubleshooting (Extended)

- WalletConnect 403 während Build
  - Ursache: fehlendes/ungültiges `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
  - Lösung: gültige Project ID in `app/.env.local` setzen.

- Tailwind v3/PostCSS Fehler (z. B. fehlende Plugins)
  - Stelle sicher: `tailwindcss@^3` vorhanden und `postcss.config.mjs` korrekt.

- BigInt-Literal Fehler
  - `tsconfig.json` → `"target": "ES2020"` setzen (bereits konfiguriert).

- Turbopack/webpack Konfiguration
  - Build verwendet `next build` (webpack). Für Dev `--turbopack` möglich. Stelle sicher, dass `next.config.js` keine veralteten `experimental.turbo`-Keys enthält (bereinigt).

---
