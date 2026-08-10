import React, { useState } from "react";
import TextFade from "../components/TextFade";
import { Forward, LoaderCircle, X } from "lucide-react";
import RubberDuck from "../lib/RubberDuck";
import SearchResultsList from "../components/SearchResultsList";

export default function Home() {
  const [query, setQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [searchView, setSearchView] = useState<boolean>(false);
  const [queriedResults, setQueriedResults] = useState<RubberDuckResult | undefined>(undefined);

  const text = "What can I find for you?";

  const handleQuery = () => {
    if (!query) return;
    setLoading(true);
    RubberDuck(query)
      .then((results) => {
        setQueriedResults(results);
        setSearchView(true);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleQuery();
    }
  };

  const sortedResults = [...(queriedResults?.results ?? [])].sort((a, b) => b.score - a.score);

  return (
    <>
      <main
        className={`min-h-screen bg-ink text-peri flex flex-col p-4 gap-4 justify-${searchView ? "start" : "center"} items-center`}
      >
        {/* Fade in animation per character */}
        <TextFade
          className={`${searchView ? "hidden " : ""}font-bold text-3xl cursor-default animate-duration`}
          text={text}
        />
        <div className="p-2 gap-2 w-96 rounded-xl bg-peri text-ink font-bold animate-fade-up opacity-0 flex justify-between items-center">
          <input
            type="text"
            name="search"
            id="search"
            placeholder="Search..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="flex-1"
            style={{
              animationDelay: `${text.length * 10 - 100}ms`,
              animationFillMode: "forwards",
            }}
          />
          {searchView ? (
            <X
              className="cursor-pointer"
              onClick={() => {
                setSearchView(false);
                setQueriedResults(undefined);
              }}
            />
          ) : null}
          {loading ? <LoaderCircle className="animate-spin" /> : <Forward onClick={handleQuery} />}
        </div>
        {searchView ? <div className="flex flex-col gap-4 w-full items-center">
          <h1 className="font-bold text-lg text-center flex mx-auto max-w-3xl">
            {queriedResults?.answer ?? "No answer available."}
          </h1>
          <div className="flex gap-8 w-full justify-center">
            <SearchResultsList title="Results" results={sortedResults} />
          </div>
        </div> : (
          <></>
        )}
      </main>
    </>
  );
}
