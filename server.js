import express from 'express';
import postsRouter from './routers/posts.js';
import posts from './data/posts.js';
import { connectDB } from './config/db.js';

const app = express();

connectDB().catch(() => {
    process.exit(1);
});

app.use(express.static('public'));
app.use(express.json());

app.get('/', (request, response) => {
    response.json({ message: 'Server del blog attivo' });
});

app.use('/posts', postsRouter);

app.get('/bacheca', (request, response) => {
    response.json({ posts });
});

// 404 - rotta non registrata
app.use((request, response, next) => {
    const error = new Error(`Endpoint non trovato: ${request.originalUrl}`);
    error.statusCode = 404;
    next(error);
});

// Error handler globale
app.use((error, request, response, next) => {
    if (error instanceof SyntaxError && 'body' in error) {
        return response.status(400).json({
            message: 'JSON non valido nel body',
        });
    }

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Errore interno del server';

    return response.status(statusCode).json({ message });
});

app.listen(3000, (error) => {
    if (error) {
        console.error('server error');
    } else {
        console.log('server live');
    }
});