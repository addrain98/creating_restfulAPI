const express = require('express');
const app = express();
app.use(json());
app.use(cors());
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
