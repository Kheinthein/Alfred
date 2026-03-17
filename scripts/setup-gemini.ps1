# Script PowerShell pour configurer rapidement Gemini
# Usage: .\scripts\setup-gemini.ps1

Write-Host "🔧 Configuration de Google Gemini pour Alfred" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si .env.local existe
$envLocalPath = ".env.local"
$envExamplePath = ".env.example"

if (-not (Test-Path $envLocalPath)) {
    Write-Host "📋 Création du fichier .env.local..." -ForegroundColor Yellow
    
    if (Test-Path $envExamplePath) {
        Copy-Item $envExamplePath $envLocalPath
        Write-Host "✅ Fichier .env.local créé depuis .env.example" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur: .env.example n'existe pas" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Le fichier .env.local existe déjà" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔑 Configuration de la clé API Gemini" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pour obtenir une clé API Gemini:" -ForegroundColor White
Write-Host "1. Allez sur: https://makersuite.google.com/app/apikey" -ForegroundColor White
Write-Host "2. Connectez-vous avec votre compte Google" -ForegroundColor White
Write-Host "3. Cliquez sur 'Create API Key' ou 'Get API Key'" -ForegroundColor White
Write-Host "4. Copiez la clé générée (format: AIzaSy...)" -ForegroundColor White
Write-Host ""

# Demander la clé API
$apiKey = Read-Host "Entrez votre clé API Gemini (ou appuyez sur Entrée pour passer)"

if ($apiKey) {
    Write-Host ""
    Write-Host "💾 Mise à jour du fichier .env.local..." -ForegroundColor Yellow
    
    # Lire le contenu actuel
    $content = Get-Content $envLocalPath -Raw
    
    # Mettre à jour AI_PROVIDER
    if ($content -match 'AI_PROVIDER=') {
        $content = $content -replace 'AI_PROVIDER=".*"', 'AI_PROVIDER="gemini"'
        $content = $content -replace "AI_PROVIDER='.*'", "AI_PROVIDER=`"gemini`""
        $content = $content -replace 'AI_PROVIDER=.*', 'AI_PROVIDER="gemini"'
    } else {
        $content = "AI_PROVIDER=`"gemini`"`n" + $content
    }
    
    # Mettre à jour GEMINI_API_KEY
    if ($content -match 'GEMINI_API_KEY=') {
        $content = $content -replace 'GEMINI_API_KEY=".*"', "GEMINI_API_KEY=`"$apiKey`""
        $content = $content -replace "GEMINI_API_KEY='.*'", "GEMINI_API_KEY=`"$apiKey`""
        $content = $content -replace 'GEMINI_API_KEY=.*', "GEMINI_API_KEY=`"$apiKey`""
    } else {
        $content = $content -replace '(AI_PROVIDER=.*)', "`$1`nGEMINI_API_KEY=`"$apiKey`""
    }
    
    # Sauvegarder
    $content | Set-Content $envLocalPath -NoNewline
    
    Write-Host "✅ Configuration sauvegardée !" -ForegroundColor Green
} else {
    Write-Host "⚠️  Configuration manuelle nécessaire" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Éditez manuellement .env.local et ajoutez:" -ForegroundColor White
    Write-Host 'AI_PROVIDER="gemini"' -ForegroundColor Gray
    Write-Host 'GEMINI_API_KEY="votre_cle_api_ici"' -ForegroundColor Gray
}

Write-Host ""
Write-Host "🚀 Prochaines étapes:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Installer les dépendances:" -ForegroundColor White
Write-Host "   npm install" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Vérifier la configuration:" -ForegroundColor White
Write-Host "   npm run check:gemini" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Lancer l'application:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""

Write-Host "📚 Documentation complète: docs/guide-demarrage-gemini.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "✨ Configuration terminée !" -ForegroundColor Green
