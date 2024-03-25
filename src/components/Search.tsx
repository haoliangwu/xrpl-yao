"use client";

import React, { useEffect } from "react";
import { format, parse } from "date-fns";
import { QUERY_EVENT, SEARCH_EVENT, SYNC_PARAMS } from "@/events";
import {
  INITIAL_MARKER,
  INITIAL_FROM_DATE,
  SOURCE_ADDRESS,
  IS_DEPOSIT,
  INITIAL_TO_DATE,
} from "@/consts";
import wellKnownAccounts from "../well-known-accounts.json";

const now = new Date();

const Search = (props: React.PropsWithChildren<{}>) => {
  const [query, setQuery] = React.useState({
    sourceAddress: SOURCE_ADDRESS,
    fromDate: parse(INITIAL_FROM_DATE, "yyyy-MM-dd", now),
    toDate: parse(INITIAL_TO_DATE, "yyyy-MM-dd", now),
    marker: INITIAL_MARKER,
    isDeposit: IS_DEPOSIT,
  });

  useEffect(() => {
    const handler = (event: Event) => {
      const { detail } = event as CustomEvent;

      setQuery((prev) => ({ ...prev, ...detail }));
    };

    window.addEventListener(SYNC_PARAMS, handler);

    return () => {
      window.removeEventListener(SYNC_PARAMS, handler);
    };
  }, []);

  return (
    <form>
      <div className="flex gap-4 mt-2">
        <label htmlFor="source-address">Source Address</label>
        <input
          id="source-address"
          className="w-[300px]"
          value={query.sourceAddress}
          onChange={(e) =>
            setQuery((p) => ({ ...p, sourceAddress: e.target.value }))
          }
        ></input>
        {/* @ts-expect-error */}
        <span>({wellKnownAccounts[query.sourceAddress]})</span>
      </div>
      <div className="flex gap-4 mt-2">
        <label htmlFor="from-date">From Date</label>
        <input
          type="date"
          id="from-date"
          value={format(query.fromDate, "yyyy-MM-dd")}
          onChange={(e) => {
            setQuery((p) => ({
              ...p,
              fromDate: parse(e.target.value, "yyyy-MM-dd", new Date()),
            }));
          }}
        ></input>
        <label htmlFor="to-date">To Date</label>
        <input
          type="date"
          id="to-date"
          value={format(query.toDate, "yyyy-MM-dd")}
          onChange={(e) => {
            setQuery((p) => ({
              ...p,
              toDate: parse(e.target.value, "yyyy-MM-dd", new Date()),
            }));
          }}
        ></input>
        <label htmlFor="marker">Marker</label>
        <input
          id="marker"
          value={query.marker}
          onChange={(e) => setQuery((p) => ({ ...p, marker: e.target.value }))}
        ></input>
        <label htmlFor="marker">Deposit</label>
        <input
          type="checkbox"
          id="marker"
          checked={query.isDeposit}
          onChange={(e) =>
            setQuery((p) => ({ ...p, isDeposit: e.target.checked }))
          }
        ></input>
      </div>
      <div className="flex gap-4 mt-2">
        <button
          className="p-2 border-2 border-blue-500 border-dashed"
          type="button"
          onClick={() => {
            window.dispatchEvent(
              new CustomEvent(SEARCH_EVENT, {
                detail: query,
              })
            );
          }}
        >
          Search
        </button>
        <button
          className="p-2 border-2 border-blue-500 border-dashed"
          type="button"
          onClick={() => {
            window.dispatchEvent(
              new CustomEvent(QUERY_EVENT, {
                detail: query,
              })
            );
          }}
        >
          Query
        </button>
      </div>
    </form>
  );
};

export default Search;
