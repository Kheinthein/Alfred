import Link from 'next/link';

export default function CGUPage() {
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
            Conditions Générales d&apos;Utilisation
          </h1>

          <div className="font-writing text-parchment-text space-y-6 text-sm sm:text-base">
            <section>
              <h2 className="font-semibold text-lg mb-3">Article 1 : Objet</h2>
              <p className="text-neutral-textSecondary">
                Les présentes Conditions Générales d&apos;Utilisation (ci-après
                les &quot;CGU&quot;) ont pour objet de définir les conditions
                d&apos;accès et d&apos;utilisation du service Alfred, une
                application d&apos;assistance à l&apos;écriture avec
                intelligence artificielle.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-lg mb-3">
                Article 2 : Acceptation des CGU
              </h2>
              <p className="text-neutral-textSecondary">
                L&apos;utilisation du service Alfred implique l&apos;acceptation
                pleine et entière des présentes CGU. En créant un compte,
                l&apos;utilisateur reconnaît avoir lu, compris et accepté les
                présentes conditions.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-lg mb-3">
                Article 3 : Compte utilisateur
              </h2>
              <p className="text-neutral-textSecondary">
                Pour utiliser le service, l&apos;utilisateur doit créer un
                compte en fournissant une adresse email valide et un mot de
                passe sécurisé. L&apos;utilisateur est responsable de la
                confidentialité de ses identifiants et s&apos;engage à nous
                informer de toute utilisation non autorisée de son compte.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-lg mb-3">
                Article 4 : Services proposés
              </h2>
              <p className="text-neutral-textSecondary">
                Alfred propose des services d&apos;assistance à l&apos;écriture
                incluant la création et la gestion de documents, l&apos;analyse
                de texte par intelligence artificielle, et l&apos;organisation
                de documents en livres et chapitres.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-lg mb-3">
                Article 5 : Données personnelles
              </h2>
              <p className="text-neutral-textSecondary">
                Les données personnelles collectées sont traitées conformément à
                notre politique de confidentialité et au Règlement Général sur
                la Protection des Données (RGPD). L&apos;utilisateur dispose
                d&apos;un droit d&apos;accès, de rectification et de suppression
                de ses données.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-lg mb-3">
                Article 6 : Responsabilité et limites
              </h2>
              <p className="text-neutral-textSecondary">
                Alfred s&apos;efforce de fournir un service de qualité mais ne
                peut garantir l&apos;absence d&apos;erreurs ou
                d&apos;interruptions. L&apos;utilisateur est seul responsable du
                contenu qu&apos;il crée et publie via le service.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-lg mb-3">
                Article 7 : Modifications des CGU
              </h2>
              <p className="text-neutral-textSecondary">
                Alfred se réserve le droit de modifier les présentes CGU à tout
                moment. Les utilisateurs seront informés des modifications par
                email ou via une notification dans l&apos;application. La
                poursuite de l&apos;utilisation du service après modification
                vaut acceptation des nouvelles conditions.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-lg mb-3">
                Article 8 : Propriété intellectuelle
              </h2>
              <p className="text-neutral-textSecondary">
                L&apos;utilisateur conserve l&apos;intégralité de ses droits sur
                les contenus qu&apos;il crée via Alfred. L&apos;utilisateur
                accorde à Alfred une licence d&apos;utilisation nécessaire au
                fonctionnement du service.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
