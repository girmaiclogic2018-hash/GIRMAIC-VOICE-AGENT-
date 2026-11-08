import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GIRMAIC AI Voice Agent — Premium Humanoid Robot Edition',
  description: 'African Intelligence. Global Innovation. Human Progress. Official Voice AI Prototype for GIRMAIC AI Technology and Trading.',
  openGraph: {
    title: 'GIRMAIC AI Voice Agent — Premium Humanoid Robot Edition',
    description: 'African Intelligence. Global Innovation. Human Progress. Official Voice AI Prototype for GIRMAIC AI Technology and Trading.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GIRMAIC AI Voice Agent — Premium Humanoid Robot Edition',
    description: 'African Intelligence. Global Innovation. Human Progress. Official Voice AI Prototype for GIRMAIC AI Technology and Trading.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 font-sans antialiased selection:bg-amber-500/30 selection:text-amber-200 min-h-screen overflow-x-hidden" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
