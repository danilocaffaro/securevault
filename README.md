# SecureVault

Secure credential capture service. Saves to macOS Keychain via a premium dark UI.

## Setup

```bash
npm install
npm run build
npm start  # port 8099
```

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/save` | POST | Save credential `{name, value}` |
| `/api/list` | GET | List saved credential names |
| `/api/health` | GET | Health check |

## Deploy (macOS launchd)

```bash
cp dev.melhor.securevault.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/dev.melhor.securevault.plist
```

## Access

Local: `http://localhost:8099`
External: `https://mac-mini-de-caffaros.tailce435c.ts.net`
