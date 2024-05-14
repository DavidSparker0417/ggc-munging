import { BigInt, ethereum } from "@graphprotocol/graph-ts"
import { Transaction } from "../types/schema"

export function isNullEthValue(value: string): boolean {
  return value == '0x0000000000000000000000000000000000000000000000000000000000000001'
}

export function loadTransaction(event: ethereum.Event): Transaction {
  let transaction = Transaction.load(event.transaction.hash.toHexString())
  if (transaction === null) {
    transaction = new Transaction(event.transaction.hash.toHexString())
  }
  transaction.blockNumber = event.block.number
  transaction.timestamp = event.block.timestamp
  transaction.gasUsed = BigInt.zero() //needs to be moved to transaction receipt
  transaction.gasPrice = event.transaction.gasPrice
  transaction.save()
  return transaction as Transaction
}