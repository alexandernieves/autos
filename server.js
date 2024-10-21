require('dotenv').config();

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sql = require('mssql'); // Reemplazar mysql por mssql

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Configuración de conexión a Azure SQL Database
const config = {
  user: process.env.DB_USER, // Usuario de la base de datos
  password: process.env.DB_PASSWORD, // Contraseña de la base de datos
  server: process.env.DB_SERVER, // Dirección del servidor (ej. 'your-server.database.windows.net')
  database: process.env.DB_NAME, // Nombre de la base de datos
  options: {
    encrypt: true, // Azure SQL requiere cifrado
    trustServerCertificate: true // Usar solo si es necesario
  },
};

// Variable global para el pool de conexiones
let poolPromise;

// Establecer la conexión con la base de datos
poolPromise = sql.connect(config)
  .then(pool => {
    console.log('Conexión exitosa a Azure SQL Database');
    return pool;
  })
  .catch(err => {
    console.error('Error de conexión a la base de datos:', err);
  });

// Clave secreta para firmar los tokens JWT
const secretKey = process.env.JWT_SECRET || '827d89c49894a0817ba2a74963ae486db9b5329b557eaa123e78731e718754ddc0fdd2034f1f45eef948aaff1b548631c9809d23668d56105c74181bd301411d';

// Ruta para registrar usuarios nuevos
app.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const pool = await poolPromise; // Esperar a que el pool esté disponible

    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM users WHERE email = @email');

    if (result.recordset.length > 0) {
      return res.status(400).json({ message: 'Este email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.request()
      .input('name', sql.NVarChar, name)
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, hashedPassword)
      .input('role', sql.NVarChar, role || 'user')
      .query('INSERT INTO users (name, email, password, role, is_active) VALUES (@name, @email, @password, @role, 1)');

    const token = jwt.sign({ email, name, role: role || 'user' }, secretKey, { expiresIn: '1h' });

    res.status(201).json({ message: 'Usuario registrado exitosamente', token });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error al registrar el usuario' });
  }
});

// Ruta de inicio de sesión
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM users WHERE email = @email');
    
    const user = result.recordset[0];

    if (!user) {
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Email o contraseña incorrectos' });
    }

    await pool.request()
      .input('id', sql.Int, user.id)
      .query('UPDATE users SET is_active = 1 WHERE id = @id');

    const newToken = jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, secretKey, { expiresIn: '1h' });

    res.json({ token: newToken });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

// Cerrar sesión
app.post('/logout', async (req, res) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const userId = decoded.id;

    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.Int, userId)
      .query('UPDATE users SET is_active = 0 WHERE id = @id');

    res.status(200).json({ message: 'Sesión cerrada correctamente' });
  } catch (error) {
    console.error('Error al cerrar sesión:', error.message);
    res.status(500).json({ message: 'Error al cerrar sesión' });
  }
});

// Endpoint para contar los usuarios activos
app.get('/users/active/count', async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .query('SELECT COUNT(*) AS activeUsers FROM users WHERE is_active = 1');
    
    const activeUsers = result.recordset[0].activeUsers;

    res.status(200).json({ activeUsers });
  } catch (error) {
    console.error('Error al obtener el número de usuarios activos:', error.message);
    res.status(500).json({ message: 'Error al obtener el número de usuarios activos' });
  }
});




// Endpoint para contar los usuarios inactivos
// Endpoint para contar los usuarios inactivos
app.get('/users/inactive/count', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT COUNT(*) AS inactiveUsers FROM users WHERE is_active = 0');
    const inactiveUsers = result.recordset[0].inactiveUsers;

    res.status(200).json({ inactiveUsers });
  } catch (error) {
    console.error('Error al obtener el número de usuarios inactivos:', error.message);
    res.status(500).json({ message: 'Error al obtener el número de usuarios inactivos' });
  }
});

// Ruta para obtener los referidos de un usuario autenticado
app.get('/user/referrals', async (req, res) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const userId = decoded.id;

    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT first_name, last_name, phone_number, email, vehicle_status, vehicle_brand, vehicle_model, status FROM referrals WHERE referred_by_user_id = @userId');

    if (result.recordset.length === 0) {
      return res.status(200).json({ message: 'No referrals found', referrals: [] });
    }

    res.status(200).json({ referrals: result.recordset });
  } catch (error) {
    console.error('Error al obtener los referidos:', error.message);
    res.status(500).json({ message: 'Error al obtener los referidos' });
  }
});

// Ruta para crear referidos
// Ruta para crear referidos
app.post('/referrals', async (req, res) => {
  const { first_name, last_name, phone_number, email, vehicle_status, vehicle_brand, vehicle_model, referred_by_user_id, status } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('first_name', sql.NVarChar, first_name)
      .input('last_name', sql.NVarChar, last_name)
      .input('phone_number', sql.NVarChar, phone_number)
      .input('email', sql.NVarChar, email)
      .input('vehicle_status', sql.NVarChar, vehicle_status)
      .input('vehicle_brand', sql.NVarChar, vehicle_brand)
      .input('vehicle_model', sql.NVarChar, vehicle_model)
      .input('referred_by_user_id', sql.Int, referred_by_user_id)
      .input('status', sql.NVarChar, status)
      // Usar OUTPUT INSERTED.ID para obtener el ID del nuevo registro
      .query(`
        INSERT INTO referrals (
          first_name, 
          last_name, 
          phone_number, 
          email, 
          vehicle_status, 
          vehicle_brand, 
          vehicle_model, 
          referred_by_user_id, 
          status
        ) 
        OUTPUT INSERTED.ID AS insertId
        VALUES (
          @first_name, 
          @last_name, 
          @phone_number, 
          @email, 
          @vehicle_status, 
          @vehicle_brand, 
          @vehicle_model, 
          @referred_by_user_id, 
          @status
        )
      `);

    // Obtener el insertId de la respuesta
    const insertId = result.recordset[0].insertId; // Asegúrate de que la respuesta tenga el ID
    console.log('Referral saved successfully with ID:', insertId);
    res.status(201).json({ message: 'Referral saved successfully', referralId: insertId });
  } catch (error) {
    console.error('Error saving referral:', error.message);
    res.status(500).json({ message: `Failed to save referral: ${error.message}` });
  }
});


// Ruta para contar los referidos pendientes
app.get('/referrals/count-pending', async (req, res) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const userId = decoded.id;

    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT COUNT(*) AS pendingReferrals FROM referrals WHERE referred_by_user_id = @userId AND status = \'Pending\'');

    const pendingReferrals = result.recordset[0].pendingReferrals;
    res.status(200).json({ pendingReferrals });
  } catch (error) {
    console.error('Error al obtener el número de referidos pendientes:', error.message);
    res.status(500).json({ message: 'Error al obtener los referidos pendientes' });
  }
});

// Endpoint para contar los usuarios
app.get('/users/count', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT COUNT(*) AS totalUsers FROM users');
    const totalUsers = result.recordset[0].totalUsers;

    res.status(200).json({ totalUsers });
  } catch (error) {
    console.error('Error al obtener el número de usuarios:', error.message);
    res.status(500).json({ message: 'Error al obtener el número de usuarios' });
  }
});

// Endpoint para contar los referidos
app.get('/referral/count', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT COUNT(*) AS totalReferrals FROM referrals');
    const totalReferrals = result.recordset[0].totalReferrals;

    res.status(200).json({ totalReferrals });
  } catch (error) {
    console.error('Error al obtener el número de referidos:', error.message);
    res.status(500).json({ message: 'Error al obtener el número de referidos' });
  }
});

// Endpoint para obtener usuarios con paginación
app.get('/users', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;

  try {
    const pool = await poolPromise;

    // Obtener el total de usuarios
    const totalResult = await pool.request().query('SELECT COUNT(*) as total FROM users');
    const total = totalResult.recordset[0].total;

    // Obtener los usuarios con el límite y el offset
    const result = await pool.request()
      .query(`SELECT id, name, email, role FROM users ORDER BY id OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`);

    res.status(200).json({
      users: result.recordset,
      total: total,
      page: page,
      limit: limit,
    });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
});

// Endpoint para actualizar el rol de un usuario
app.put('/users/:id/role', async (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('role', sql.NVarChar, role)
      .input('userId', sql.Int, userId)
      .query('UPDATE users SET role = @role WHERE id = @userId');

    res.status(200).json({ message: 'User role updated successfully' });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ message: 'Error updating user role' });
  }
});

// Endpoint para obtener los referidos con paginación
app.get('/get-referrals', async (req, res) => {
  const { page = 1, limit = 5 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const pool = await poolPromise;

    // Obtener los referidos con paginación
    const referralsResult = await pool.request()
      .query(`SELECT id, first_name, last_name, phone_number, email, vehicle_status, vehicle_brand, vehicle_model, status FROM referrals ORDER BY id OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`);

    // Obtener el número total de referidos
    const countResult = await pool.request().query('SELECT COUNT(*) AS total FROM referrals');
    const total = countResult.recordset[0].total;

    res.status(200).json({
      referrals: referralsResult.recordset,
      total: total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error('Error al obtener los referidos:', error.message);
    res.status(500).json({ message: 'Error al obtener los referidos' });
  }
});

// Ruta para actualizar el estado de un referido
app.put('/referrals/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const validStatuses = ['Pending', 'Booked', 'Closed', 'Lost'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Estado inválido' });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input('status', sql.NVarChar, status)
      .input('id', sql.Int, id)
      .query('UPDATE referrals SET status = @status WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Referido no encontrado' });
    }

    res.status(200).json({ message: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar el estado del referido:', error);
    res.status(500).json({ message: 'Error al actualizar el estado del referido' });
  }
});

// Ruta protegida general (accesible para todos los usuarios autenticados)
app.get('/protected', (req, res) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    res.json({ message: 'Ruta protegida accedida', user: decoded });
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
});

// Ruta para contar los referidos de un usuario autenticado
app.get('/referrals/count', async (req, res) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const userId = decoded.id;

    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT COUNT(*) AS total_referrals FROM referrals WHERE referred_by_user_id = @userId');

    const totalReferrals = result.recordset[0].total_referrals;
    res.status(200).json({ totalReferrals });
  } catch (error) {
    console.error('Error al obtener el número de referidos:', error.message);
    res.status(500).json({ message: 'Error al obtener el número de referidos' });
  }
});



app.get('/referrals/count-closed', async (req, res) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const userId = decoded.id;

    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT COUNT(*) AS closedReferrals FROM referrals WHERE referred_by_user_id = @userId AND status = \'Closed\'');

    const closedReferrals = result.recordset[0].closedReferrals;
    res.status(200).json({ closedReferrals });
  } catch (error) {
    console.error('Error al obtener el número de referidos Closed:', error.message);
    res.status(500).json({ message: 'Error al obtener los referidos Closed' });
  }
});

app.get('/referrals/count-booked', async (req, res) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const userId = decoded.id;

    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT COUNT(*) AS bookedReferrals FROM referrals WHERE referred_by_user_id = @userId AND status = \'Booked\'');

    const bookedReferrals = result.recordset[0].bookedReferrals;
    res.status(200).json({ bookedReferrals });
  } catch (error) {
    console.error('Error al obtener el número de referidos Booked:', error.message);
    res.status(500).json({ message: 'Error al obtener los referidos Booked' });
  }
});

app.get('/referrals/count-lost', async (req, res) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const userId = decoded.id;

    const pool = await poolPromise;
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT COUNT(*) AS lostReferrals FROM referrals WHERE referred_by_user_id = @userId AND status = \'Lost\'');

    const lostReferrals = result.recordset[0].lostReferrals;
    res.status(200).json({ lostReferrals });
  } catch (error) {
    console.error('Error al obtener el número de referidos Lost:', error.message);
    res.status(500).json({ message: 'Error al obtener los referidos Lost' });
  }
});

app.get('/test-connection', async (req, res) => {
  try {
    const pool = await poolPromise; // Conectar a la base de datos
    const result = await pool.request().query('SELECT 1 AS result'); // Ejecutar una consulta simple

    res.status(200).json({
      message: 'Conexión exitosa',
      result: result.recordset,
    });
  } catch (error) {
    console.error('Error de conexión:', error);
    res.status(500).json({ message: 'Error de conexión a la base de datos', error: error.message });
  }
});


// Ruta protegida solo para administradores
app.get('/admin', (req, res) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);

    // Verificar si el rol del usuario es 'admin'
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado: se requiere rol de administrador' });
    }

    res.json({ message: 'Acceso concedido a administrador' });
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

