# Dicasa - Real Estate

![CI/CD](https://img.shields.io/badge/CI%2FCD-WIP-orange?style=for-the-badge)
![Framework](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Styling](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![UI Library](https://img.shields.io/badge/PrimeNG-2196F3?style=for-the-badge&logo=prime&logoColor=white)
![License](https://img.shields.io/github/license/jefjesuswt/dicasa-frontend?style=for-the-badge)

Modern web application for real estate property visualization, developed with Angular and Tailwind CSS.

## ✨ Features

- 📱 Responsive design that adapts to any device
- 🖼️ Interactive image gallery
- 🔍 Property search and filtering
- ⚡ Optimized for optimal performance
- 🎨 Modern and attractive user interface
- 🔐 Role-based access control (RBAC) for protected routes
- 👤 User authentication and profile management
- 📅 Appointment scheduling and management
- 🏠 Property management (CRUD operations)
- 👨‍💼 Agent and user management

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Bun (v1 or higher)
- Angular CLI (optional, you can use Bun)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jefjesuswt/dicasa-frontend.git
   cd dicasa-frontend
   ```

2. Install the dependencies:
   ```bash
   # Using Bun (recommended)
   bun install
   ```

3. Set up environment variables:
   Create a `.env` file in the root of the project with the following content:
   ```
   API_URL=http://localhost:3000/api
   ```

4. Start the development server:
   ```bash
   # Using Bun
   bun start
   ```

5. Open your browser and navigate to `http://localhost:4200/`

## 🛠️ Useful Commands

- **Start development server**: `bun start`
- **Build for production**: `bun build`
- **Run unit tests**: `bun test`
- **Lint the code**: `bun lint`

## 🏗️ Project Structure

```
src/
├── app/
│   ├── components/     # Reusable components
│   ├── pages/          # Application pages
│   ├── services/       # Services for data handling
│   ├── guards/         # Route guards
│   ├── interceptors/   # HTTP interceptors
│   ├── interfaces/     # TypeScript interfaces and types
│   └── enums/          # TypeScript enums
├── assets/             # Static resources (images, fonts, etc.)
└── environments/       # Environment configuration
```

## 🎨 Technologies Used

- [Angular](https://angular.io/) - Web application framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [PrimeNG](https://primeng.org/) - UI component library
- [TypeScript](https://www.typescriptlang.org/) - Typed language that compiles to JavaScript
- [RxJS](https://rxjs.dev/) - Library for reactive programming

## 📄 License

This project is under the MIT License - see the [LICENSE](LICENSE) file for more details.

---

Developed with ❤️ by [Jeffrey Jesús Jimenez Malave](https://github.com/jefjesuswt)