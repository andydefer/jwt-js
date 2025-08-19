# ================================
# Makefile pour automatiser npm
# ================================

# Variables
PACKAGE_NAME = andydefer-jwt
NPM_REGISTRY = https://registry.npmjs.org/

# ================================
# Commandes principales
# ================================

# Nettoyer les dépendances et cache
clean:
	rm -rf node_modules package-lock.json
	npm cache clean --force
	@echo "✅ Nettoyage terminé."

# Installer les dépendances
install:
	npm install
	@echo "✅ Dépendances installées."

# Lancer les tests
test:
	npm test

# Build du package (si tu as un step build, sinon inutile)
build:
	npm run build || echo "ℹ️ Aucun build script défini."

# Vérifier la version publiée
check-version:
	@echo "📦 Version locale : `node -p "require('./package.json').version"`"
	@echo "🌍 Version publiée : `npm view $(PACKAGE_NAME) version`"

# Mettre à jour la version (patch, minor ou major)
version-patch:
	npm version patch

version-minor:
	npm version minor

version-major:
	npm version major

# Publier le package sur npm
publish: test build
	npm publish --access public --registry=$(NPM_REGISTRY)
	@echo "🚀 Publication réussie."

# Automatisation complète (tests + version patch + publication)
release-patch: clean install test build version-patch publish

release-minor: clean install test build version-minor publish

release-major: clean install test build version-major publish

# Aide
help:
	@echo ""
	@echo "📌 Commandes disponibles :"
	@echo "  make clean            -> Nettoyer node_modules et cache"
	@echo "  make install          -> Installer les dépendances"
	@echo "  make test             -> Lancer les tests"
	@echo "  make build            -> Compiler le package"
	@echo "  make check-version    -> Vérifier la version locale et distante"
	@echo "  make version-patch    -> Augmenter la version (patch)"
	@echo "  make version-minor    -> Augmenter la version (minor)"
	@echo "  make version-major    -> Augmenter la version (major)"
	@echo "  make publish          -> Publier sur npm"
	@echo "  make release-patch    -> Test + build + patch + publish"
	@echo "  make release-minor    -> Test + build + minor + publish"
	@echo "  make release-major    -> Test + build + major + publish"
	@echo ""
