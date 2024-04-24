const express = require('express');
const mysql = require('mysql');

const app = express();
app.use(express.json());

// Configuración de la conexión a MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345',
  database: 'restaurante'
});

// Ruta para obtener todos los usuarios
app.get('/usuarios', (req, res) => {
  const query = 'SELECT * FROM usuarios';
  connection.query(query, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

// Ruta para obtener un usuario específico con sus facturas y pedidos
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

// Ruta para obtener todos los pedidos
app.get('/pedidos', (req, res) => {
  const query = 'SELECT * FROM pedidos';
  connection.query(query, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

// Ruta para obtener un pedido específico con su factura y usuario
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

// Ruta para obtener todas las facturas
app.get('/facturas', (req, res) => {
  const query = 'SELECT * FROM facturas';
  connection.query(query, (err, results) => {
    if (err) throw err;
    res.send(results);
  });
});

// Ruta para obtener una factura específica con su usuario y pedidos
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

// Ruta para crear un nuevo pedido y su factura correspondiente
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

// Ruta para actualizar un pedido existente
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

// Ruta para eliminar un pedido existente
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

  //Ruta para agregar nuevos usuarios.
  app.post('/usuarios', (req, res) => {
    const { nombre, email } = req.body;
    const query = 'INSERT INTO usuarios (nombre, email) VALUES (?, ?)';
    connection.query(query, [nombre, email], (err, result) => {
      if (err) throw err;
      res.send({ message: 'Usuario creado correctamente' });
    });
  });

  //Ruta para actualizar los usuarios

  app.put('/usuarios/:id', (req, res) => {
    const userId = req.params.id;
    const { nombre, email } = req.body;
    const query = 'UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?';
    connection.query(query, [nombre, email, userId], (err, result) => {
      if (err) throw err;
      res.send({ message: 'Usuario actualizado correctamente' });
    });
  });

  //Ruta para eliminar usuarios
  
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