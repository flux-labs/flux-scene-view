'use strict';

var express = require('express');

var app = express();

app.set('port', process.env.PORT||8000);

app.use('/',express.static('public'));
app.use('/lib',express.static('lib'));
app.use('/src',express.static('src'));
app.use('/data',express.static('data'));

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});