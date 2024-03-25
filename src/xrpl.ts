import * as xrpl from "xrpl";

export let xrplClient: xrpl.Client;

const ENDPOINT = "wss://s1.ripple.com/";

export const initClient = async () => {
  xrplClient = new xrpl.Client(ENDPOINT);
  await xrplClient.connect();

  return xrplClient;
};

export interface Marker {
  ledger: number;
  seq: number;
}

export const listTransactionsByAccount = async (
  account: string,
  params?: Omit<xrpl.AccountTxRequest, "command" | "account">
): Promise<xrpl.AccountTxResponse> => {
  return xrplClient.request({
    command: "account_tx",
    account,
    ...params,
  });
};
