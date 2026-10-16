
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import indexRoutes from './routes/index.js';
import openapi from './docs/openapi.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(openapi, {
    swaggerOptions: { persistAuthorization: true },
  })
);

app.use("/api", indexRoutes);

export default app;