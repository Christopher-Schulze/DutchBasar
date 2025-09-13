import {
  AuctionConfigured,
  AllowlistConfigured,
  PhaseChanged,
  Minted,
  Revealed,
  RoyaltyUpdated,
  FundsWithdrawn,
  Transfer,
  Approval,
  ApprovalForAll,
} from "../generated/DutchBasar/DutchBasar";

import {
  DutchBasarContract,
  Auction,
  Mint,
  Token,
  User,
  Transfer as TransferEntity,
  AllowlistEntry,
  PriceSnapshot,
  DailyStats,
  GlobalStats,
} from "../generated/schema";

import { BigInt, BigDecimal, Address, Bytes } from "@graphprotocol/graph-ts";

// Constants
const ZERO_BI = BigInt.fromI32(0);
const ONE_BI = BigInt.fromI32(1);
const ZERO_BD = BigDecimal.fromString("0");

/**
 * Handle auction configuration events
 */
export function handleAuctionConfigured(event: AuctionConfigured): void {
  let contract = getOrCreateContract(event.address);
  let auction = getOrCreateAuction(event.address, event.block.timestamp);
  
  // Update auction parameters
  auction.startPrice = event.params.startPrice;
  auction.endPrice = event.params.endPrice;
  auction.startTime = event.params.startTime;
  auction.endTime = event.params.endTime;
  auction.priceDecayRate = event.params.priceDecayRate;
  auction.configuredAt = event.block.timestamp;
  
  auction.save();
  
  // Update contract
  contract.updatedAt = event.block.timestamp;
  contract.save();
  
  // Create initial price snapshot
  createPriceSnapshot(auction, event.params.startPrice, event.block.timestamp, event.block.number);
}

/**
 * Handle allowlist configuration events
 */
export function handleAllowlistConfigured(event: AllowlistConfigured): void {
  let contract = getOrCreateContract(event.address);
  contract.updatedAt = event.block.timestamp;
  contract.save();
}

/**
 * Handle phase change events
 */
export function handlePhaseChanged(event: PhaseChanged): void {
  let contract = getOrCreateContract(event.address);
  contract.currentPhase = getPhaseFromNumber(event.params.newPhase);
  contract.updatedAt = event.block.timestamp;
  contract.save();
  
  // Update current auction
  let auction = getCurrentAuction(event.address);
  if (auction) {
    auction.currentPhase = getPhaseFromNumber(event.params.newPhase);
    auction.save();
  }
}

/**
 * Handle mint events
 */
export function handleMinted(event: Minted): void {
  let contract = getOrCreateContract(event.address);
  let auction = getCurrentAuction(event.address);
  let user = getOrCreateUser(event.params.to);
  
  // Create mint entity
  let mintId = event.transaction.hash.concatI32(event.logIndex.toI32());
  let mint = new Mint(mintId);
  
  mint.contract = contract.id;
  mint.auction = auction ? auction.id : Bytes.empty();
  mint.minter = user.id;
  mint.recipient = event.params.to;
  mint.startTokenId = event.params.tokenId;
  mint.quantity = event.params.quantity;
  mint.pricePerToken = event.params.price;
  mint.totalCost = event.params.price.times(event.params.quantity);
  mint.phase = getPhaseFromNumber(event.params.phase);
  mint.transactionHash = event.transaction.hash;
  mint.blockNumber = event.block.number;
  mint.timestamp = event.block.timestamp;
  mint.gasUsed = event.transaction.gasUsed;
  mint.gasPrice = event.transaction.gasPrice;
  
  mint.save();
  
  // Create token entities
  for (let i = 0; i < event.params.quantity.toI32(); i++) {
    let tokenId = event.params.tokenId.plus(BigInt.fromI32(i));
    let token = new Token(tokenId);
    
    token.contract = contract.id;
    token.owner = user.id;
    token.mintTransaction = mint.id;
    token.createdAt = event.block.timestamp;
    
    token.save();
  }
  
  // Update contract stats
  contract.totalSupply = contract.totalSupply.plus(event.params.quantity);
  contract.updatedAt = event.block.timestamp;
  contract.save();
  
  // Update auction stats
  if (auction) {
    auction.totalMinted = auction.totalMinted.plus(event.params.quantity);
    auction.totalRevenue = auction.totalRevenue.plus(mint.totalCost);
    auction.save();
  }
  
  // Update user stats
  user.totalTokensMinted = user.totalTokensMinted.plus(event.params.quantity);
  user.totalSpent = user.totalSpent.plus(mint.totalCost);
  user.mintCount = user.mintCount.plus(ONE_BI);
  user.lastSeenAt = event.block.timestamp;
  user.save();
  
  // Update daily stats
  updateDailyStats(contract, mint, event.block.timestamp);
  
  // Update global stats
  updateGlobalStats(mint, event.block.timestamp);
  
  // Create price snapshot
  if (auction) {
    createPriceSnapshot(auction, event.params.price, event.block.timestamp, event.block.number);
  }
}

/**
 * Handle reveal events
 */
export function handleRevealed(event: Revealed): void {
  let contract = getOrCreateContract(event.address);
  contract.revealed = true;
  contract.provenanceHash = event.params.provenanceHash;
  contract.updatedAt = event.block.timestamp;
  contract.save();
}

/**
 * Handle royalty update events
 */
export function handleRoyaltyUpdated(event: RoyaltyUpdated): void {
  let contract = getOrCreateContract(event.address);
  contract.updatedAt = event.block.timestamp;
  contract.save();
}

/**
 * Handle funds withdrawal events
 */
export function handleFundsWithdrawn(event: FundsWithdrawn): void {
  let contract = getOrCreateContract(event.address);
  contract.updatedAt = event.block.timestamp;
  contract.save();
}

/**
 * Handle transfer events
 */
export function handleTransfer(event: Transfer): void {
  // Skip mint transfers (from zero address)
  if (event.params.from.equals(Address.zero())) {
    return;
  }
  
  let token = Token.load(event.params.tokenId);
  if (!token) return;
  
  let fromUser = getOrCreateUser(event.params.from);
  let toUser = getOrCreateUser(event.params.to);
  
  // Create transfer entity
  let transferId = event.transaction.hash.concatI32(event.logIndex.toI32());
  let transfer = new TransferEntity(transferId);
  
  transfer.token = token.id;
  transfer.from = fromUser.id;
  transfer.to = toUser.id;
  transfer.transactionHash = event.transaction.hash;
  transfer.blockNumber = event.block.number;
  transfer.timestamp = event.block.timestamp;
  
  transfer.save();
  
  // Update token owner
  token.owner = toUser.id;
  token.save();
  
  // Update user balances
  fromUser.totalTokensOwned = fromUser.totalTokensOwned.minus(ONE_BI);
  fromUser.lastSeenAt = event.block.timestamp;
  fromUser.save();
  
  toUser.totalTokensOwned = toUser.totalTokensOwned.plus(ONE_BI);
  toUser.lastSeenAt = event.block.timestamp;
  toUser.save();
}

/**
 * Handle approval events
 */
export function handleApproval(event: Approval): void {
  // We don't need to track individual approvals for this use case
  // But this handler is required for the subgraph to work properly
}

/**
 * Handle approval for all events
 */
export function handleApprovalForAll(event: ApprovalForAll): void {
  // We don't need to track approval for all events for this use case
  // But this handler is required for the subgraph to work properly
}

/**
 * Helper function to get or create contract entity
 */
function getOrCreateContract(address: Address): DutchBasarContract {
  let contract = DutchBasarContract.load(address);
  
  if (!contract) {
    contract = new DutchBasarContract(address);
    contract.name = "";
    contract.symbol = "";
    contract.chainId = BigInt.fromI32(1); // Default to mainnet, should be updated
    contract.owner = Address.zero();
    contract.totalSupply = ZERO_BI;
    contract.maxSupply = ZERO_BI;
    contract.currentPhase = "NotStarted";
    contract.revealed = false;
    contract.createdAt = BigInt.fromI32(0);
    contract.updatedAt = BigInt.fromI32(0);
  }
  
  return contract;
}

/**
 * Helper function to get or create auction entity
 */
function getOrCreateAuction(address: Address, timestamp: BigInt): Auction {
  let auctionId = address.concat(timestamp);
  let auction = Auction.load(auctionId);
  
  if (!auction) {
    auction = new Auction(auctionId);
    auction.contract = address;
    auction.startPrice = ZERO_BI;
    auction.endPrice = ZERO_BI;
    auction.startTime = ZERO_BI;
    auction.endTime = ZERO_BI;
    auction.priceDecayRate = ZERO_BI;
    auction.currentPhase = "NotStarted";
    auction.totalMinted = ZERO_BI;
    auction.totalRevenue = ZERO_BI;
    auction.uniqueMinters = ZERO_BI;
    auction.configuredAt = timestamp;
  }
  
  return auction;
}

/**
 * Helper function to get current auction
 */
function getCurrentAuction(address: Address): Auction | null {
  // This is a simplified implementation
  // In a real subgraph, you'd need to track the current auction more carefully
  let contract = getOrCreateContract(address);
  // For now, we'll assume there's only one auction per contract
  let auctionId = address.concat(contract.createdAt);
  return Auction.load(auctionId);
}

/**
 * Helper function to get or create user entity
 */
function getOrCreateUser(address: Address): User {
  let user = User.load(address);
  
  if (!user) {
    user = new User(address);
    user.totalTokensOwned = ZERO_BI;
    user.totalTokensMinted = ZERO_BI;
    user.totalSpent = ZERO_BI;
    user.mintCount = ZERO_BI;
    user.firstSeenAt = BigInt.fromI32(0);
    user.lastSeenAt = BigInt.fromI32(0);
  }
  
  return user;
}

/**
 * Helper function to convert phase number to enum
 */
function getPhaseFromNumber(phase: i32): string {
  if (phase == 0) return "NotStarted";
  if (phase == 1) return "Allowlist";
  if (phase == 2) return "Public";
  if (phase == 3) return "Ended";
  return "NotStarted";
}

/**
 * Helper function to create price snapshots
 */
function createPriceSnapshot(
  auction: Auction,
  price: BigInt,
  timestamp: BigInt,
  blockNumber: BigInt
): void {
  let snapshotId = auction.id.concat(timestamp);
  let snapshot = new PriceSnapshot(snapshotId);
  
  snapshot.auction = auction.id;
  snapshot.price = price;
  snapshot.timestamp = timestamp;
  snapshot.blockNumber = blockNumber;
  
  // Calculate time elapsed and progress
  let timeElapsed = timestamp.minus(auction.startTime);
  let totalDuration = auction.endTime.minus(auction.startTime);
  
  snapshot.timeElapsed = timeElapsed;
  
  if (totalDuration.gt(ZERO_BI)) {
    let progress = timeElapsed.toBigDecimal().div(totalDuration.toBigDecimal()).times(BigDecimal.fromString("100"));
    snapshot.progressPercentage = progress;
  } else {
    snapshot.progressPercentage = ZERO_BD;
  }
  
  snapshot.save();
}

/**
 * Helper function to update daily stats
 */
function updateDailyStats(contract: DutchBasarContract, mint: Mint, timestamp: BigInt): void {
  let dayTimestamp = timestamp.div(BigInt.fromI32(86400)).times(BigInt.fromI32(86400));
  let dayString = dayTimestamp.toString();
  let statsId = contract.id.concat(Bytes.fromUTF8(dayString));
  
  let stats = DailyStats.load(statsId);
  if (!stats) {
    stats = new DailyStats(statsId);
    stats.date = dayString;
    stats.contract = contract.id;
    stats.totalMints = ZERO_BI;
    stats.totalTokensMinted = ZERO_BI;
    stats.totalRevenue = ZERO_BI;
    stats.uniqueMinters = ZERO_BI;
    stats.averagePrice = ZERO_BD;
    stats.highestPrice = ZERO_BI;
    stats.lowestPrice = BigInt.fromString("999999999999999999999999999"); // Very high initial value
  }
  
  // Update stats
  stats.totalMints = stats.totalMints.plus(ONE_BI);
  stats.totalTokensMinted = stats.totalTokensMinted.plus(mint.quantity);
  stats.totalRevenue = stats.totalRevenue.plus(mint.totalCost);
  
  // Update price tracking
  if (mint.pricePerToken.gt(stats.highestPrice)) {
    stats.highestPrice = mint.pricePerToken;
  }
  if (mint.pricePerToken.lt(stats.lowestPrice)) {
    stats.lowestPrice = mint.pricePerToken;
  }
  
  // Calculate average price
  if (stats.totalTokensMinted.gt(ZERO_BI)) {
    stats.averagePrice = stats.totalRevenue.toBigDecimal().div(stats.totalTokensMinted.toBigDecimal());
  }
  
  stats.save();
}

/**
 * Helper function to update global stats
 */
function updateGlobalStats(mint: Mint, timestamp: BigInt): void {
  let stats = GlobalStats.load("global");
  if (!stats) {
    stats = new GlobalStats("global");
    stats.totalContracts = ZERO_BI;
    stats.totalTokensMinted = ZERO_BI;
    stats.totalRevenue = ZERO_BI;
    stats.totalUsers = ZERO_BI;
    stats.totalMints = ZERO_BI;
    stats.averageGasUsed = ZERO_BD;
    stats.lastUpdated = ZERO_BI;
  }
  
  // Update stats
  stats.totalTokensMinted = stats.totalTokensMinted.plus(mint.quantity);
  stats.totalRevenue = stats.totalRevenue.plus(mint.totalCost);
  stats.totalMints = stats.totalMints.plus(ONE_BI);
  
  // Update average gas used
  if (mint.gasUsed && stats.totalMints.gt(ZERO_BI)) {
    let currentTotal = stats.averageGasUsed.times(stats.totalMints.minus(ONE_BI).toBigDecimal());
    let newTotal = currentTotal.plus(mint.gasUsed.toBigDecimal());
    stats.averageGasUsed = newTotal.div(stats.totalMints.toBigDecimal());
  }
  
  stats.lastUpdated = timestamp;
  stats.save();
}

/**
 * Helper function to get phase enum from number
 */
function getPhaseFromNumber(phase: i32): string {
  if (phase == 0) return "NotStarted";
  if (phase == 1) return "Allowlist";
  if (phase == 2) return "Public";
  if (phase == 3) return "Ended";
  return "NotStarted";
}