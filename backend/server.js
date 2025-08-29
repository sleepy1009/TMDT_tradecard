const express = require('express');
const cors = require('cors');
// start express
const app = express();

// use cors to make another domain can call
app.use(cors());

const PORT = 5000;

// base api
app.get('/api', (req, res) => {
  res.json({ message: "this is backend data!" });
});


app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});