import React, { useEffect, useState } from "react";
import { House } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FileCard from "../components/FileCard";

export default function Documents() {
  const navigate = useNavigate();
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

  const handleFileChange = ({ documents, notes }: { documents: string[]; notes: string[] }) => {
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
      <main className="bg-ink text-peri flex flex-col gap-2 p-2 items-center h-screen overflow-hidden">
        <div className="flex flex-1 w-full gap-2 min-h-0 overflow-hidden">
          <section className="flex-1 flex flex-col gap-2 overflow-y-auto min-h-0">
            <h1 className="text-2xl text-center font-bold">
              Documents & Lessons
            </h1>
            <div className="flex flex-col gap-2">
              {documents.map((f) => (
                <FileCard FileName={f} isNote={false} onChange={handleFileChange} key={f} />
              ))}
            </div>
          </section>
          <section className="flex-1 flex flex-col gap-2 overflow-y-auto min-h-0">
            <h1 className="text-2xl text-center font-bold">Notes</h1>
            <div className="flex flex-col gap-2">
              {notes.map((f) => (
                <FileCard FileName={f} isNote={true} onChange={handleFileChange} key={f} />
              ))}
            </div>
          </section>
        </div>
        <div>
          <button
            type="button"
            className="p-2 text-center w-sm bg-lilac rounded-l-2xl border-peri border-r-2 cursor-pointer"
            onClick={handleAddDocuments}
          >
            Add Documents
          </button>
          <button 
          type="button" 
          className="p-2 text-center w-sm bg-lilac rounded-r-2xl border-peri border-l-2 cursor-pointer"
            onClick={handleAddNotes}
          >
            Add Notes
          </button>
        </div>
      </main>
      <House
        className="absolute top-3 left-3 w-8 h-8 text-white cursor-pointer"
        onClick={() => navigate("/")}
      />
    </>
  );
}
