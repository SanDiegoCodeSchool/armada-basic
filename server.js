const express = require('express');

var app = express();

app.use(express.static('public'));

app.get('*', (req, res) => {
    res.status(200).send('ok');
});


module.exports = app;