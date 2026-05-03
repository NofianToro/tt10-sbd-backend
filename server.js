const express = require('express');
const cors = require('cors');
require('dotenv').config();

const songRoutes = require('./src/routes/songRoutes');
const userRoutes = require('./src/routes/userRoutes');       
const rankingRoutes = require('./src/routes/rankingRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/songs', songRoutes);
app.use('/users', userRoutes);       
app.use('/rankings', rankingRoutes); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});