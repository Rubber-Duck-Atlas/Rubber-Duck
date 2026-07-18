import React, { useEffect, useState } from "react";
import { House } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FileCard from "../components/FileCard";

export default function Documents() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<string[]>([]);
  const [notes, setNotes] = useState<string[]>([]);

  // Read files via electron contextBridge & IPC Handler
  useEffect(() => {
    window.api.getDocuments().then(setDocuments);
    window.api.getNotes().then(setNotes);
  }, []);

  return (
    <>
      <main className="min-h-screen bg-ink text-peri flex gap-2 p-2">
        <section className="flex-1 flex flex-col gap-2">
          <h1 className="text-2xl text-center font-bold">
            Documents & Lessons
          </h1>
          <div className="flex flex-col gap-2">
            {documents.map((f) => <FileCard FileName={f}/>)}
          </div>
        </section>
        <section className="flex-1 flex flex-col gap-4">
          <h1 className="text-2xl text-center font-bold">
            Notes
          </h1>
          {/* <div className="flex flex-col gap-2">
            {notes.map((f) => (
              <div
                className="bg-slate-800 p-1 px-2 rounded-2xl"
                key={`doc-${f}`}
              >
                {f}
              </div>
            ))}
          </div> */}
        </section>
      </main>
      <House
        className="absolute top-3 left-3 w-8 h-8 text-white cursor-pointer"
        onClick={() => navigate("/")}
      />
    </>
  );
}
