# Stock Portfolio Dashboard Web App

This project is a **Stock Portfolio Dashboard** web application built with React and Material UI. It enables users to view, manage, and analyze their stock transactions through a clean, modern UI. The app integrates with a backend API to retrieve user transaction data from a PostgreSQL database and displays real-time market status, stock search functionality, and user portfolio insights.

## Table of Contents
- [Features](#features)
- [Installation and Setup](#installation-and-setup)
- [Available Scripts](#available-scripts)
- [Folder Structure](#folder-structure)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Technology Stack](#technology-stack)
- [License](#license)

## Features
- **User Portfolio Dashboard**: Displays a list of user-owned stocks with transaction details such as purchase date, price, and quantity.
- **Real-Time Market Status**: Shows whether the market is open or closed based on the current time.
- **Company Search with Auto-Completion**: Allows users to search for company stock symbols and view details for potential investments.
- **Responsive Design**: Built with Material UI for a cohesive, accessible, and responsive interface.
- **Background Customization**: Includes a full-screen background image with adjustable opacity for a rich, modern look.
  
## Installation and Setup

### Prerequisites
- **Node.js** and **npm** are required. You can download them [here](https://nodejs.org/).

### Steps
1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd your-project-directory
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**:
   Create a `.env` file in the root directory for any API keys or URLs:
   ```plaintext
   REACT_APP_API_BASE_URL=http://localhost:8000/api
   REACT_APP_AUTH_TOKEN_KEY=authToken
   ```
   - Replace `REACT_APP_API_BASE_URL` with the backend API base URL.
   - Replace `REACT_APP_AUTH_TOKEN_KEY` with the key used for storing the authentication token.

4. **Start the Development Server**:
   ```bash
   npm start
   ```
   - Open [http://localhost:3000](http://localhost:3000) to view the app in the browser.

## Available Scripts

In the project directory, you can run:

### `npm start`
Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm test`
Launches the test runner in interactive watch mode.

### `npm run build`
Builds the app for production in the `build` folder. Optimizes the build for the best performance.

### `npm run eject`
Ejects the app, providing full control over the build configuration. This is a one-way operation.

## Folder Structure

```
.
├── public                   # Public assets
├── src                      # Source code
│   ├── components           # Reusable components
│   ├── services             # API calls and external services
│   ├── shared_theme         # Custom Material UI theme and styles
│   ├── App.tsx              # Main application component
│   └── index.tsx            # Entry point
├── .env                     # Environment variables
└── README.md                # Project documentation
```

## Environment Variables

| Variable                   | Description                                  |
|----------------------------|----------------------------------------------|
| `REACT_APP_API_BASE_URL`   | Base URL for the backend API                |
| `REACT_APP_AUTH_TOKEN_KEY` | Key used to store the authentication token   |

## Usage
1. **User Authentication**: Once authenticated, the app retrieves a token stored in local storage under `REACT_APP_AUTH_TOKEN_KEY`.
2. **Viewing Portfolio**: The portfolio displays user transactions, including stock symbol, purchase price, and date.
3. **Stock Search**: Users can search by symbol to view stock options.
4. **Real-Time Market Updates**: The app automatically updates the market status and transaction data.

## Technology Stack
- **Frontend**: React, Material UI, TypeScript
- **Backend (Assumed)**: Django REST Framework, PostgreSQL (handled by backend team)
- **API Integration**: Axios for API calls



---