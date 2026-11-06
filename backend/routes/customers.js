const express = require('express');
const pool = require('../db');
const router = express.Router();

function validCustomer(body) {
  return typeof body.name === 'string' && body.name.trim() &&
    typeof body.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) &&
    typeof body.phone === 'string' && body.phone.trim() &&
    typeof body.address === 'string' && body.address.trim();
}

router.get('/', async (req, res, next) => {
  try {
    const search = `%${String(req.query.search || '').trim()}%`;
    const [rows] = await pool.query(`SELECT customer_id, name, email, phone, full_address AS address,
      city, state, pincode FROM Customers WHERE name LIKE ? OR email LIKE ? ORDER BY customer_id DESC`, [search, search]);
    res.json(rows);
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  if (!validCustomer(req.body)) return res.status(400).json({ error: 'Enter a name, valid email, phone and address.' });
  try {
    const [result] = await pool.query('INSERT INTO Customers (name,email,phone,full_address) VALUES (?,?,?,?)',
      [req.body.name.trim(), req.body.email.trim(), req.body.phone.trim(), req.body.address.trim()]);
    res.status(201).json({ customer_id: result.insertId, message: 'Customer added.' });
  } catch (error) { next(error); }
});

router.put('/:id', async (req, res, next) => {
  if (!validCustomer(req.body)) return res.status(400).json({ error: 'Enter a name, valid email, phone and address.' });
  try {
    const [result] = await pool.query('UPDATE Customers SET name=?,email=?,phone=?,full_address=? WHERE customer_id=?',
      [req.body.name.trim(), req.body.email.trim(), req.body.phone.trim(), req.body.address.trim(), req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Customer not found.' });
    res.json({ message: 'Customer updated.' });
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM Customers WHERE customer_id=?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Customer not found.' });
    res.json({ message: 'Customer deleted.' });
  } catch (error) { next(error); }
});

module.exports = router;
