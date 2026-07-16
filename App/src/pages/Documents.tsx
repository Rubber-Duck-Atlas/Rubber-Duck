
import React, { useEffect, useState } from 'react';
import TextFade from '../components/TextFade';
import fs from "node:fs";
import { House } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Documents() {
    const navigate = useNavigate();
    const [files, setFiles] = useState<any[]>([]);

    // Read files via electron contextBridge & IPC Handler
    useEffect(() => {
        window.api.listFiles("../Notes_Data").then(setFiles);
    }, []);

    return (<>
        <main className="min-h-screen bg-ink text-peri flex flex-col gap-2 p-2 justify-center items-center">
            {files.map(f => <>
                <div className='bg-slate-800 p-1 px-2 rounded-2xl' key={f}>{f}</div>
            </>)}
        </main>
        <House className='absolute top-3 left-3 w-8 h-8 text-white cursor-pointer' onClick={() => navigate("/")} />
    </>
    );
}