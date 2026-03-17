export default function Home() {
  return (
    <div className="font-interface flex-1 flex items-center justify-center bg-gradient-to-br from-neutral-bg via-neutral-bgSecondary to-white p-4">
      <div className="text-center max-w-2xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-ai-primary/10 px-4 py-2">
          <div className="h-2 w-2 rounded-full bg-ai-primary animate-pulse"></div>
          <span className="text-xs font-semibold text-ai-primary uppercase tracking-wide">
            Assistant IA
          </span>
        </div>
        <h1 className="font-writing text-5xl font-bold text-parchment-text mb-4 sm:text-6xl">
          Alfred
        </h1>
        <p className="font-writing text-2xl text-neutral-textSecondary mb-2 sm:text-3xl">
          Assistant d&rsquo;Écriture
        </p>
        <p className="font-interface text-lg text-neutral-textSecondary/80 mb-10 sm:text-xl">
          Écrivez avec l&rsquo;aide de l&rsquo;intelligence artificielle
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="/login"
            className="inline-block rounded-lg bg-gradient-to-r from-ai-primary to-ai-primaryAlt px-8 py-4 font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
          >
            Se connecter
          </a>
          <a
            href="/register"
            className="inline-block rounded-lg border-2 border-ai-primary px-8 py-4 font-bold text-ai-primary transition-all hover:bg-ai-primary/10 hover:scale-105"
          >
            Créer un compte
          </a>
          <a
            href="/api/docs"
            className="inline-block rounded-lg px-8 py-4 font-semibold text-neutral-textSecondary transition-colors hover:text-ai-primary"
          >
            Documentation API
          </a>
        </div>
      </div>
    </div>
  );
}
