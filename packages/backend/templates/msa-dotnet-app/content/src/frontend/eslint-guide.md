# 🔧 ESLint + Prettier Setup Guide (for TypeScript + React projects)

This project comes pre-configured with ESLint + Prettier to ensure clean, readable, and consistent code.

## 1. File configs structure

```
project-root/
├── src/
├──eslint.config.ts      ✅ Config ESLint + Prettier (modern format)
├── tsconfig.json
```

## 2. Config [eslint.config.ts](./eslint.config.js)

## 3. Config [tsconfig.eslint.json](./tsconfig.eslint.json)

## 4. Script in [package.json](./package.json)

```
"scripts": {
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write ."
  },
```

## 💡 Tips
### You should install ESLint and Prettier extensions in VS Code.
### Enable format on save in VS Code:

**File → Preferences → Settings**

**Find Format On Save → enable.**

**Make sure the .vscode/settings.json file (Open by Ctrl+Shift+P => Preferences: Open Workspace Settings (JSON)) has:**
```
{
  "editor.codeActionsOnSave": {
    "source.fixAll": true,                
    "source.fixAll.eslint": true,
  },

  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,          

  "eslint.validate": [
    "javascript",
    "typescript",
    "typescriptreact"
  ]
}

```

## Run the following command to check error format in 

```bash
# Use lint to check error for all of files in project
npm run lint
```
