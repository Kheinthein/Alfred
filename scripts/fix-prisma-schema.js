const fs = require('fs');
const path = require('path');

// Utiliser __dirname pour obtenir le chemin du script, puis remonter d'un niveau
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
let content = fs.readFileSync(schemaPath, 'utf8');

// 1. Ajouter books à User
content = content.replace(
  /(  documents    Document\[\])/,
  '$1\n  books        Book[]'
);

// 2. Ajouter le modèle Book après User
const bookModel = `

model Book {
  id          String     @id @default(cuid())
  userId      String
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  title       String
  description String?
  sortOrder   Int        @default(0)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  documents   Document[]

  @@index([userId])
  @@index([userId, sortOrder])
  @@map("books")
}

`;

content = content.replace(
  /(@@map\("users"\)\n})/,
  `$1${bookModel}`
);

// 3. Ajouter bookId, chapterOrder et la relation book à Document
content = content.replace(
  /(  sortOrder    BigInt             @default\(0\))/,
  `$1
  bookId       String?
  book         Book?              @relation(fields: [bookId], references: [id], onDelete: SetNull)
  chapterOrder Int?`
);

// 4. Ajouter les index pour bookId
content = content.replace(
  /(@@index\(\[userId, sortOrder\]\))/,
  `$1
  @@index([bookId])
  @@index([bookId, chapterOrder])`
);

fs.writeFileSync(schemaPath, content, 'utf8');
console.log('Schema updated successfully!');
