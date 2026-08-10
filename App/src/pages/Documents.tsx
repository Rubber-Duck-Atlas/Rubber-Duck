import React, { useEffect, useState } from "react";
import FileCard from "../components/FileCard";

export default function Documents() {
  const [documents, setDocuments] = useState<string[]>([]);
  const [notes, setNotes] = useState<string[]>([]);

  const handleAddDocuments = () => {
    window.api.openAndAddFiles(false).then((updated) => {
      if (updated.length > 0) setDocuments(updated);
    });
  };

  const handleAddNotes = () => {
    window.api.openAndAddFiles(true).then((updated) => {
      if (updated.length > 0) setNotes(updated);
    });
  };

  const handleFileChange = ({
    documents,
    notes,
  }: {
    documents: string[];
    notes: string[];
  }) => {
    setDocuments(documents);
    setNotes(notes);
  };

  // Read files via electron contextBridge & IPC Handler
  useEffect(() => {
    window.api.getDocuments().then(setDocuments);
    window.api.getNotes().then(setNotes);
  }, []);

  return (
    <>
      <main className="flex w-full flex-col items-center px-6 pb-4 pt-2 text-center">
        {/* Header Section */}
        <div className="mx-auto w-full max-w-5xl">
          <h1 className="text-3xl font-bold">Documents</h1>

          <p>Upload, search, and organize your study materials.</p>
        </div>

        <div className="mt-4 h-px w-full bg-peri/40" />

        {/* Upload Section */}
        <div className="flex flex-col w-full gap-4 p-5 text-peri">
          <h2 className="text-left w-full text-xl font-semibold">
            Upload Files
          </h2>

          <div className="mx-auto flex w-full max-w-3xl flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-6">
            <button
              type="button"
              className="w-full flex-1 cursor-pointer rounded-2xl bg-lilac p-2 text-center transition hover:opacity-90"
              onClick={handleAddDocuments}
            >
              Add Documents
            </button>
            <p className="self-center text-sm">OR</p>
            <button
              type="button"
              className="w-full flex-1 cursor-pointer rounded-2xl bg-lilac p-2 text-center transition hover:opacity-90"
              onClick={handleAddNotes}
            >
              Add Notes
            </button>
          </div>
        </div>

        <div className="mt-4 h-px w-full bg-peri/40" />

        <div className="flex flex-col w-full gap-4 min-h-0 md:flex-row">
          <section className="flex flex-col flex-1 min-w-0 gap-2">
            <h2 className="text-xl text-center font-semibold">
              Your Documents
            </h2>
            <div className="flex flex-col gap-2 text-left">
              {documents.length === 0 && (
                <p className="w-full text-center text-sm text-peri/60">
                  No documents uploaded yet.
                </p>
              )}
              {documents.map((f) => (
                <FileCard
                  FileName={f}
                  isNote={false}
                  onChange={handleFileChange}
                  key={f}
                />
              ))}
            </div>
          </section>
          <section className="flex flex-col flex-1 min-w-0 gap-2">
            <h2 className="text-xl text-center font-semibold">Your Notes</h2>
            <div className="flex flex-col gap-2 text-left">
              {notes.length === 0 && (
                <p className="w-full text-center text-sm text-peri/60">
                  No notes uploaded yet.
                </p>
              )}
              {notes.map((f) => (
                <FileCard
                  FileName={f}
                  isNote={true}
                  onChange={handleFileChange}
                  key={f}
                />
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
