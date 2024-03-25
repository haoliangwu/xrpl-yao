// db.ts
import type { AccountTxTransaction } from "xrpl";
import Dexie, { Table } from "dexie";

export class MyDexie extends Dexie {
  transactions!: Table<AccountTxTransaction>;

  constructor() {
    super("xrpl");

    this.version(1).stores({
      transactions: ",&tx.hash,tx.Account,tx.Destination", // Primary key and indexed props
    });
  }
}

export const db = new MyDexie();
