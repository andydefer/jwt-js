# ================================
# Makefile complet : npm + GitHub
# ================================

# Variables
PACKAGE_NAME = andydefer-jwt
NPM_REGISTRY = https://registry.npmjs.org/
REPO_URL = https://github.com/andydefer/jwt-js.git
BRANCH   = master
COMMIT_MSG ?= Update project

# ================================
# Commandes npm
# ================================

clean: ## Nettoyer node_modules et cache
	rm -rf node_modules package-lock.json
	npm cache clean --force
	@echo "✅ Nettoyage terminé."

install: ## Installer les dépendances
	npm install
	@echo "✅ Dépendances installées."

test: ## Lancer les tests
	npm test

build: ## Compiler le package
	npm run build || echo "ℹ️ Aucun build script défini."

check-version: ## Vérifier la version locale et distante
	@echo "📦 Version locale : `node -p "require('./package.json').version"`"
	@echo "🌍 Version publiée : `npm view $(PACKAGE_NAME) version`"

version-patch: ## Augmenter la version (patch)
	npm version patch

version-minor: ## Augmenter la version (minor)
	npm version minor

version-major: ## Augmenter la version (major)
	npm version major

publish: test build ## Publier le package sur npm
	npm publish --access public --registry=$(NPM_REGISTRY)
	@echo "🚀 Publication réussie."

release-patch: clean install test build version-patch publish ## Release complète (patch)
release-minor: clean install test build version-minor publish ## Release complète (minor)
release-major: clean install test build version-major publish ## Release complète (major)

# ================================
# Commandes GitHub / Git
# ================================

init-github: ## Initialiser le repo local et pousser sur GitHub
	git init
	git add .
	git commit -m 'Initial commit'
	git branch -M $(BRANCH)
	git remote add origin $(REPO_URL)
	git push -u origin $(BRANCH)

push: ## Ajouter tous les changements, commit et push
	git add .
	git commit -m '$(COMMIT_MSG)'
	git push origin $(BRANCH)

tag: ## Créer un tag de version et pousser (usage: make tag VERSION=x.y.z)
	@git tag -a $(VERSION) -m "Release $(VERSION)"
	git push origin $(VERSION)

update-docs: ## Mettre à jour la documentation et push
	git add README.md Makefile.md
	git commit -m 'Update documentation'
	git push origin $(BRANCH)

feature: ## Créer une nouvelle branche feature (usage: make feature NAME=branch-name)
	git checkout -b $(NAME)

# ================================
# Release interactif
# ================================

release-interactive: ## Commit + push GitHub + version (patch/minor/major) + publish npm + tag
	@read -p "Quel type de version ? (patch, minor, major) : " TYPE; \
	if [ "$$TYPE" != "patch" ] && [ "$$TYPE" != "minor" ] && [ "$$TYPE" != "major" ]; then \
		echo "❌ Type invalide !"; exit 1; \
	fi; \
	BRANCH_CUR=$$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "$(BRANCH)"); \
	if [ ! -d ".git" ]; then \
		echo "📌 Initialisation du repo Git..."; \
		git init; \
		git branch -M $$BRANCH_CUR; \
		git remote add origin $(REPO_URL); \
	fi; \
	if [ -n "$$(git status --porcelain)" ]; then \
		echo "📌 Commit des changements..."; \
		git add .; \
		git commit -m "$(COMMIT_MSG)"; \
	else \
		echo "⚠️ Aucun changement à committer"; \
	fi; \
	if [ -n "$$(git status --porcelain)" ]; then \
		echo "❌ Le repo n'est pas clean. Commit ou stash vos changements."; exit 1; \
	fi; \
	LATEST=$$(npm view $(PACKAGE_NAME) version 2>/dev/null || echo "0.0.0"); \
	echo "📦 Dernière version publiée : $$LATEST"; \
	NEW_VER=$$(npm version $$TYPE --no-git-tag-version | sed 's/^v//'); \
	echo "📦 Nouvelle version locale : $$NEW_VER"; \
	git add package.json package-lock.json; \
	git commit -m "Release $$NEW_VER"; \
	if git rev-parse "refs/tags/$$NEW_VER" >/dev/null 2>&1; then \
		echo "⚠️ Tag $$NEW_VER existe déjà, utilisation de -f pour forcer"; \
		git tag -f -a $$NEW_VER -m "Release $$NEW_VER"; \
	else \
		git tag -a $$NEW_VER -m "Release $$NEW_VER"; \
	fi; \
	echo "📌 Push de la branche et du tag..."; \
	git push origin $$BRANCH_CUR; \
	git push origin $$NEW_VER --force; \
	if [ "$$LATEST" != "$$NEW_VER" ]; then \
		echo "📌 Publication sur npm..."; \
		npm publish --access public --registry=$(NPM_REGISTRY); \
	else \
		echo "⚠️ Version $$NEW_VER déjà publiée sur npm, publication ignorée"; \
	fi; \
	echo "✅ Release complète terminée (version $$NEW_VER)"

# ================================
# Help automatique
# ================================
help: ## Afficher l'aide
	@echo "📌 Commandes disponibles :"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| sort \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  %-30s -> %s\n", $$1, $$2}'
