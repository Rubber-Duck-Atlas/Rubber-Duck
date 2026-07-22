import React from "react";
import SearchResult from "./SearchResult";

export default function SearchResultsList({query, results}: {query: string, results: any}) {

  return <div className="w-full max-w-2xl flex flex-col gap-3">
    <h1 className="font-bold text-lg">
      Showing results for "{query}"
    </h1>
    {results.length === 0 ? (
      <p className="text-sm text-lilac">No matches found.</p>
    ) : (
      <div className="flex flex-col gap-2">
        {results.map((result: any, index: number) => (
          <SearchResult
            key={`${result.path}-${index}`}
            path={result.path}
            score={result.score}
            snippet={result.snippet}
          />
        ))}
      </div>
    )}
  </div>
}