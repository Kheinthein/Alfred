const fs = require('fs');
const path = require('path');

// Chemin absolu du workspace
const workspacePath = "C:\\Users\\quent\\Desktop\\projet de fin d'année\\Alfred";
const schemaPath = path.join(workspacePath, 'prisma', 'schema.prisma');

console.log('Reading schema file from:', schemaPath);

let content = fs.readFileSync(schemaPath, 'utf8');

// Ajouter bookId, book et chapterOrder après sortOrder dans Document
content = content.replace(
  /(  sortOrder    BigInt             @default\(0\))/,
  `$1
  bookId       String?
  book         Book?              @relation(fields: [bookId], references: [id], onDelete: SetNull)
  chapterOrder Int?`
);

// Ajouter les index pour bookId
content = content.replace(
  /(@@index\(\[userId, sortOrder\]\))/,
  `$1
  @@index([bookId])
  @@index([bookId, chapterOrder])`
);

fs.writeFileSync(schemaPath, content, 'utf8');
console.log('✅ Schema updated successfully!');
