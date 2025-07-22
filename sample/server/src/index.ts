import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import session from 'express-session';
import cors from 'cors';
import bodyParser from 'body-parser';
import { router } from './routes';

const app = express();
const port = process.env.PORT || 3000;

// Middleware setup
app.use(cors({
	origin: process.env.CLIENT_ORIGIN_URL || 'http://localhost:5173', // Allow client access
	credentials: true,
}));
app.use(bodyParser.json());
app.use(session({
	secret: process.env.SESSION_SECRET || 'default_secret',
	resave: false,
	saveUninitialized: true,
	cookie: {
		secure: false, // Set to true if using HTTPS
		httpOnly: true,
		maxAge: 24 * 60 * 60 * 1000, // 24 hours
	},
}));

// API routes
app.use('/api', router);

// Start server
app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
