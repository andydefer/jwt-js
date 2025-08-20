# andydefer-jwt

Une solution de **gestion d’authentification JWT** pour React avec **Zustand** et **Inertia.js**, incluant :

* Login / Logout / Register
* Gestion du token JWT et clé publique
* Initialisation automatique à partir de la session
* Vérification de signature
* Stockage persistant côté client (localStorage)
* Configuration dynamique de l’API et des routes

> ⚠️ Ce package est conçu pour fonctionner **en tandem avec le package Laravel `andydefer/jwt`**, qui fournit l’API JWT côté serveur.

---

## 🚀 Installation

```bash
npm install andydefer-jwt
```

ou

```bash
yarn add andydefer-jwt
```

---

## ⚙️ Usage

### 1️⃣ Hook principal `useAuth`

```ts
import { useAuth } from 'andydefer-jwt';

const MyComponent = () => {
  const { user, isAuthenticated, login, logout, register, isLoading, error } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Bienvenue, {user?.name}</p>
          <button onClick={logout}>Se déconnecter</button>
        </div>
      ) : (
        <div>
          <button onClick={() => login('email@example.com', 'password')}>Se connecter</button>
        </div>
      )}
      {isLoading && <p>Chargement...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};
```

---

### 2️⃣ Store `useAuthStore`

Pour accéder directement aux fonctionnalités avancées ou créer des hooks personnalisés :

```ts
import { useAuthStore } from 'andydefer-jwt';

// Configurer le store avec une API personnalisée et routes
import { createAuthStore } from 'andydefer-jwt';
const customAuthStore = createAuthStore({
  baseURL: 'https://api.example.com',
  routes: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    fetchUser: '/auth/me',
    refreshToken: '/auth/refresh',
  },
});

const token = customAuthStore(state => state.token);
const login = customAuthStore(state => state.login);

login('email@example.com', 'password');
```

---

## 📝 API

### `useAuth()`

| Nom                                          | Type                  | Description                           |
| -------------------------------------------- | --------------------- | ------------------------------------- |
| `isAuthenticated`                            | `boolean`             | Indique si l’utilisateur est connecté |
| `user`                                       | `User \| null`        | Objet utilisateur courant             |
| `isLoading`                                  | `boolean`             | Indique que l’action est en cours     |
| `error`                                      | `string \| null`      | Message d’erreur si échec             |
| `login(email, password, deviceId?)`          | `() => Promise<void>` | Connecte un utilisateur               |
| `logout()`                                   | `() => Promise<void>` | Déconnecte l’utilisateur              |
| `register(name, email, password, deviceId?)` | `() => Promise<void>` | Enregistre un nouvel utilisateur      |

### `useAuthStore()`

| Nom                                          | Type                  | Description                           |
| -------------------------------------------- | --------------------- | ------------------------------------- |
| `token`                                      | `string \| null`      | Token JWT actuel                      |
| `user`                                       | `User \| null`        | Utilisateur courant                   |
| `isLoading`                                  | `boolean`             | Indicateur de chargement              |
| `error`                                      | `string \| null`      | Message d’erreur                      |
| `isInitialized`                              | `boolean`             | Indique si le store a été initialisé  |
| `initialize()`                               | `() => Promise<void>` | Initialise le store depuis la session |
| `login(email, password, deviceId?)`          | `() => Promise<void>` | Connexion                             |
| `register(name, email, password, deviceId?)` | `() => Promise<void>` | Inscription                           |
| `logout()`                                   | `() => void`          | Déconnexion                           |
| `fetchUser()`                                | `() => Promise<void>` | Récupère l’utilisateur depuis l’API   |
| `refreshToken()`                             | `() => Promise<void>` | Rafraîchit le token JWT               |
| `config`                                     | `AuthConfig`          | Contient `baseURL` et `routes`        |

---

## 🔧 Configuration dynamique (`authConfig.ts`)

Exemple de configuration personnalisée :

```ts
export const myAuthConfig = {
  baseURL: 'https://api.example.com',
  routes: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    fetchUser: '/auth/me',
    refreshToken: '/auth/refresh',
  },
};
```

Puis créer le store avec cette config :

```ts
import { createAuthStore } from 'andydefer-jwt';
import { myAuthConfig } from './authConfig';

export const useAuthStore = createAuthStore(myAuthConfig);
```

---

## 🔒 Stockage persistant

Le token et l’utilisateur sont stockés via **Zustand Persist** dans `localStorage` sous le nom :

```
jwt-auth-storage
```

---

## 🧩 Intégration backend Laravel

```bash
composer require andydefer/jwt
php artisan migrate
php artisan vendor:publish --provider="AndyDefer\Jwt\JwtAuthServiceProvider" --tag="routes"
```

---

## 🛠 Workflow complet avec Makefile

```bash
make install
make test
make build
make version-minor
make publish
make release-interactive
```

---

## 🧪 Tests

```bash
npm test
```

---

## 💡 Bonnes pratiques

* Vérifier `isAuthenticated` avant de rendre des contenus protégés.
* Utiliser `error` pour afficher les messages d’erreur.
* Ne jamais exposer directement le `token`.
* Synchroniser le front-end avec le backend Laravel.
