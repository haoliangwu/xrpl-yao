"use client";

import React, { useEffect } from "react";
import * as xrpl from "xrpl";
import { concatSeries } from "async";
import BigNumber from "bignumber.js";
import { QUERY_EVENT, SEARCH_EVENT, SYNC_PARAMS } from "@/events";
import { resolveTxnTotalFundsDetailView, resolveTxnTotalFunds } from "@/utils";
import { Marker, initClient, listTransactionsByAccount } from "@/xrpl";
import { db } from "@/db";
import { formatDate } from "date-fns";

const Results = () => {
  const [loading, setLoading] = React.useState(true);
  const [result, setResult] = React.useState({
    totalCount: 0,
    totalFund: new BigNumber(0),
    detailView: {} as Record<string, BigNumber>,
  });

  useEffect(() => {
    initClient().then(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      setLoading(true);

      const { detail } = event as CustomEvent;

      const fromDateTimes = detail.fromDate.getTime();

      let marker: Marker;

      function showProgress(tx?: xrpl.AccountTxTransaction["tx"]) {
        if (tx) {
          console.log(
            `${marker.ledger}_${marker.seq} of ${xrpl.rippleTimeToUnixTime(
              tx!.date!
            )}`
          );
        } else {
          console.log(`${marker.ledger}_${marker.seq}`);
        }
      }

      if (detail.marker && detail.marker.length > 0) {
        const [ledger, seq] = detail.marker.split("_");

        marker = { ledger: Number(ledger), seq: Number(seq) };
      }

      const asyncIterable = {
        [Symbol.asyncIterator]() {
          return {
            next() {
              return listTransactionsByAccount(detail.sourceAddress, {
                marker,
              }).then((res) => {
                const done = res.result.transactions.some(
                  (t) => xrpl.rippleTimeToUnixTime(t.tx!.date!) <= fromDateTimes
                );

                marker = res.result.marker as Marker;

                return {
                  value: res.result.transactions,
                  done,
                };
              });
            },
            return() {
              return { done: true };
            },
          };
        },
      };

      concatSeries(asyncIterable, async (transactions) => {
        showProgress(transactions[0].tx);

        await db.transactions.bulkPut(
          transactions,
          transactions.map((t) => t.tx!.hash!)
        );

        return transactions;
      })
        .then(() => {
          alert(
            `sync the latest transactions(to ${formatDate(
              detail.fromDate,
              "yyyy-MM-dd"
            )}) successfully`
          );

          showProgress();

          window.dispatchEvent(
            new CustomEvent(SYNC_PARAMS, {
              detail: {
                marker: `${marker.ledger}_${marker.seq}`,
              },
            })
          );

          window.dispatchEvent(
            new CustomEvent(QUERY_EVENT, {
              detail,
            })
          );
        })
        .finally(() => setLoading(false));
    };

    window.addEventListener(SEARCH_EVENT, handler);

    return () => {
      window.removeEventListener(SEARCH_EVENT, handler);
    };
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      setLoading(true);

      const { detail } = event as CustomEvent;

      const fromRippleTime = xrpl.unixTimeToRippleTime(
        detail.fromDate.getTime()
      );
      const toRippleTime = xrpl.unixTimeToRippleTime(detail.toDate.getTime());

      db.transactions
        .where(detail.isDeposit ? "tx.Destination" : "tx.Account")
        .equals(detail.sourceAddress)
        .and(
          (t) => fromRippleTime <= t.tx!.date! && t.tx!.date! <= toRippleTime
        )
        .toArray()
        .then((transactions) => {
          const totalCount = transactions.length;
          const totalFund = resolveTxnTotalFunds(transactions);
          const detailView = resolveTxnTotalFundsDetailView(detail.isDeposit)(
            transactions
          );

          setResult({
            totalCount,
            totalFund,
            detailView,
          });
        })
        .finally(() => {
          setLoading(false);
        });
    };

    window.addEventListener(QUERY_EVENT, handler);

    return () => {
      window.removeEventListener(QUERY_EVENT, handler);
    };
  }, []);

  return loading ? (
    "loading..."
  ) : (
    <div className="flex flex-col gap-4">
      <h2>Txn Count</h2>
      <div className="pl-8">{result.totalCount ?? "-"}</div>
      <h2>Total Funds</h2>
      <ul className="w-[240px]">
        <span>{result.totalFund.div(1000000).toFormat(6)}</span>
        <span className="ml-4">XRP</span>
      </ul>
      <h2>Total Funds</h2>
      <table className="pl-8 text-left">
        <thead>
          <tr>
            <th>Account(Alias)</th>
            <th>Amount(XRP)</th>
            <th>Percent</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(result.detailView)
            .filter(([, t]) => {
              return t.div(result.totalFund).gte(0.01);
            })
            .sort(([, t1], [, t2]) => t2.minus(t1).toNumber())
            .map(([d, t]) => {
              return (
                <tr key={d}>
                  <td>{d === "undefined" ? "Unknown" : d}</td>
                  <td>
                    <span>{t.div(1000000).toFormat(6)}</span>
                  </td>
                  <td>
                    <span>
                      <span>
                        {t.div(result.totalFund).multipliedBy(100).toFixed(6)}%
                      </span>
                    </span>
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default Results;
