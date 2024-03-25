import axios from "axios";

axios.defaults.baseURL = `https://api.xrpscan.com/api/v1`;

export interface WellKnownAccount {
  name: string;
  desc: string;
  account: string;
  domain: string;
  twitter: string;
  verified: boolean;
}

export const listWellKnownAccounts = () =>
  axios.get<WellKnownAccount[]>(`/names/well-known`);

export interface Amount<C = "XRP"> {
  value: number;
  currency: C;
}
export interface TransactionMeta<C = "XRP"> {
  TransactionIndex: number;
  TransactionResult: string;
  delivered_amount: Amount<C>;
}

export interface Transaction<C = "XRP"> {
  Account: string;
  AccountName: Omit<WellKnownAccount, "account">;
  Amount: Amount<C>;
  DeliverMax: string;
  Destination: string;
  DestinationName: WellKnownAccount;
  DestinationTag: number;
  Fee: string;
  Flags: string;
  LastLedgerSequence: number;
  Sequence: number;
  SigningPubKey: string;
  TransactionType: string;
  TxnSignature: string;
  ctid: string;
  date: string;
  hash: string;
  inLedger: number;
  ledger_index: number;
  meta: TransactionMeta<C>;
  validated: boolean;
}

export interface TransactionsByAccountItem {
  account: string;
  ledger_index_max: number;
  ledger_index_min: number;
  limit: number;
  marker: string;
  transactions: Transaction[];
  validated: boolean;
}

export const listTransactionsByAccount = (account: string, params?: any) =>
  axios.get<TransactionsByAccountItem>(`/account/${account}/transactions`, {
    params,
  });


