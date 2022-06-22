require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRouter = require('./router/authRoute');
const restaurantRouter = require('./router/restaurantRoute');
const notFoundMiddleware = require('./middlewares/notFound');
const errorMiddleware = require('./middlewares/error');

// const { sequelize } = require('./models');
// sequelize.sync({ alter: true });

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
app.use('/restaurant', restaurantRouter);

// Error middlewares
app.use(notFoundMiddleware);
app.use(errorMiddleware);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log('server is running on port: ' + PORT));
