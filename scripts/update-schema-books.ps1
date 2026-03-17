# Script pour ajouter le modèle Book au schéma Prisma
$schemaPath = Join-Path $PSScriptRoot "..\prisma\schema.prisma"
$content = Get-Content $schemaPath -Raw

# Ajouter books à User
$content = $content -replace '(  documents    Document\[\])', '$1`n  books        Book[]'

# Ajouter le modèle Book après User
$bookModel = @'

model Book {
  id          String     @id @default(cuid())
  userId      String
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  title       String
  description String?
  sortOrder   BigInt     @default(0)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  documents   Document[]

  @@index([userId])
  @@index([userId, sortOrder])
  @@map("books")
}

'@
$content = $content -replace '(@@map\("users"\)\n})', "$1`n$bookModel"

# Ajouter bookId et chapterOrder à Document
$content = $content -replace '(  sortOrder    BigInt             @default\(0\))', '$1`n  bookId       String?`n  book         Book?              @relation(fields: [bookId], references: [id], onDelete: SetNull)`n  chapterOrder BigInt?'

# Ajouter les index pour bookId
$content = $content -replace '(@@index\(\[userId, sortOrder\]\))', '$1`n  @@index([bookId])`n  @@index([bookId, chapterOrder])'

Set-Content $schemaPath -Value $content -NoNewline
Write-Host "Schema updated successfully!"
