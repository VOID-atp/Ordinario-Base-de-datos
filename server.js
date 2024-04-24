const express = require('express');
const mysql = require('mysql');

const app = express();
app.use(express.json());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345',
  database: 'restaurante'
});

app.get('/usuarios', (req, res) => {
  const query = 'SELECT * FROM usuarios';
  connection.query(query, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

app.get('/usuarios/:id', (req, res) => {
  const userId = req.params.id;
  const query = `
    SELECT u.*, 
      (SELECT COUNT(*) FROM facturas WHERE usuario_id = u.id) AS num_facturas,
      (SELECT COUNT(*) FROM pedidos WHERE usuario_id = u.id) AS num_pedidos
    FROM usuarios u
    WHERE u.id = ?
  `;
  connection.query(query, [userId], (err, results) => {
    if (err) throw err;
    res.send(results[0]);
  });
});

app.get('/pedidos', (req, res) => {
  const query = 'SELECT * FROM pedidos';
  connection.query(query, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

app.get('/pedidos/:id', (req, res) => {
  const pedidoId = req.params.id;
  const query = `
    SELECT p.*, f.id AS factura_id, u.nombre AS usuario_nombre
    FROM pedidos p
    JOIN facturas f ON p.factura_id = f.id
    JOIN usuarios u ON f.usuario_id = u.id
    WHERE p.id = ?
  `;
  connection.query(query, [pedidoId], (err, results) => {
    if (err) throw err;
    res.send(results[0]);
  });
});

app.get('/facturas', (req, res) => {
  const query = 'SELECT * FROM facturas';
  connection.query(query, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

app.get('/facturas/:id', (req, res) => {
  const facturaId = req.params.id;
  const query = `
    SELECT f.*, u.nombre AS usuario_nombre, 
      (SELECT COUNT(*) FROM pedidos WHERE factura_id = f.id) AS num_pedidos
    FROM facturas f
    JOIN usuarios u ON f.usuario_id = u.id
    WHERE f.id = ?
  `;
  connection.query(query, [facturaId], (err, results) => {
    if (err) throw err;
    res.send(results[0]);
  });
});

app.post('/pedidos', (req, res) => {
  const { usuario_id, descripcion, total } = req.body;
  const query = 'INSERT INTO facturas (usuario_id, total) VALUES (?, ?)';
  connection.query(query, [usuario_id, total], (err, result) => {
    if (err) throw err;
    const facturaId = result.insertId;
    const pedidoQuery = 'INSERT INTO pedidos (usuario_id, factura_id, descripcion) VALUES (?, ?, ?)';
    connection.query(pedidoQuery, [usuario_id, facturaId, descripcion], (err, result) => {
      if (err) throw err;
      res.send({ message: 'Pedido y factura creados correctamente' });
    });
  });
});

app.put('/pedidos/:id', (req, res) => {
    const pedidoId = req.params.id;
    const { descripcion, total } = req.body;
    const query = `
      UPDATE pedidos p
      JOIN facturas f ON p.factura_id = f.id
      SET p.descripcion = ?, f.total = ?
      WHERE p.id = ?
    `;
    connection.query(query, [descripcion, total, pedidoId], (err, result) => {
      if (err) throw err;
      res.send({ message: 'Pedido y factura actualizados correctamente' });
    });
  });

app.delete('/pedidos/:id', (req, res) => {
    const pedidoId = req.params.id;
    const query = `
      DELETE p, f
      FROM pedidos p
      JOIN facturas f ON p.factura_id = f.id
      WHERE p.id = ?
    `;
    connection.query(query, [pedidoId], (err, result) => {
      if (err) throw err;
      res.send({ message: 'Pedido y factura eliminados correctamente' });
    });
  });

  app.post('/usuarios', (req, res) => {
    const { nombre, email } = req.body;
    const query = 'INSERT INTO usuarios (nombre, email) VALUES (?, ?)';
    connection.query(query, [nombre, email], (err, result) => {
      if (err) throw err;
      res.send({ message: 'Usuario creado correctamente' });
    });
  });

  app.put('/usuarios/:id', (req, res) => {
    const userId = req.params.id;
    const { nombre, email } = req.body;
    const query = 'UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?';
    connection.query(query, [nombre, email, userId], (err, result) => {
      if (err) throw err;
      res.send({ message: 'Usuario actualizado correctamente' });
    });
  });

  app.delete('/usuarios/:id', (req, res) => {
    const userId = req.params.id;
    const query = `
      DELETE u, p, f
      FROM usuarios u
      LEFT JOIN facturas f ON u.id = f.usuario_id
      LEFT JOIN pedidos p ON f.id = p.factura_id
      WHERE u.id = ?
    `;
    connection.query(query, [userId], (err, result) => {
      if (err) throw err;
      res.send({ message: 'Usuario, facturas y pedidos eliminados correctamente' });
    });
  });

// Iniciar el servidor
app.listen(3000, () => {
  console.log('Servidor iniciado en http://localhost:3000');
});
