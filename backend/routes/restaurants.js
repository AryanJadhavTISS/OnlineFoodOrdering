const express = require('express');
const pool = require('../db');
const router = express.Router();

function validRestaurant(body) {
  return typeof body.name === 'string' && body.name.trim() && typeof body.location === 'string' && body.location.trim() &&
    typeof body.phone === 'string' && body.phone.trim() && typeof body.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email);
}

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query(`SELECT restaurant_id,name,city,state,full_address AS location,phone,email
      FROM Restaurants ORDER BY restaurant_id DESC`);
    res.json(rows);
  } catch (error) { next(error); }
});
router.post('/', async (req, res, next) => {
  if (!validRestaurant(req.body)) return res.status(400).json({ error: 'Enter a restaurant name, location, phone and valid email.' });
  try {
    const [result] = await pool.query('INSERT INTO Restaurants (name,full_address,phone,email) VALUES (?,?,?,?)',
      [req.body.name.trim(), req.body.location.trim(), req.body.phone.trim(), req.body.email.trim()]);
    res.status(201).json({ restaurant_id: result.insertId, message: 'Restaurant added.' });
  } catch (error) { next(error); }
});
router.put('/:id', async (req, res, next) => {
  if (!validRestaurant(req.body)) return res.status(400).json({ error: 'Enter a restaurant name, location, phone and valid email.' });
  try {
    const [result] = await pool.query('UPDATE Restaurants SET name=?,full_address=?,phone=?,email=? WHERE restaurant_id=?',
      [req.body.name.trim(), req.body.location.trim(), req.body.phone.trim(), req.body.email.trim(), req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Restaurant not found.' });
    res.json({ message: 'Restaurant updated.' });
  } catch (error) { next(error); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM Restaurants WHERE restaurant_id=?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Restaurant not found.' });
    res.json({ message: 'Restaurant deleted.' });
  } catch (error) { next(error); }
});
module.exports = router;
