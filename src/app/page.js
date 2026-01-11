import Link from 'next/link';
import Header from '../components/Header';

export default function LandingPage() {
  return (
    <div className="h-screen flex flex-col bg-[hsl(var(--background))] text-[hsl(var(--text-main))] overflow-hidden">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center relative selection:bg-[hsl(var(--primary))] selection:text-white overflow-y-auto">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[hsl(var(--primary))] opacity-5 blur-[100px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-[hsl(var(--accent))] opacity-5 blur-[100px] rounded-full" />
        </div>

        <div className="container relative z-10 px-6 text-center max-w-4xl mx-auto">
          <div className="mb-6 inline-block">
            <span className="px-3 py-1 rounded-full bg-[hsl(var(--surface))] border border-[hsl(var(--secondary))] text-xs font-medium text-[hsl(var(--text-muted))] shadow-sm">
              v1.0 Public Beta
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-5 leading-tight">
            Transform Your Code into <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))]">
              Personalized Learning Paths
            </span>
          </h1>

          <p className="text-base md:text-lg text-[hsl(var(--text-muted))] mb-10 max-w-2xl mx-auto leading-relaxed">
            Paste any code snippet and let AI generate a structured learning roadmap. 
            Discover concepts organized by difficulty levels with interactive explanations.
          </p>

          <div className="flex justify-center items-center">
            <Link
              href="/code"
              className="px-8 py-4 rounded-xl bg-[hsl(var(--primary))] text-white font-semibold text-lg hover:bg-[hsl(var(--primary-glow))] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 shadow-md"
            >
              Get Started
            </Link>
          </div>
        </div>

        <footer className="absolute bottom-6 w-full text-center text-xs text-[hsl(var(--text-muted))] opacity-60">
          <p>
            Dev by johndanushan <span className="mx-2">•</span> Supported by lizris <span className="mx-2">•</span>
            <a
              href="https://github.com/johndanu"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[hsl(var(--primary))] underline decoration-dashed underline-offset-4"
            >
              github/johndanu
            </a>
          </p>      </footer>
      </main>
    </div>
  );
}

