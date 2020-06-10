const NODE_PORT = 4000;
const express = require('express');
const path = require('path');
const app = express();
let morgan = require('morgan');

app.use(morgan('combined'));
app.use(express.static(path.join(__dirname,'dist'), {index: false, extensions:['html']}));
app.listen(NODE_PORT, () => console.log(`Server started on port ${NODE_PORT}`));
