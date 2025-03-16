const express = require('express');
const path = require('path');

const app = express();
const port = 880;

// Servir archivos estáticos desde 'public', 'JS' y 'assets'
app.use(express.static(path.join(__dirname, 'public')));
app.use('/js', express.static(path.join(__dirname, 'JS')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Ruta para la pantalla de inicio
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Server running at: http://localhost:${port}`);
});