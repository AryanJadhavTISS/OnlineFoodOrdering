require('dotenv').config();
const express = require('express');
const path = require('path');
const pool = require('./db');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use('/api/customers', require('./routes/customers'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/menu-items', require('./routes/menuItems'));
app.use('/api/orders', require('./routes/orders'));

app.get('/api/dashboard', async (req, res, next) => {
  try {
    const [[stats]] = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM Customers) AS customers,
        (SELECT COUNT(*) FROM Restaurants) AS restaurants,
        (SELECT COUNT(*) FROM MenuItems) AS menuItems,
        (SELECT COUNT(*) FROM Orders) AS orders,
        (SELECT COALESCE(SUM(total_amount), 0) FROM Orders WHERE status <> 'Cancelled') AS revenue
    `);
    const [recentOrders] = await pool.query(`
      SELECT o.order_id, c.name AS customer_name, r.name AS restaurant_name,
             o.order_date, o.total_amount, o.status
      FROM Orders o
      JOIN Customers c ON c.customer_id = o.customer_id
      JOIN (SELECT oi.order_id, MIN(mi.restaurant_id) AS restaurant_id
            FROM Order_items oi JOIN MenuItems mi ON mi.menu_item_id = oi.menu_item_id
            GROUP BY oi.order_id) order_restaurant ON order_restaurant.order_id = o.order_id
      JOIN Restaurants r ON r.restaurant_id = order_restaurant.restaurant_id
      ORDER BY o.order_date DESC LIMIT 6
    `);
    res.json({ stats, recentOrders });
  } catch (error) { next(error); }
});

app.get('/api/health', async (req, res) => {
  try { await pool.query('SELECT 1'); res.json({ database: 'connected' }); }
  catch (error) { res.status(503).json({ database: 'unavailable', message: error.message }); }
});

app.use((error, req, res, next) => {
  console.error(error);
  if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'That email address is already registered.' });
  if (error.code === 'ER_ROW_IS_REFERENCED_2') return res.status(409).json({ error: 'This record is still used by another record and cannot be deleted.' });
  if (error.code === 'ER_NO_REFERENCED_ROW_2') return res.status(400).json({ error: 'The selected related record does not exist.' });
  res.status(500).json({ error: 'A server error occurred. Check the server terminal for details.' });
});

const port = Number(process.env.PORT) || 3000;
app.listen(port, () => console.log(`Food Ordering app running at http://localhost:${port}`));
