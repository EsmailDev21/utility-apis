const express = require('express');
const uploadRouter = require('./uploadController');

const app = express();
const port = process.env.PORT || 3000;

app.use('/api', uploadRouter);



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
