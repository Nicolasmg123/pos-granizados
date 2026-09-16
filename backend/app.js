const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();

app.use(cors());
app.use(express.json());

let db;

// Inicializar base de datos
async function iniciarBaseDeDatos() {
    db = await open({
        filename: './database.sqlite',
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            precio REAL NOT NULL,
            stock INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            rol TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS ventas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            producto_id INTEGER NOT NULL,
            cantidad INTEGER NOT NULL,
            total REAL NOT NULL,
            fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (producto_id) REFERENCES productos(id)
        )
    `);

    console.log('Base de datos SQLite conectada');
}

// Endpoint principal
app.get('/', (req, res) => {
    res.json({
        mensaje: 'Backend POS Granizados funcionando'
    });
});

// Endpoint de saludo
app.get('/hola/:name', (req, res) => {
    const name = req.params.name;

    res.json({
        mensaje: `¡Hola, ${name}!`
    });
});

// Obtener todos los productos
app.get('/productos', async (req, res) => {
    try {
        const productos = await db.all('SELECT * FROM productos');

        res.json(productos);
    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener los productos'
        });
    }
});
// Crear un producto
app.post('/productos', async (req, res) => {
    try {
        const { nombre, precio, stock } = req.body;

        if (!nombre || precio === undefined || stock === undefined) {
            return res.status(400).json({
                error: 'Nombre, precio y stock son obligatorios'
            });
        }

        if (precio <= 0 || stock < 0) {
            return res.status(400).json({
                error: 'El precio debe ser mayor que 0 y el stock no puede ser negativo'
            });
        }

        const resultado = await db.run(
            'INSERT INTO productos (nombre, precio, stock) VALUES (?, ?, ?)',
            [nombre, precio, stock]
        );

        res.status(201).json({
            mensaje: 'Producto creado correctamente',
            id: resultado.lastID
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al crear el producto'
        });
    }
});
// Actualizar un producto
app.put('/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, precio, stock } = req.body;

        if (!nombre || precio === undefined || stock === undefined) {
            return res.status(400).json({
                error: 'Nombre, precio y stock son obligatorios'
            });
        }

        if (precio <= 0 || stock < 0) {
            return res.status(400).json({
                error: 'El precio debe ser mayor que 0 y el stock no puede ser negativo'
            });
        }

        const resultado = await db.run(
            'UPDATE productos SET nombre = ?, precio = ?, stock = ? WHERE id = ?',
            [nombre, precio, stock, id]
        );

        if (resultado.changes === 0) {
            return res.status(404).json({
                error: 'Producto no encontrado'
            });
        }

        res.json({
            mensaje: 'Producto actualizado correctamente'
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al actualizar el producto'
        });
    }
});
// Eliminar un producto
app.delete('/productos/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await db.run(
            'DELETE FROM productos WHERE id = ?',
            [id]
        );

        if (resultado.changes === 0) {
            return res.status(404).json({
                error: 'Producto no encontrado'
            });
        }

        res.json({
            mensaje: 'Producto eliminado correctamente'
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al eliminar el producto'
        });
    }
});
// Actualizar stock de un producto
app.put('/productos/:id/stock', async (req, res) => {
    try {
        const { id } = req.params;
        const { stock } = req.body;

        if (stock === undefined) {
            return res.status(400).json({
                error: 'El stock es obligatorio'
            });
        }

        if (stock < 0) {
            return res.status(400).json({
                error: 'El stock no puede ser negativo'
            });
        }

        const resultado = await db.run(
            'UPDATE productos SET stock = ? WHERE id = ?',
            [stock, id]
        );

        if (resultado.changes === 0) {
            return res.status(404).json({
                error: 'Producto no encontrado'
            });
        }

        res.json({
            mensaje: 'Stock actualizado correctamente'
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al actualizar el stock'
        });
    }
});

// Crear un usuario
app.post('/usuarios', async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;

        if (!nombre || !email || !password || !rol) {
            return res.status(400).json({
                error: 'Nombre, email, password y rol son obligatorios'
            });
        }

        const resultado = await db.run(
            'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)',
            [nombre, email, password, rol]
        );

        res.status(201).json({
            mensaje: 'Usuario creado correctamente',
            id: resultado.lastID
        });

    } catch (error) {
        if (error.message.includes('UNIQUE')) {
            return res.status(400).json({
                error: 'El email ya está registrado'
            });
        }

        res.status(500).json({
            error: 'Error al crear el usuario'
        });
    }
});
// Obtener todos los usuarios
app.get('/usuarios', async (req, res) => {
    try {
        const usuarios = await db.all(
            'SELECT id, nombre, email, rol FROM usuarios'
        );

        res.json(usuarios);

    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener los usuarios'
        });
    }
});
// Actualizar un usuario
app.put('/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, password, rol } = req.body;

        if (!nombre || !email || !password || !rol) {
            return res.status(400).json({
                error: 'Nombre, email, password y rol son obligatorios'
            });
        }

        const resultado = await db.run(
            'UPDATE usuarios SET nombre = ?, email = ?, password = ?, rol = ? WHERE id = ?',
            [nombre, email, password, rol, id]
        );

        if (resultado.changes === 0) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        res.json({
            mensaje: 'Usuario actualizado correctamente'
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al actualizar el usuario'
        });
    }
});
// Eliminar un usuario
app.delete('/usuarios/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const resultado = await db.run(
            'DELETE FROM usuarios WHERE id = ?',
            [id]
        );

        if (resultado.changes === 0) {
            return res.status(404).json({
                error: 'Usuario no encontrado'
            });
        }

        res.json({
            mensaje: 'Usuario eliminado correctamente'
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al eliminar el usuario'
        });
    }
});
// Registrar una venta
app.post('/ventas', async (req, res) => {
    try {
        const { producto_id, cantidad } = req.body;

        if (!producto_id || !cantidad) {
            return res.status(400).json({
                error: 'Producto y cantidad son obligatorios'
            });
        }

        if (cantidad <= 0) {
            return res.status(400).json({
                error: 'La cantidad debe ser mayor que 0'
            });
        }

        const producto = await db.get(
            'SELECT * FROM productos WHERE id = ?',
            [producto_id]
        );

        if (!producto) {
            return res.status(404).json({
                error: 'Producto no encontrado'
            });
        }

        if (producto.stock < cantidad) {
            return res.status(400).json({
                error: 'Stock insuficiente'
            });
        }

        const total = producto.precio * cantidad;

        await db.run(
            'INSERT INTO ventas (producto_id, cantidad, total) VALUES (?, ?, ?)',
            [producto_id, cantidad, total]
        );

        await db.run(
            'UPDATE productos SET stock = stock - ? WHERE id = ?',
            [cantidad, producto_id]
        );

        res.status(201).json({
            mensaje: 'Venta registrada correctamente',
            producto: producto.nombre,
            cantidad: cantidad,
            total: total
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al registrar la venta'
        });
    }
});
// Login de usuario
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Email y password son obligatorios'
            });
        }

        const usuario = await db.get(
            'SELECT id, nombre, email, rol FROM usuarios WHERE email = ? AND password = ?',
            [email, password]
        );

        if (!usuario) {
            return res.status(401).json({
                error: 'Email o password incorrectos'
            });
        }

        res.json({
            mensaje: 'Login exitoso',
            usuario: usuario
        });

    } catch (error) {
        res.status(500).json({
            error: 'Error al realizar el login'
        });
    }
});
// Iniciar servidor
iniciarBaseDeDatos()
    .then(() => {
        app.listen(3000, () => {
            console.log('Servidor escuchando en http://localhost:3000');
        });
    })
    .catch((error) => {
        console.error('Error al iniciar la base de datos:', error);
    });