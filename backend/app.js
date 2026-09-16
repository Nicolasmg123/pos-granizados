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