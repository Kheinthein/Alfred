# Analyse des Conditions IF dans le Diagramme d'Activité

**Date :** 9 février 2026  
**Fichier analysé :** `test.svg`  
**Type de diagramme :** Diagramme d'activité PlantUML

---

## 🔍 ANALYSE DES CONDITIONS IF

### Conditions identifiées dans le diagramme

D'après l'analyse du SVG, voici les conditions `if` présentes :

1. **"Liste vide ?"** - Branche "oui" uniquement visible
2. **"Créer un document ?"** - Branche "oui" uniquement visible
3. **"Création échoue ?"** - Branche "oui" uniquement visible
4. **"Ouvrir un document existant ?"** - Branche "oui" uniquement visible
5. **"Réorganiser la liste ?"** - Branche "oui" uniquement visible
6. **"Échec enregistrement ?"** - Branche "oui" uniquement visible
7. **"Supprimer un document ?"** - Branches "oui" ET "non" visibles ✅
8. **"Sauvegarde échoue ?"** - Branches "oui" ET "non" visibles ✅

---

## ⚠️ PROBLÈMES IDENTIFIÉS

### Problème 1 : Branches "non" manquantes

**6 conditions sur 8 n'ont que la branche "oui" visible**, ce qui peut créer de la confusion :

- **"Liste vide ?"** : Seule la branche "oui" est visible (affiche "Aucun document")
- **"Créer un document ?"** : Seule la branche "oui" est visible
- **"Création échoue ?"** : Seule la branche "oui" est visible (affiche l'erreur)
- **"Ouvrir un document existant ?"** : Seule la branche "oui" est visible
- **"Réorganiser la liste ?"** : Seule la branche "oui" est visible
- **"Échec enregistrement ?"** : Seule la branche "oui" est visible (restaure l'ordre)

**Impact :** 
- Le lecteur ne voit pas explicitement ce qui se passe dans le cas "non"
- La continuité du flux n'est pas claire visuellement
- Les branches "non" existent probablement (flux continu) mais ne sont pas étiquetées

### Problème 2 : Fusion des branches "non" non explicite

Dans un diagramme d'activité standard, les branches "non" devraient :
- Soit être étiquetées explicitement avec "non"
- Soit fusionner avec le flux principal de manière visible

**Dans ce diagramme :** Les branches "non" semblent fusionner avec le flux principal sans étiquette, ce qui peut être acceptable mais moins clair.

---

## ✅ RECOMMANDATIONS

### Pour améliorer la lisibilité du diagramme

1. **Ajouter les étiquettes "non"** pour toutes les conditions qui n'en ont pas
2. **Faire converger visuellement** les branches "non" vers le flux principal
3. **Utiliser des couleurs différentes** (optionnel) pour distinguer les branches "oui" et "non"

### Exemple de correction pour PlantUML

```plantuml
if (Liste vide ?) then (oui)
  :Afficher un message "Aucun document";
else (non)
  :Continuer;
endif

if (Créer un document ?) then (oui)
  :Saisir titre + style;
  :Créer le document;
  if (Création échoue ?) then (oui)
    :Afficher l'erreur;
    stop
  else (non)
    :Ouvrir le document créé "/documents/[id]";
  endif
else (non)
  :Continuer vers les autres actions;
endif
```

---

## 📊 TABLEAU RÉCAPITULATIF

| Condition | Branche "oui" | Branche "non" | Statut |
|-----------|---------------|---------------|--------|
| Liste vide ? | ✅ Visible | ❌ Manquante | ⚠️ À améliorer |
| Créer un document ? | ✅ Visible | ❌ Manquante | ⚠️ À améliorer |
| Création échoue ? | ✅ Visible | ❌ Manquante | ⚠️ À améliorer |
| Ouvrir un document existant ? | ✅ Visible | ❌ Manquante | ⚠️ À améliorer |
| Réorganiser la liste ? | ✅ Visible | ❌ Manquante | ⚠️ À améliorer |
| Échec enregistrement ? | ✅ Visible | ❌ Manquante | ⚠️ À améliorer |
| Supprimer un document ? | ✅ Visible | ✅ Visible | ✅ Correct |
| Sauvegarde échoue ? | ✅ Visible | ✅ Visible | ✅ Correct |

---

## 🎯 CONCLUSION

**Les conditions `if` sont présentes visuellement** (losanges/diamants), mais **75% d'entre elles n'ont que la branche "oui" étiquetée**.

### ✅ Solution proposée

**Fichier corrigé créé :** `docs/diagramme-activite-documents-corrige.puml`

Ce fichier contient toutes les branches "non" explicites pour améliorer la lisibilité du diagramme.

### 📋 Modifications apportées

1. **"Liste vide ?"** : Ajout de `else (non) :Continuer;`
2. **"Créer un document ?"** : Ajout de `else (non) :Continuer vers les autres actions;`
3. **"Création échoue ?"** : Ajout de `else (non) :Ouvrir le document créé;`
4. **"Ouvrir un document existant ?"** : Ajout de `else (non) :Continuer;`
5. **"Réorganiser la liste ?"** : Ajout de `else (non) :Continuer;` et `else (non) :Ordre mis à jour avec succès;`
6. **"Échec enregistrement ?"** : Ajout de `else (non) :Ordre mis à jour avec succès;`
7. **"Supprimer un document ?"** : Ajout de `else (non) :Continuer;` (déjà avait "Confirmation" avec else)

### 🔄 Prochaines étapes

1. **Régénérer le SVG** à partir du fichier corrigé
2. **Remplacer** le fichier original si la version corrigée est validée
3. **Vérifier** que toutes les branches sont bien visibles dans le nouveau SVG

---

**Document généré le :** 9 février 2026  
**Fichier corrigé :** `diagramme-activite-documents-corrige.puml`
