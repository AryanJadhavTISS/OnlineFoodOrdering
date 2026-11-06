# Online Food Ordering Management

A small restaurant ordering dashboard for a DBMS assignment. The browser uses plain HTML, CSS and JavaScript; Express exposes REST routes; and the application reads and writes relational data with parameterized MySQL queries.

## Technologies

- HTML5, CSS3 and vanilla JavaScript
- Node.js and Express
- MySQL with the `mysql2` promise interface

## Project structure

```text
Food Ordering/
├── backend/
│   ├── db.js
│   ├── server.js
│   ├── routes/
│   │   ├── customers.js
│   │   ├── restaurants.js
│   │   ├── menuItems.js
│   │   └── orders.js
│   └── db/                 # Your original SQL files, preserved
├── database/
│   └── database.sql        # Schema, sample records and commented examples
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── .env.example
├── .gitignore
└── package.json
```

## Database setup

The app uses your existing `OnlineFoodOrdering` database design. The original files in `backend/db/` are preserved. In your schema, customers and restaurants have separate city/state/address fields; menu items are named `menu_item_id` and `name`; and order lines are in `Order_items` with a captured unit `price`. `Orders` also has a `restaurant_id` column. The application keeps this schema intact. The displayed restaurant is looked up through the ordered menu items, and the order form keeps all items in one selected restaurant. Line subtotals are computed as `quantity * price`.

For a fresh database, start your MySQL server, then from the project directory run:

```bash
mysql -u root -p < database/database.sql
```

Enter your MySQL password at the prompt. The SQL file creates the database and tables and inserts demonstration records. Run it once on a clean database: the sample inserts intentionally demonstrate ordinary `INSERT` statements and are not designed to be run repeatedly.

If you installed MySQL with Homebrew and it is not running, start it with:

```bash
brew services start mysql
```

If you use a different MySQL username, replace `root` in the import command. You can also paste the statements into MySQL Workbench and run them there.

## Configure the application

Make a local environment file from the example:

```bash
cp .env.example .env
```

Open `.env` and set `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, and (optionally) `PORT` to match your local MySQL setup. For example:

```text
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_actual_password
DB_NAME=OnlineFoodOrdering
PORT=3000
```

Keep `.env` private. It is excluded by `.gitignore`; do not commit your real password.

## Install and run

From the project folder in macOS Terminal:

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The Express server serves the frontend and the API from the same address. Stop the server with `Control-C`.

For automatic server restarts while editing, use `npm run dev` instead of `npm start`.

## Features

- Dashboard totals and recent orders are queried from MySQL. Revenue excludes cancelled orders.
- Customer records can be added, searched, edited and deleted.
- Restaurant records can be added, edited and deleted.
- Menu items can be added, edited, filtered by restaurant, deleted and marked available/unavailable.
- The order form loads customers, restaurants and menu items from the API, calculates a preview, and submits item IDs and quantities.
- When placing an order, the server reads prices from MySQL, inserts the order and all order lines in one transaction, then commits. A failure rolls the transaction back.
- Order history and details use JOIN queries. Details show customer and restaurant contact information, each line subtotal and the order total. Status can be set to Pending, Confirmed, Preparing, Delivered or Cancelled.

The existing foreign keys prevent deleting customers, restaurants or menu items that are referenced by orders. The app displays the database error as a helpful message instead of bypassing referential integrity.

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| GET, POST | `/api/customers` | Search/list customers or add one |
| PUT, DELETE | `/api/customers/:id` | Edit or delete a customer |
| GET, POST | `/api/restaurants` | List or add restaurants |
| PUT, DELETE | `/api/restaurants/:id` | Edit or delete a restaurant |
| GET, POST | `/api/menu-items` | List (optionally by restaurant) or add items |
| PUT, DELETE | `/api/menu-items/:id` | Edit or delete a menu item |
| GET | `/api/orders` | List orders and joined item names |
| GET | `/api/orders/:id` | Read one order and its line items |
| POST | `/api/orders` | Place an order with a database transaction |
| PUT | `/api/orders/:id/status` | Update an order status |
| GET | `/api/dashboard` | Read summary totals and recent orders |
| GET | `/api/health` | Check MySQL connectivity |

## SQL learning examples

`database/database.sql` ends with commented examples: five SELECT queries, three JOIN examples, and aggregate queries using `COUNT()`, `SUM()` and `GROUP BY`. Your original `backend/db/queries.sql` and `backend/db/joins.sql` remain available too.

## Manual checks if MySQL is not configured

If `/api/health` shows “Database unavailable,” check that MySQL is running, import the SQL file, and compare `.env` values with your MySQL account. Then restart `npm start` and reload the page. The dashboard and tables require a reachable database and do not substitute fake records.
