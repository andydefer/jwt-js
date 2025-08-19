# 📘 Documentation du Makefile – `andydefer-jwt`

Ce **Makefile** est conçu pour automatiser les tâches liées au développement, au test et à la publication du package **npm `andydefer-jwt`**.
Il permet de simplifier les commandes répétitives et de garantir une cohérence dans le workflow.

---

## ⚙️ Commandes disponibles

### 🔹 Installation des dépendances

```bash
make install
```

Installe toutes les dépendances du projet (équivalent à `npm install`).

---

### 🔹 Lancer les tests

```bash
make test
```

Exécute la suite de tests avec **Jest** pour s’assurer que le package fonctionne correctement.

---

### 🔹 Linting du code

```bash
make lint
```

Lance l’analyse statique avec **ESLint** pour vérifier la qualité et le style du code.

---

### 🔹 Build du package

```bash
make build
```

Construit le package avant publication (équivalent à `npm run build`).
👉 Assure-toi que le code source est compilé/transpilé correctement.

---

### 🔹 Incrémenter la version

#### Patch (corrections mineures)

```bash
make version-patch
```

#### Minor (nouvelles fonctionnalités sans breaking changes)

```bash
make version-minor
```

#### Major (changements incompatibles / breaking changes)

```bash
make version-major
```

Ces commandes mettent à jour la version dans `package.json`.

---

### 🔹 Publication sur npm

```bash
make publish
```

Publie le package sur **npm**.
⚠️ Nécessite d’être connecté (`npm login`) et d’avoir les droits sur le package.

---

### 🔹 Nettoyage

```bash
make clean
```

Supprime les dossiers et fichiers générés (`node_modules`, `dist`, etc.) pour repartir d’un environnement propre.

---

## 🚀 Workflow recommandé

1. **Installer les dépendances**

   ```bash
   make install
   ```
2. **Développer et tester**

   ```bash
   make test
   make lint
   ```
3. **Builder le package**

   ```bash
   make build
   ```
4. **Mettre à jour la version**

   ```bash
   make version-patch   # ou version-minor / version-major
   ```
5. **Publier sur npm**

   ```bash
   make publish
   ```

---

## ✅ Bonnes pratiques

* Toujours lancer `make test` avant un `make publish`.
* Ne jamais publier sans incrémenter la version (`make version-*`).
* Utiliser `make clean` avant un build final pour éviter les artefacts.
* Automatiser ce workflow via un **CI/CD** (GitHub Actions, GitLab CI, etc.) pour fiabiliser le process.
