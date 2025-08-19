# ================================
# Makefile complet : npm + GitHub
# ================================

# Variables
PACKAGE_NAME = andydefer-jwt
NPM_REGISTRY = https://registry.npmjs.org/
REPO_URL = https://github.com/andydefer/jwt-js.git
BRANCH   = main
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
	# Initialiser Git si nécessaire
	if [ ! -d ".git" ]; then \
		echo "📌 Initialisation du repo Git..."; \
		git init; \
		git branch -M $(BRANCH); \
		git remote add origin $(REPO_URL); \
	fi; \
	# Commit des changements si présents
	if [ -n "$$(git status --porcelain)" ]; then \
		echo "📌 Commit des changements..."; \
		git add .; \
		git commit -m '$(COMMIT_MSG)'; \
	else \
		echo "⚠️ Aucun changement à committer"; \
	fi; \
	# Pousser la branche
	echo "📌 Push de la branche $(BRANCH)..."; \
	git push -u origin $(BRANCH) || echo "⚠️ Pousser échoué (branche peut déjà exister)"; \
	# Vérifier que le repo est clean avant npm version
	if [ -n "$$(git status --porcelain)" ]; then \
		echo "❌ Le repo Git n'est pas clean, commit ou stash vos changements avant npm version"; \
		exit 1; \
	fi; \
	# Mettre à jour la version
	echo "📌 Mise à jour de la version ($$TYPE)..."; \
	npm version $$TYPE; \
	# Publier sur npm
	echo "📌 Publication sur npm..."; \
	npm publish --access public --registry=$(NPM_REGISTRY); \
	# Créer et push le tag
	VERSION=`node -p "require('./package.json').version"`; \
	echo "📌 Création et push du tag $$VERSION..."; \
	git tag -a $$VERSION -m "Release $$VERSION"; \
	git push origin $$VERSION; \
	echo "✅ Release complète terminée (version $$VERSION)"

# ================================
# Help automatique
# ================================
help: ## Afficher l'aide
	@echo "📌 Commandes disponibles :"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| sort \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  %-30s -> %s\n", $$1, $$2}'
