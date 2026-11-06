const express = require('express');
const pool = require('../db');
const router = express.Router();
const valid = (b) => typeof b.item_name === 'string' && b.item_name.trim() && Number.isInteger(Number(b.restaurant_id)) &&
  Number(b.restaurant_id) > 0 && Number.isFinite(Number(b.price)) && Number(b.price) > 0 &&
  typeof b.category === 'string' && b.category.trim();

router.get('/', async (req, res, next) => {
  try {
    let sql = `SELECT m.menu_item_id AS item_id,m.restaurant_id,m.name AS item_name,m.description,m.price,m.category,
      m.is_available AS availability,r.name AS restaurant_name FROM MenuItems m JOIN Restaurants r ON r.restaurant_id=m.restaurant_id`;
    const values = [];
    if (req.query.restaurant_id) { sql += ' WHERE m.restaurant_id=?'; values.push(req.query.restaurant_id); }
    sql += ' ORDER BY m.menu_item_id DESC';
    const [rows] = await pool.query(sql, values);
    res.json(rows);
  } catch (error) { next(error); }
});
router.post('/', async (req, res, next) => {
  if (!valid(req.body)) return res.status(400).json({ error: 'Enter an item name, restaurant, positive price and category.' });
  try {
    const [result] = await pool.query('INSERT INTO MenuItems (restaurant_id,name,description,price,category,is_available) VALUES (?,?,?,?,?,?)',
      [req.body.restaurant_id, req.body.item_name.trim(), req.body.description || '', Number(req.body.price), req.body.category.trim(), req.body.availability !== false]);
    res.status(201).json({ item_id: result.insertId, message: 'Menu item added.' });
  } catch (error) { next(error); }
});
router.put('/:id', async (req, res, next) => {
  if (!valid(req.body)) return res.status(400).json({ error: 'Enter an item name, restaurant, positive price and category.' });
  try {
    const [result] = await pool.query(`UPDATE MenuItems SET restaurant_id=?,name=?,description=?,price=?,category=?,is_available=?
      WHERE menu_item_id=?`, [req.body.restaurant_id, req.body.item_name.trim(), req.body.description || '', Number(req.body.price),
      req.body.category.trim(), req.body.availability !== false, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Menu item not found.' });
    res.json({ message: 'Menu item updated.' });
  } catch (error) { next(error); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM MenuItems WHERE menu_item_id=?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Menu item not found.' });
    res.json({ message: 'Menu item deleted.' });
  } catch (error) { next(error); }
});
module.exports = router;
