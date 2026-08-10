import React from "react";
import SearchResult from "./SearchResult";

export default function SearchResultsList({title, results}: {title: string, results: any}) {

  return <div className="w-full max-w-2xl flex flex-col gap-3 items-center mx-auto">
    {title.length>0 ? <h1 className="font-bold text-lg text-center">
      {title}
    </h1> : <></>}
    {results.length === 0 ? (
      <p className="text-sm text-lilac">No matches found.</p>
    ) : (
      <div className="flex flex-col gap-2 w-full">
        {results.map((result: any, index: number) => (
          <SearchResult
            key={`${result.path}-${index}`}
            path={result.path}
            rank={index + 1}
            snippet={result.snippet}
          />
        ))}
      </div>
    )}
  </div>
}