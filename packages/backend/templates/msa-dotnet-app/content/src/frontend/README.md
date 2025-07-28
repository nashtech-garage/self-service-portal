## Asset Management Frontend

A modern, scalable React + TypeScript + Vite project for asset management, following best practices in architecture, state management, and code quality.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher) or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd AssetManagement-2025-DN/frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn
```

### Development

To start the development server:
```bash
npm run dev
# or
yarn dev
```
The application will be available at `http://localhost:xxxx`

### Building for Production

To create a production build:
```bash
npm run build
# or
yarn build
```

To preview the production build:
```bash
npm run preview
# or
yarn preview
```

## 🛠 Tech Stack

- **Framework:** React 19
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** 
  - SCSS
  - PrimeFlex
  - PrimeReact UI Components
- **State Management:** 
  - Redux Toolkit
  - React Query
- **Routing:** React Router DOM v7
- **HTTP Client:** Axios
- **Form Validation:** 
  - Yup
  - Zod
- **Development Tools:**
  - ESLint
  - TypeScript Configuration
  - SASS

## 📁 Folder structure
```
src/
├── public/         # Static assets (images, fonts, etc.)
├── components/     # Reusable UI components
│   ├── common/     # Common/shared components (Button, Toast, etc.)
│   ├── layouts/    # Layout components
│   └── Toast/      # Toast notification components
├── config/         # App configuration (env variables, etc.)
├── constants/      # Constant values
├── css/           # Global styles and theme configuration
├── data/          # Mock data for development
├── hooks/         # Custom React hooks
├── pages/         # Page components (Login, Dashboard, etc.)
├── routes/        # App routing
├── services/      # API service layer
├── store/         # Redux store, slices, and types
├── types/         # TypeScript type definitions
├── utils/         # Utility/helper functions
└── main.tsx       # App entry point
```

### Adding New Folders
When adding a new folder to the project:

1. Create the folder in `src/`
2. Add the corresponding alias in both [`vite.config.ts`](./vite.config.ts) and [`tsconfig.json`](./tsconfig.json)
3. Use the alias in imports:
```typescript
// Instead of
import { something } from '../../../components/Something';

// Use
import { something } from '@components/Something';
```

### Environment Variables
To add new environment variables:

1. Create or modify `.env` file:
```env
VITE_API_URL=your_api_url_here
VITE_APP_TITLE=Your App Title
```

2. Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

Note: All environment variables must be prefixed with `VITE_` to be exposed to the client-side code.

## 🔑 Key Features

- Modern React with TypeScript
- Component-based architecture
- Responsive design with PrimeFlex and PrimeReact
- Global state management with Redux Toolkit
- Server state management with React Query
- Type-safe development with TypeScript
- Form validation using Yup and Zod
- Toast notifications
- Error boundary implementation
- Loading states management
- Interceptor-based API communication

## 🔧 Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_API_URL=your_api_url_here
```

## 💡 Best Practices

- Use TypeScript for type safety
- Follow the component structure in `/components`
- Implement error boundaries for error handling
- Use React Query for server state management
- Implement loading states using the `useLoading` hook
- Use environment variables for configuration
- Follow the established folder structure
- Use PrimeReact components for consistent UI
- Implement proper error handling using the error boundary
- Use Redux for global state management
- Follow SCSS naming conventions

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request