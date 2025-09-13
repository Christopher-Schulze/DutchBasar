.PHONY: dev test build deploy clean

# Development
dev:
	@echo "🚀 Starting development environment..."
	@make -j 3 dev-frontend dev-contracts dev-monitor

dev-frontend:
	cd app && bun dev

dev-contracts:
	cd contracts && forge test --watch

dev-monitor:
	@echo "📊 Performance monitor at http://localhost:3000"

# Testing
test:
	@echo "🧪 Running all tests..."
	@make test-contracts
	@make test-frontend

test-contracts:
	cd contracts && forge test -vvv --gas-report

test-frontend:
	cd app && bun test

coverage:
	cd contracts && forge coverage --report lcov
	cd app && bun test --coverage

# Build
build:
	@echo "🔨 Building production..."
	cd app && bun run build
	cd contracts && forge build --optimize

# Deploy
deploy-testnet:
	cd contracts && forge script script/Deploy.s.sol --rpc-url sepolia --broadcast

deploy-mainnet:
	@echo "⚠️  Deploying to mainnet..."
	cd contracts && forge script script/Deploy.s.sol --rpc-url mainnet --broadcast --verify

# Utils
clean:
	rm -rf app/.next app/node_modules
	cd contracts && forge clean

install:
	cd app && bun install
	cd contracts && forge install

format:
	cd app && bun run format
	cd contracts && forge fmt

audit:
	cd app && bun audit
	cd contracts && slither .
