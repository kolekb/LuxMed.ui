# LuxMedFe

Frontend Application 

This README contains information on how to set up and run the frontend Angular application.

## Requirements

Before starting, ensure you have the following installed:

- **Node.js** (v16.x or later)
- **npm** (comes with Node.js)
- Angular CLI (install globally using `npm install -g @angular/cli`)

## Development Setup

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd LuxMedFE
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Run the Development Server**

   Start the Angular development server:

   ```bash
   ng serve
   ```

   The application will be available at [http://localhost:4200](http://localhost:4200).

## Production Build

To build the application for production:

```bash
ng build --prod
```

The output files will be generated in the `dist/` directory.

## Authentication

The frontend application requires login credentials to access secured parts of the system. Use the following default credentials:

- **Username:** admin
- **Password:** admin123

Authentication is managed using cookies.

## Notes

- The backend API should be running on `http://localhost:5000` during development.
- Update the `proxy.conf.ts` file in `src` if the backend address differs.

---
