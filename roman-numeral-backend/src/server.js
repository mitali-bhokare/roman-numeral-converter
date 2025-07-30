/**
 * @fileoverview
 * This is a minimal Node.js server using Express.
 * It enables CORS, exposes a simple health check endpoint (`/ping`),
 * and listens on port 8080. This can be used as a base server or a placeholder
 * for more complex backend functionality.
 *
 * To run:
 *   node index.js
 *
 * Dependencies:
 *   - express: for routing and middleware
 *   - cors: to enable cross-origin requests
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 8080;

app.use(cors());

app.get('/ping', (_req, res) => {
  res.send('pong');
});

app.listen(PORT, () => {
  console.log(`NodeJS server running on http://localhost:${PORT}`);
});

