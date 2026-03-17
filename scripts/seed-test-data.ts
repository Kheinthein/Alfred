/**
 * Script pour créer des livres et documents de test
 * Usage: npx tsx scripts/seed-test-data.ts <userId>
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const userId = process.argv[2];

  if (!userId) {
    console.error('❌ Erreur: userId manquant');
    console.log('Usage: npx tsx scripts/seed-test-data.ts <userId>');
    process.exit(1);
  }

  console.log(`🌱 Création de données de test pour l'utilisateur ${userId}...`);

  // Vérifier que l'utilisateur existe
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    console.error(`❌ Utilisateur ${userId} introuvable`);
    process.exit(1);
  }

  console.log(`✅ Utilisateur trouvé: ${user.email}`);

  // Récupérer les styles
  const fantasyStyle = await prisma.writingStyle.findFirst({
    where: { name: 'Fantasy' },
  });

  const thrillerStyle = await prisma.writingStyle.findFirst({
    where: { name: 'Thriller' },
  });

  if (!fantasyStyle || !thrillerStyle) {
    console.error('❌ Styles Fantasy ou Thriller introuvables');
    process.exit(1);
  }

  // Créer le livre Fantasy
  console.log('\n📚 Création du livre Fantasy...');
  const fantasyBook = await prisma.book.create({
    data: {
      userId,
      title: "Les Chroniques d'Aether",
      description: 'Un monde magique où les éléments règnent en maître',
      sortOrder: 0n,
    },
  });
  console.log(`✅ Livre créé: ${fantasyBook.title}`);

  // Créer 2 documents pour le livre Fantasy
  const fantasyDoc1 = await prisma.document.create({
    data: {
      userId,
      bookId: fantasyBook.id,
      chapterOrder: 1,
      title: "Chapitre 1 - L'Éveil du Mage",
      content: `Le soleil se levait sur la cité d'Aether, projetant ses rayons dorés à travers les cristaux flottants qui entouraient la ville. Kael observait ce spectacle depuis la tour des Arcanes, son cœur battant d'anticipation.

Aujourd'hui était le jour de l'Éveil - le jour où il découvrirait enfin son élément. Serait-ce le feu, comme son père ? Ou peut-être l'eau, comme sa défunte mère ? Il descendit les escaliers de pierre en spirale, sa robe d'apprenti flottant derrière lui.

Dans la grande salle, une centaine d'apprentis attendaient déjà, tous nerveux. Le Maître Elementis se tenait au centre, ses yeux brillant d'une lueur mystérieuse. "Que la cérémonie commence," déclara-t-il d'une voix grave.`,
      wordCount: 142,
      styleId: fantasyStyle.id,
      version: 1,
      sortOrder: 0n,
    },
  });

  const fantasyDoc2 = await prisma.document.create({
    data: {
      userId,
      bookId: fantasyBook.id,
      chapterOrder: 2,
      title: 'Chapitre 2 - Le Cristal Sombre',
      content: `Trois jours s'étaient écoulés depuis l'Éveil de Kael. Un événement sans précédent - il avait manifesté non pas un, mais deux éléments : le feu et l'ombre. Les autres apprentis le regardaient avec un mélange de crainte et d'envie.

Mais ce don unique s'accompagnait d'un terrible fardeau. Des visions hantaient ses nuits - un cristal noir pulsant d'une énergie malveillante, menaçant de consumer tout Aether. Le Conseil des Mages l'avait convoqué.

"Tu es le Bifurcateur," annonça la Grande Prêtresse. "La prophétie parle de toi. Seul celui qui maîtrise la lumière et les ténèbres peut empêcher la Grande Corruption." Kael sentit le poids du destin s'abattre sur ses épaules.`,
      wordCount: 129,
      styleId: fantasyStyle.id,
      version: 1,
      sortOrder: 1n,
    },
  });

  console.log(`  ✅ Document créé: ${fantasyDoc1.title}`);
  console.log(`  ✅ Document créé: ${fantasyDoc2.title}`);

  // Créer le livre Thriller
  console.log('\n📚 Création du livre Thriller...');
  const thrillerBook = await prisma.book.create({
    data: {
      userId,
      title: 'Code Mort',
      description:
        "Un thriller technologique haletant dans l'univers du dark web",
      sortOrder: 1n,
    },
  });
  console.log(`✅ Livre créé: ${thrillerBook.title}`);

  // Créer 2 documents pour le livre Thriller
  const thrillerDoc1 = await prisma.document.create({
    data: {
      userId,
      bookId: thrillerBook.id,
      chapterOrder: 1,
      title: 'Chapitre 1 - La Faille',
      content: `3h47 du matin. Sarah fixait l'écran de son ordinateur, les yeux rougis par la fatigue. Le code défilait sous ses doigts experts. En tant que lead developer chez CyberSecure, elle avait découvert quelque chose d'impossible : une backdoor dans leur système de cryptage militaire.

Quelqu'un avait accès à tout. Aux transactions bancaires. Aux communications gouvernementales. Aux secrets d'État. Et cette personne laissait une signature : un symbole étrange ressemblant à un œil inversé.

Son téléphone vibra. Un message d'un numéro inconnu : "Tu sais trop. Arrête maintenant." Sarah sentit un frisson glacé parcourir son échine. Comment pouvaient-ils déjà savoir ?`,
      wordCount: 115,
      styleId: thrillerStyle.id,
      version: 1,
      sortOrder: 0n,
    },
  });

  const thrillerDoc2 = await prisma.document.create({
    data: {
      userId,
      bookId: thrillerBook.id,
      chapterOrder: 2,
      title: 'Chapitre 2 - La Traque',
      content: `48 heures plus tard, Sarah était en fuite. Son appartement avait été saccagé, ses comptes bancaires gelés, et sa photo circulait dans tous les réseaux de surveillance. Accusée de terrorisme cybernétique.

Planquée dans un cybercafé miteux de la banlieue est, elle utilisait un laptop préparé pour l'occasion - aucune trace, connexion anonyme via VPN multiples. Elle devait découvrir qui se cachait derrière "L'Œil".

Les logs du serveur révélaient un pattern inquiétant : les accès provenaient de hauts responsables gouvernementaux. Mais impossible. À moins que... Son sang se glaça. Et si le gouvernement lui-même était compromis ? Son ancien mentor, Marcus, avait essayé de la prévenir avant de disparaître mystérieusement.`,
      wordCount: 126,
      styleId: thrillerStyle.id,
      version: 1,
      sortOrder: 1n,
    },
  });

  console.log(`  ✅ Document créé: ${thrillerDoc1.title}`);
  console.log(`  ✅ Document créé: ${thrillerDoc2.title}`);

  console.log('\n✨ Données de test créées avec succès !');
  console.log(`\n📊 Résumé:`);
  console.log(`   - 2 livres créés`);
  console.log(`   - 4 documents créés (2 par livre)`);
  console.log(
    `   - Total mots: ${fantasyDoc1.wordCount + fantasyDoc2.wordCount + thrillerDoc1.wordCount + thrillerDoc2.wordCount}`
  );
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
