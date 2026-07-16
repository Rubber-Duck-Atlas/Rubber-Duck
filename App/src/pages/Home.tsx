
import React from 'react';
import TextFade from '../components/TextFade';
import { Folder } from 'lucide-react';
import { useNavigate } from "react-router-dom";


export default function Home() {
    const navigate = useNavigate();

    const text = "What can I find for you?"

    return (<>
        <main className="min-h-screen bg-ink text-peri flex flex-col gap-4 justify-center items-center">

            {/* Fade in animation per character */}
            <TextFade className='font-bold text-3xl cursor-default' text={text} /> 

            <input type="text" name="search" id="search" placeholder='Search...'
                className='p-2 w-96 rounded-xl bg-peri text-ink font-bold animate-fade-up opacity-0' style={{
                    animationDelay: `${text.length * 10 - 100}ms`,
                    animationFillMode: "forwards",
                }} />

        </main>

        {/* Link to prototype file viewer thingy */}
        <Folder className='absolute top-3 left-3 w-8 h-8 text-white cursor-pointer' onClick={() => navigate("/Documents")} />
    </>
    );
}