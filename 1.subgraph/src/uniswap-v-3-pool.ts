import { Address, BigInt, log } from "@graphprotocol/graph-ts"
import {
  Burn as BurnEvent,
  Collect as CollectEvent,
  CollectProtocol as CollectProtocolEvent,
  Flash as FlashEvent,
  IncreaseObservationCardinalityNext as IncreaseObservationCardinalityNextEvent,
  Initialize as InitializeEvent,
  Mint as MintEvent,
  SetFeeProtocol as SetFeeProtocolEvent,
  Swap as SwapEvent
} from "../generated/UniswapV3Pool/UniswapV3Pool"
import {
  Burn,
  Collect,
  CollectProtocol,
  Flash,
  IncreaseObservationCardinalityNext,
  Initialize,
  Mint,
  SetFeeProtocol,
  Swap
} from "../generated/schema"
import { Pool, Token } from "./types/schema"
import { fetchTokenDecimals, fetchTokenName, fetchTokenSymbol, fetchTokenTotalSupply } from "./utils/token"
import { POOL_ADDR, TOKEN0_ADDR, TOKEN1_ADDR, ZERO_BI } from "./utils/constants"
import { loadTransaction } from "./utils"

export function handleBurn(event: BurnEvent): void {
  let entity = new Burn(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.tickLower = event.params.tickLower
  entity.tickUpper = event.params.tickUpper
  entity.amount = event.params.amount
  entity.amount0 = event.params.amount0
  entity.amount1 = event.params.amount1

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.origin = event.transaction.from
  entity.save()
}

export function handleCollect(event: CollectEvent): void {
  let entity = new Collect(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.owner = event.params.owner
  entity.recipient = event.params.recipient
  entity.tickLower = event.params.tickLower
  entity.tickUpper = event.params.tickUpper
  entity.amount0 = event.params.amount0
  entity.amount1 = event.params.amount1

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCollectProtocol(event: CollectProtocolEvent): void {
  let entity = new CollectProtocol(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.sender = event.params.sender
  entity.recipient = event.params.recipient
  entity.amount0 = event.params.amount0
  entity.amount1 = event.params.amount1

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleFlash(event: FlashEvent): void {
  let entity = new Flash(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.sender = event.params.sender
  entity.recipient = event.params.recipient
  entity.amount0 = event.params.amount0
  entity.amount1 = event.params.amount1
  entity.paid0 = event.params.paid0
  entity.paid1 = event.params.paid1

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleIncreaseObservationCardinalityNext(
  event: IncreaseObservationCardinalityNextEvent
): void {
  let entity = new IncreaseObservationCardinalityNext(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.observationCardinalityNextOld =
    event.params.observationCardinalityNextOld
  entity.observationCardinalityNextNew =
    event.params.observationCardinalityNextNew

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleInitialize(event: InitializeEvent): void {
  let entity = new Initialize(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.sqrtPriceX96 = event.params.sqrtPriceX96
  entity.tick = event.params.tick

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()

  let pool = new Pool(POOL_ADDR)
  let token0 = new Token(TOKEN0_ADDR)
  
  let address = Address.fromString(TOKEN0_ADDR)
  let decimals: BigInt | null
  token0.symbol = fetchTokenSymbol(address)
  token0.name = fetchTokenName(address)
  token0.totalSupply = fetchTokenTotalSupply(address)
  decimals = fetchTokenDecimals(address)
  if (decimals === null) {
    log.debug('mybug the decimal on token 0 was null', [])
    return
  }
  token0.decimals = decimals
  
  let token1 = new Token(TOKEN1_ADDR)
  address = Address.fromString(TOKEN1_ADDR)
  token1.symbol = fetchTokenSymbol(address)
  token1.name = fetchTokenName(address)
  token1.totalSupply = fetchTokenTotalSupply(address)
  decimals = fetchTokenDecimals(address)
  if (decimals === null) {
    log.debug('mybug the decimal on token 0 was null', [])
    return
  }
  token1.decimals = decimals

  pool.token0 = token0.id
  pool.token1 = token1.id
  pool.feeTier = BigInt.fromString("10000")
  pool.liquidity = ZERO_BI
  pool.save()
  token0.save()
  token1.save()
}

export function handleMint(event: MintEvent): void {
  let entity = new Mint(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.sender = event.params.sender
  entity.owner = event.params.owner
  entity.tickLower = event.params.tickLower
  entity.tickUpper = event.params.tickUpper
  entity.amount = event.params.amount
  entity.amount0 = event.params.amount0
  entity.amount1 = event.params.amount1

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash
  entity.origin = event.transaction.from
  const poolAddress = event.address.toHexString()
  const pool = Pool.load(poolAddress)
  if (pool == null)
    entity.pool = "unknown"
  else
    entity.pool = pool.id

  entity.save()
}

export function handleSetFeeProtocol(event: SetFeeProtocolEvent): void {
  let entity = new SetFeeProtocol(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.feeProtocol0Old = event.params.feeProtocol0Old
  entity.feeProtocol1Old = event.params.feeProtocol1Old
  entity.feeProtocol0New = event.params.feeProtocol0New
  entity.feeProtocol1New = event.params.feeProtocol1New

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleSwap(event: SwapEvent): void {
  let entity = new Swap(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.sender = event.params.sender
  entity.recipient = event.params.recipient
  entity.amount0 = event.params.amount0
  entity.amount1 = event.params.amount1
  entity.sqrtPriceX96 = event.params.sqrtPriceX96
  entity.liquidity = event.params.liquidity
  entity.tick = event.params.tick

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
