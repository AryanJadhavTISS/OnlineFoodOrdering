const express = require('express');
const pool = require('../db');
const router = express.Router();
const statuses = ['Pending', 'Confirmed', 'Preparing', 'Delivered', 'Cancelled'];

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`SELECT o.order_id,c.name AS customer_name,c.email AS customer_email,
      c.phone AS customer_phone,r.name AS restaurant_name,o.order_date,o.total_amount,o.status,
      GROUP_CONCAT(CONCAT(mi.name,' × ',oi.quantity) ORDER BY oi.order_item_id SEPARATOR ', ') AS ordered_items
      FROM Orders o JOIN Customers c ON c.customer_id=o.customer_id
      JOIN Order_items oi ON oi.order_id=o.order_id JOIN MenuItems mi ON mi.menu_item_id=oi.menu_item_id
      JOIN Restaurants r ON r.restaurant_id=mi.restaurant_id
      GROUP BY o.order_id,c.customer_id,r.restaurant_id ORDER BY o.order_date DESC`);
    res.json(rows);
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const [[order]] = await pool.query(`SELECT o.order_id,o.order_date,o.total_amount,o.status,
      c.customer_id,c.name AS customer_name,c.email AS customer_email,c.phone AS customer_phone,c.full_address AS customer_address,
      r.restaurant_id,r.name AS restaurant_name,r.email AS restaurant_email,r.phone AS restaurant_phone,r.full_address AS restaurant_location
      FROM Orders o JOIN Customers c ON c.customer_id=o.customer_id
      JOIN Order_items oi ON oi.order_id=o.order_id JOIN MenuItems mi ON mi.menu_item_id=oi.menu_item_id
      JOIN Restaurants r ON r.restaurant_id=mi.restaurant_id WHERE o.order_id=?
      GROUP BY o.order_id,c.customer_id,r.restaurant_id`, [req.params.id]);
    if (!order) return res.status(404).json({ error: 'Order not found.' });
    const [items] = await pool.query(`SELECT mi.name AS item_name,oi.quantity,oi.price AS unit_price,
      (oi.quantity * oi.price) AS subtotal FROM Order_items oi JOIN MenuItems mi ON mi.menu_item_id=oi.menu_item_id
      WHERE oi.order_id=? ORDER BY oi.order_item_id`, [req.params.id]);
    res.json({ ...order, items });
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  const customerId = Number(req.body.customer_id);
  const restaurantId = Number(req.body.restaurant_id);
  const items = req.body.items;
  if (!Number.isInteger(customerId) || customerId < 1 || !Number.isInteger(restaurantId) || restaurantId < 1 ||
      !Array.isArray(items) || !items.length || items.some(item => !Number.isInteger(Number(item.item_id)) ||
      Number(item.item_id) < 1 || !Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1 || Number(item.quantity) > 99)) {
    return res.status(400).json({ error: 'Choose a customer, restaurant and at least one item with a quantity from 1 to 99.' });
  }

  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [menuRows] = await connection.query(`SELECT menu_item_id,restaurant_id,price,is_available
      FROM MenuItems WHERE menu_item_id IN (${items.map(() => '?').join(',')}) FOR UPDATE`, items.map(item => Number(item.item_id)));
    if (menuRows.length !== items.length || menuRows.some(item => item.restaurant_id !== restaurantId || !item.is_available)) {
      await connection.rollback();
      return res.status(400).json({ error: 'One or more selected items are unavailable or belong to a different restaurant.' });
    }
    const priceById = new Map(menuRows.map(item => [item.menu_item_id, Number(item.price)]));
    const total = items.reduce((sum, item) => sum + priceById.get(Number(item.item_id)) * Number(item.quantity), 0);
    const [orderResult] = await connection.query(`INSERT INTO Orders (restaurant_id,customer_id,total_amount,status)
      VALUES (?,?,?,'Pending')`, [restaurantId, customerId, total]);
    for (const item of items) {
      await connection.query('INSERT INTO Order_items (order_id,menu_item_id,quantity,price) VALUES (?,?,?,?)',
        [orderResult.insertId, Number(item.item_id), Number(item.quantity), priceById.get(Number(item.item_id))]);
    }
    await connection.commit();
    res.status(201).json({ order_id: orderResult.insertId, total_amount: total, message: 'Order placed.' });
  } catch (error) {
    if (connection) await connection.rollback();
    next(error);
  } finally { if (connection) connection.release(); }
});

router.put('/:id/status', async (req, res, next) => {
  if (!statuses.includes(req.body.status)) return res.status(400).json({ error: `Status must be one of: ${statuses.join(', ')}.` });
  try {
    const [result] = await pool.query('UPDATE Orders SET status=? WHERE order_id=?', [req.body.status, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Order not found.' });
    res.json({ message: 'Order status updated.' });
  } catch (error) { next(error); }
});
module.exports = router;
