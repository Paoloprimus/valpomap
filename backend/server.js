const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Abilitare i log di debug di Mongoose
mongoose.set('debug', true);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000 // Timeout dopo 5s anziché 30s
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('Error connecting to MongoDB:', err));

// Routes
const poiRouter = require('./routes/poi');
const authRouter = require('./routes/auth');
app.use('/pois', poiRouter);
app.use('/api/auth', authRouter);

app.get('/', (req, res) => {
  res.send('Hello from ValpoMap API');
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

