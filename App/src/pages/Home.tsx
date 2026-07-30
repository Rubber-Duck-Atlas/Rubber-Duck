import React, { useState } from "react";
import TextFade from "../components/TextFade";
import { Folder, Forward, LoaderCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import RubberDuck from "../lib/RubberDuck";
import SearchResultsList from "../components/SearchResultsList";

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState<string>("");
  const [lastSearch, setLastSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [searchView, setSearchView] = useState<boolean>(false);
  const [queriedDocuments, setQueriedDocuments] = useState<RubberDuckResult | undefined>(undefined);
  const [queriedNotes, setQueriedNotes] = useState<RubberDuckResult | undefined>(undefined);

  const text = "What can I find for you?";

  const handleQuery = () => {
    setLoading(true)
    if (!query) return;
    RubberDuck(query, false).then((document_results) => {
      RubberDuck(query, true).then((note_results) => {
        setLastSearch(query)
        setQueriedDocuments(document_results)
        setQueriedNotes(note_results)
        setSearchView(true)
        setLoading(false)
      });
    });
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleQuery();
    }
  };

  const sortedDocuments = [...(queriedDocuments?.results ?? [])].sort((a, b) => b.score - a.score);
  const sortedNotes = [...(queriedNotes?.results ?? [])].sort((a, b) => b.score - a.score);

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
        <div className="p-2 gap-2 w-96 rounded-xl bg-peri text-ink font-bold animate-fade-up opacity-0 flex justify-between">
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
          />{loading ? <LoaderCircle className="animate-spin" /> : <Forward onClick={handleQuery} />}
        </div>
        {searchView ? <div className="flex flex-col gap-4">
          <h1 className="font-bold text-lg text-center flex mx-auto">
            Showing results for "{lastSearch}" <X className="m-auto cursor-pointer text-red-400" onClick={() => {
              setSearchView(false)
            }}/>
          </h1> 
          <div className="flex gap-4">
            <SearchResultsList title="Documents" results={sortedDocuments} isNote={false}/>
            <SearchResultsList title="Notes" results={sortedNotes} isNote={true}/>
          </div>
        </div> : (
          <></>
        )}
      </main>


      {/* Link to prototype file viewer thingy */}
      <Folder
        className="absolute top-3 left-3 w-8 h-8 text-white cursor-pointer"
        onClick={() => navigate("/Documents")}
      />
    </>
  );
}
