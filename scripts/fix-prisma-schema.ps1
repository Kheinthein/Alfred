# Script pour mettre à jour le schéma Prisma avec le modèle Book
$schemaPath = Join-Path $PSScriptRoot "..\prisma\schema.prisma"
$content = Get-Content $schemaPath -Raw -Encoding UTF8

# 1. Ajouter books à User
$content = $content -replace '(  documents    Document\[\])', '$1`n  books        Book[]'

# 2. Ajouter le modèle Book après User
$bookModel = @'

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

'@
$content = $content -replace '(@@map\("users"\)\n})', "$1`n$bookModel"

# 3. Ajouter bookId, chapterOrder et la relation book à Document
$content = $content -replace '(  sortOrder    BigInt             @default\(0\))', '$1`n  bookId       String?`n  book         Book?              @relation(fields: [bookId], references: [id], onDelete: SetNull)`n  chapterOrder Int?'

# 4. Ajouter les index pour bookId
$content = $content -replace '(@@index\(\[userId, sortOrder\]\))', '$1`n  @@index([bookId])`n  @@index([bookId, chapterOrder])'

Set-Content $schemaPath -Value $content -NoNewline -Encoding UTF8
Write-Host "Schema updated successfully!"
