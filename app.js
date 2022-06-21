require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRouter = require('./router/authRoute');
const notFoundMiddleware = require('./middlewares/notFound');

const app = express();

// Middlewares
app.use(cors());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/auth', authRouter);

// Error middlewares
app.use(notFoundMiddleware);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log('server is running on port: ' + PORT));
