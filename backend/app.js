const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/hola/:name', (req, res) => {
    const name = req.params.name;
    res.json({ mensaje: `¡Hola, ${name}!` });
});

app.get('/', (req, res) => {
    res.json({
        mensaje: 'Backend POS Granizados funcionando'
    });
});

app.listen(3000, () => {
    console.log('Servidor escuchando en http://localhost:3000');
});