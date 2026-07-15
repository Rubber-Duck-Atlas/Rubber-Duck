import React from 'react';
import { createRoot } from 'react-dom/client';
import TextFade from './components/textfade';

const rootElement = document.getElementById('root');

if (!rootElement) {
	throw new Error('Root element not found');
}

const root = createRoot(rootElement);

function App() {

    const text = "What can find for you?"

	return (
		<main className="min-h-screen bg-ink text-peri flex flex-col gap-4 justify-center items-center">
            <TextFade className='font-bold text-3xl' text={text}/>
			<input type="text" name="search" id="search" placeholder='Search...'
                className='p-2 w-96 rounded-xl bg-peri text-ink font-bold animate-fade-up opacity-0' style={{
              animationDelay: `${text.length * 25 - 150}ms`,
              animationFillMode: "forwards",
            }}/>
		</main>
	);
}

root.render(<App />);