# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.4.0] - 2025-08-20

### Added
- Création d’un fichier de configuration `authConfig.ts` pour le store d’authentification.
  - Permet de définir la `baseURL` de l’API.
  - Permet de configurer les routes : `login`, `register`, `logout`, `fetchUser`, `refreshToken`.
- Modification du store `authStore` pour accepter une configuration dynamique.
- Export du store par défaut `useAuthStore` avec la config par défaut (`defaultAuthConfig`).
- Possibilité de créer plusieurs instances du store avec des configurations personnalisées.

### Changed
- Tous les appels Axios dans le store utilisent désormais la config importée (`baseURL` et `routes`).
- Le store `authStore` devient plus flexible et paramétrable sans modifier le code interne.

### Fixed
- N/A pour cette version.
