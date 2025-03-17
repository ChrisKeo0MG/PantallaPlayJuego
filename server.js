const express = require('express');
const path = require('path');

const app = express();
const port = 880;

// Servir archivos estáticos desde 'public', 'JS' y 'assets'
app.use(express.static(path.join(__dirname, 'public')));
app.use('/js', express.static(path.join(__dirname, 'JS')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/CSS', express.static(path.join(__dirname, 'CSS')));
app.use('/img', express.static(path.join(__dirname, 'img')));



// Ruta para la pantalla de inicio
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/niv1', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'niv1.html'));
});

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Server running at: http://localhost:${port}`);
});
