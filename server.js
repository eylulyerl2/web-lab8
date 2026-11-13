import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/hello', (req, res) => {
  res.type('text/plain').send("Hello from Eylül Yerli's server");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});