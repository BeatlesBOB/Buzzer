# Buzzer

Buzzer de quiz multi-équipes en temps réel : un admin crée une partie, les joueurs rejoignent via QR code et le premier qui buzze prend la main.

## Lancer en local

```bash
cd back && cp .env.example .env && npm install && npm run dev    # http://localhost:3000
cd front && cp .env.example .env && npm install && npm run dev   # http://localhost:5173
```

Tests et vérifications :

```bash
cd back && npm run typecheck && npm test
cd front && npm run lint && npm run build
```

## Architecture

```
shared/protocol.d.ts   contrat socket.io typé (événements, DTO publics, codes d'erreur) importé par le front et le back
back/src/
  game/                domaine sans I/O : transitions de la partie (room.ts) — c'est ici que se règle "qui a buzzé"
  store.ts             rooms et sessions en mémoire (token secret -> identité)
  socket/game.ts       adaptateur socket.io : auth par session, validation, rate limit, timers, broadcast
  app.ts / index.ts    création du serveur / bootstrap
back/test/             tests du domaine + tests socket.io de bout en bout (buzz simultanés, sécurité)
front/src/
  contexts/GameContext.tsx  seul endroit qui écoute l'état serveur (room:state) et gère la reprise de session
  lib/socket.ts             socket typé + request() (action -> réponse ack)
  pages/                    lisent le contexte et envoient des actions
```

### Déroulé d'une partie

`lobby` → **Lancer la partie** → `open` → un joueur buzze → `locked` → l'admin juge :

- **Bonne réponse** : +1 point, buzzer fermé (`paused`) pour lire la question suivante ;
- **Mauvaise réponse** : l'équipe est bloquée pour la question, buzzer rouvert pour les autres ;
- sans action de l'admin, le buzzer se rouvre après `ANSWER_TIMEOUT_MS`.

Le verrou est **par room** : une fois qu'un joueur a buzzé, plus personne ne peut buzzer jusqu'à la réouverture.
Appuyer quand le buzzer est fermé est un **faux départ** : pénalité de `FALSE_START_PENALTY_MS`, prolongée à chaque appui — spammer ne sert qu'à rester bloqué.

### Identité

À la création d'une room ou l'entrée dans une équipe, le serveur renvoie un **token secret** (gardé en `sessionStorage`) qui sert à se reconnecter. Il n'est jamais diffusé : l'état envoyé à tous (`PublicRoom`) ne contient que des ids publics.

## Déploiement

Le back est un serveur socket.io **avec état en mémoire** : il lui faut un process Node persistant et **une seule instance** (Render, Railway, Fly.io, VPS…). Une plateforme serverless (Vercel Functions) ne convient pas : pas de WebSocket persistant et plusieurs instances qui ne partagent pas les rooms.
Pour plusieurs instances, il faudrait déplacer l'état dans Redis et utiliser l'adapter Redis de socket.io.

Le front importe des types depuis `shared/` : en déploiement Vercel avec `front` comme Root Directory, garder l'option « Include files outside the root directory » activée.
