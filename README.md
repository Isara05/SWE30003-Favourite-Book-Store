# Online Bookstore System

## Project Information

This project is an Online Bookstore System developed for SWE30003 Software Architectures and Design, Assignment 3.

The system allows customers to browse books, create an account, add books to a cart, place orders, and complete a simulated payment process. It also includes staff and manager functions for maintaining the book catalogue, checking orders, managing payments, and reviewing customer-related information.

Group members:


## Development Environment

The application was developed and tested using the following environment:

| Item | Details |
| --- | --- |
| Operating System | Windows |
| IDE | Visual Studio Code |
| Programming Language | TypeScript / JavaScript |
| Frontend | Next.js, React, Ant Design |
| Backend | NestJS, Node.js |
| Authentication | JWT authentication with bcrypt password hashing |
| Database | Local JSON file storage in the backend `data` folder |

The frontend runs as a Next.js application, while the backend runs as a NestJS API server. The backend stores application data such as users, books, orders, invoices, payments, and trade-ins in JSON files.

## Installation Instructions

Before running the project, make sure the following software is installed:

- Node.js
- npm
- Visual Studio Code or another code editor

After downloading or cloning the project, open a terminal in the root project folder:

```bash
D:\isara\favoriteBooks-platform
```

Install all project dependencies:

```bash
npm install
```

This project uses npm workspaces, so the root install command installs the dependencies for both the frontend and backend.

## Database Setup

This project does not require MySQL, MongoDB, or any external database server.

The backend uses local JSON files as the data store. These files are located in:

```text
backend/data/
```

Main data files include:

- `books.json`
- `users.json`
- `orders.json`
- `payments.json`
- `invoices.json`
- `tradeins.json`

If a data file is missing, the backend storage service can recreate it with fallback data when needed.

## Environment Variables

The frontend connects to the backend API using this value:

```text
NEXT_PUBLIC_API_BASE=http://localhost:3001
```

If no environment variable is provided, the frontend already uses `http://localhost:3001` as the default backend API URL.

The backend runs on port `3001` by default. A different port can be used by setting:

```text
PORT=3001
```

For normal local testing, no extra environment file is required.

## Running the Application

The backend and frontend should be started in two separate terminals.

Start the backend API:

```bash
npm run dev:api
```

The backend will run at:

```text
http://localhost:3001
```

Start the frontend web application:

```bash
npm run dev:web
```

The frontend will run at:

```text
http://localhost:3000
```

After both servers are running, open the frontend URL in a browser and use the bookstore system from there.

## Implemented Business Areas

The project includes the following main business areas:

1. User Registration and Login

Customers can create accounts and log in to the system. Passwords are stored as hashed values, and authenticated users receive a JWT token for protected actions.

2. Book Search and Browse

Customers can browse the catalogue, view available books, and search or filter books from the frontend interface.

3. Shopping Cart and Checkout

Customers can add books to a cart and continue to the checkout process. Cart information is handled on the frontend and then submitted when the order is placed.

4. Order Processing

The system supports order creation and order tracking. Customer orders are stored in the backend data files and can be viewed through the profile/order screens.

5. Payment Processing

The project includes a payment gateway screen and backend payment handling. Payments are simulated for the purpose of the assignment.

6. Staff and Manager Management Functions

Staff and manager users can access management panels for books, orders, customers, payments, revenue, stocktaking, and trade-ins.

## Folder Structure

The main folders in the project are:

```text
favoriteBooks-platform/
├── backend/
│   ├── data/
│   │   ├── books.json
│   │   ├── invoices.json
│   │   ├── orders.json
│   │   ├── payments.json
│   │   ├── tradeins.json
│   │   └── users.json
│   ├── scripts/
│   │   └── promote-to-staff.js
│   ├── src/
│   │   ├── auth/
│   │   ├── catalog/
│   │   ├── customers/
│   │   ├── database/
│   │   ├── inventory/
│   │   ├── invoices/
│   │   ├── orders/
│   │   ├── payments/
│   │   └── staff/
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   └── package.json
├── package.json
└── package-lock.json
```

## Test Accounts

The project contains existing user records in `backend/data/users.json`. The passwords are stored as hashed values, so plain-text passwords are not available from the data file.

Existing sample emails in the data file include:

| Role | Email |
| --- | --- |
| Manager | `morgan@favoritebooks.com` |
| Customer | `liam@example.com` |

For testing as a customer, a new account can be created from the sign-up page.

To promote an existing customer account to staff or manager, use the backend script:

```bash
cd backend
node scripts/promote-to-staff.js user@example.com Manager
```

or:

```bash
cd backend
node scripts/promote-to-staff.js user@example.com Staff
```

## Assumptions and Limitations

The payment process is simulated. No actual bank, card, or online payment transaction is performed.

The project uses local JSON files instead of a production database. This is suitable for assignment demonstration and local testing, but it is not intended for a real production bookstore.

The application is designed to run locally with the frontend and backend on separate development servers.

Staff and manager accounts are managed through existing data or the promotion script rather than a full admin user creation workflow.

## Coding Standard Used

Coding Standard:

Airbnb JavaScript Style Guide  
https://github.com/airbnb/javascript

The project also uses ESLint and Prettier in the backend, together with the standard linting setup provided by Next.js on the frontend. These tools help keep the code readable and consistent.

## Known Issues

- Payment processing is only a simulation.
- The local JSON data store is simple and does not provide the same reliability as a full database system.
- Test account passwords should be confirmed by the development team before final submission, because only password hashes are visible in the current data files.

