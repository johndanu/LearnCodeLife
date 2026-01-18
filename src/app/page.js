import Link from 'next/link';
import Image from 'next/image';
import Header from '../components/Header';

// Helper function to get base URL for absolute URLs
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.NEXT_PUBLIC_VERCEL_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  return process.env.NODE_ENV === 'production' 
    ? 'https://learncode.life' 
    : 'http://localhost:3000';
};

export default function LandingPage() {
  const baseUrl = getBaseUrl();
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "LearnCode.life",
    "description": "Code Logic Explainer and Learning Path Generator",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "url": baseUrl,
    "author": {
      "@type": "Organization",
      "name": "LearnCode"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="h-screen flex flex-col bg-background text-text-main overflow-hidden">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center relative selection:bg-primary/20 selection:text-text-main overflow-y-auto">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse-slow" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-accent/10 blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] bg-primary/5 blur-[150px] rounded-full" />
        </div>

        <div className="container relative z-10 px-4 sm:px-6 lg:px-8 text-center max-w-5xl mx-auto">
          {/* Logo */}
          <div className="mb-8 animate-in fade-in zoom-in-95">
            <Image 
              src="/logo.png" 
              alt="LearnCode Logo" 
              width={80} 
              height={80} 
              className="w-20 h-20 mx-auto rounded-2xl shadow-2xl"
              priority
            />
          </div>

          <div className="mb-6 inline-block animate-in fade-in slide-in-from-top">
            <span className="px-4 py-1.5 rounded-full bg-surface/80 backdrop-blur-sm border border-secondary/30 text-xs font-semibold text-text-muted shadow-lg">
              ✨ v1.0 Public Beta
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold tracking-tight mb-6 leading-tight animate-in fade-in slide-in-from-bottom-4">
            Transform Your Code into <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-glow to-accent animate-gradient">
              Personalized Learning Paths
            </span>
          </h1>

          <p className="text-sm sm:text-base text-text-muted mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '0.1s' }}>
            Paste any code snippet and let AI generate a structured learning roadmap. 
            Discover concepts organized by difficulty levels with interactive explanations.
          </p>

          <div className="flex justify-center items-center gap-4 animate-in fade-in zoom-in-95" style={{ animationDelay: '0.2s' }}>
            <Link
              href="/code"
              className="group relative px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-glow text-white font-semibold text-sm sm:text-base hover:shadow-2xl hover:shadow-primary/50 hover:-translate-y-1 transition-all duration-300 shadow-lg overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Get Started
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary-glow to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </div>

          {/* Feature Pills */}
          <div className="mt-12 flex flex-wrap justify-center gap-3 animate-in fade-in" style={{ animationDelay: '0.3s' }}>
            <span className="px-4 py-2 rounded-full bg-surface/60 backdrop-blur-sm border border-secondary/20 text-xs font-medium text-text-muted">
              🤖 AI-Powered
            </span>
            <span className="px-4 py-2 rounded-full bg-surface/60 backdrop-blur-sm border border-secondary/20 text-xs font-medium text-text-muted">
              📚 Structured Learning
            </span>
            <span className="px-4 py-2 rounded-full bg-surface/60 backdrop-blur-sm border border-secondary/20 text-xs font-medium text-text-muted">
              ⚡ Instant Analysis
            </span>
          </div>
        </div>

        <footer className="absolute bottom-4 sm:bottom-6 w-full text-center text-xs text-text-muted/60 hover:text-text-muted transition-colors px-4">
          <p className="flex flex-wrap items-center justify-center gap-2">
            <span>Dev by johndanushan</span>
            <span className="text-text-muted/40">•</span>
            <span>Supported by lizris</span>
            <span className="text-text-muted/40">•</span>
            <a
              href="https://github.com/johndanu"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary underline decoration-dashed underline-offset-4 transition-colors"
            >
              github/johndanu
            </a>
          </p>
        </footer>
      </main>
    </div>
    </>
  );
}

