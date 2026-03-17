import Link from 'next/link';

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="writing-zone rounded-xl border-2 border-parchment-border/60 p-6 shadow-parchment-md sm:p-8">
          <Link
            href="/"
            className="font-interface text-sm font-medium text-action-link transition-colors hover:underline mb-6 inline-block"
          >
            ← Retour à l&apos;accueil
          </Link>

          <h1 className="font-writing text-3xl font-bold text-parchment-text mb-6 sm:text-4xl">
            Mentions Légales
          </h1>

          <div className="font-writing text-parchment-text space-y-6 text-sm sm:text-base">
            <section>
              <h2 className="font-semibold text-lg mb-3">Éditeur</h2>
              <p className="text-neutral-textSecondary">
                Le site Alfred est édité par :
                <br />
                <strong>Alfred</strong>
                <br />
                Application d&apos;assistance à l&apos;écriture avec
                intelligence artificielle
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-lg mb-3">
                Directeur de publication
              </h2>
              <p className="text-neutral-textSecondary">
                Le directeur de publication est le représentant légal de
                l&apos;éditeur.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-lg mb-3">Hébergeur</h2>
              <p className="text-neutral-textSecondary">
                Le site est hébergé par :
                <br />
                Les informations d&apos;hébergement seront complétées lors du
                déploiement en production.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-lg mb-3">
                Protection des données
              </h2>
              <p className="text-neutral-textSecondary">
                Conformément au Règlement Général sur la Protection des Données
                (RGPD) et à la loi Informatique et Libertés, vous disposez
                d&apos;un droit d&apos;accès, de rectification, de suppression
                et d&apos;opposition aux données personnelles vous concernant.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-lg mb-3">
                Propriété intellectuelle
              </h2>
              <p className="text-neutral-textSecondary">
                L&apos;ensemble du contenu du site (textes, images, logos, etc.)
                est la propriété d&apos;Alfred ou de ses partenaires et est
                protégé par les lois françaises et internationales relatives à
                la propriété intellectuelle.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-lg mb-3">Contact</h2>
              <p className="text-neutral-textSecondary">
                Pour toute question concernant les présentes mentions légales,
                vous pouvez nous contacter via l&apos;application.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
