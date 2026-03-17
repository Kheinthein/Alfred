import Link from 'next/link';

export default function CGVPage() {
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
            Conditions Générales de Vente
          </h1>

          <div className="font-writing text-parchment-text space-y-6 text-sm sm:text-base">
            <section>
              <h2 className="font-semibold text-lg mb-3">Article 1 : Objet</h2>
              <p className="text-neutral-textSecondary">
                Les présentes Conditions Générales de Vente (ci-après les
                &quot;CGV&quot;) régissent les abonnements premium proposés par
                Alfred pour accéder à des fonctionnalités avancées de
                l&apos;application d&apos;assistance à l&apos;écriture.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-lg mb-3">Article 2 : Tarifs</h2>
              <p className="text-neutral-textSecondary">
                Les tarifs des abonnements premium sont indiqués en euros TTC.
                Alfred se réserve le droit de modifier les tarifs à tout moment,
                sous réserve d&apos;informer les utilisateurs au moins 30 jours
                avant l&apos;entrée en vigueur des nouveaux tarifs.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-lg mb-3">
                Article 3 : Abonnements
              </h2>
              <p className="text-neutral-textSecondary">
                Les abonnements premium sont proposés selon différentes formules
                (mensuel, annuel). L&apos;abonnement est renouvelé
                automatiquement sauf résiliation par l&apos;utilisateur avant la
                date de renouvellement.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-lg mb-3">
                Article 4 : Modalités de paiement
              </h2>
              <p className="text-neutral-textSecondary">
                Le paiement s&apos;effectue par carte bancaire ou tout autre
                moyen de paiement proposé. Le paiement est exigible
                immédiatement lors de la souscription à l&apos;abonnement.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-lg mb-3">
                Article 5 : Droit de rétractation
              </h2>
              <p className="text-neutral-textSecondary">
                Conformément à l&apos;article L.221-18 du Code de la
                consommation, l&apos;utilisateur dispose d&apos;un délai de 14
                jours pour exercer son droit de rétractation à compter de la
                souscription, sans avoir à justifier de motifs ni à payer de
                pénalités.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-lg mb-3">
                Article 6 : Résiliation
              </h2>
              <p className="text-neutral-textSecondary">
                L&apos;utilisateur peut résilier son abonnement à tout moment
                depuis son compte. La résiliation prend effet à la fin de la
                période d&apos;abonnement en cours. Aucun remboursement ne sera
                effectué pour la période déjà payée.
              </p>
            </section>

            <section>
              <h2 className="font-semibold text-lg mb-3">
                Article 7 : Remboursement
              </h2>
              <p className="text-neutral-textSecondary">
                En cas d&apos;exercice du droit de rétractation dans les délais
                légaux, le remboursement sera effectué dans un délai de 14 jours
                suivant la réception de la demande de rétractation.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
