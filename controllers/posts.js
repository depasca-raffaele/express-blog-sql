import posts from '../data/posts.js';
import { connectDB } from '../config/db.js';

function parseId(rawId) {
    const id = Number(rawId);
    const isValid = Number.isInteger(id) && id > 0;
    return { id, isValid };
}

export async function index(request, response) {
    let connection;
    try {
        connection = await connectDB();
        const [rows] = await connection.query('SELECT * FROM \`posts\`');

        return response.status(200).json(rows);
    }catch (error) {
        console.error('Errore INDEX DB:', error.message);
        return response.status(500).json({message: 'Errore nel recupero dei post'});
    }finally{
        if(connection) {
            await connection.end();
        }
    }
}

export function show(request, response) {
    const { id, isValid } = parseId(request.params.id);

    if (!isValid) {
        return response.status(400).json({ message: 'ID non valido' });
    }

    const post = posts.find((p) => p.id === id);

    if (!post) {
        return response.status(404).json({ message: 'Post non trovato' });
    }

    return response.status(200).json(post);
}

export function create(request, response) {
    console.log('Body ricevuto:', request.body);

    const newId = posts.length ? Math.max(...posts.map((p) => p.id)) + 1 : 1;
    const newPost = { id: newId, ...request.body };

    posts.push(newPost);
    return response.status(201).json(newPost);
}

export function update(request, response) {
    const { id, isValid } = parseId(request.params.id);

    if (!isValid) {
        return response.status(400).json({ message: 'ID non valido' });
    }

    const index = posts.findIndex((p) => p.id === id);

    if (index === -1) {
        return response.status(404).json({ message: 'Post non trovato' });
    }

    posts[index] = { ...posts[index], ...request.body, id };
    return response.status(200).json(posts[index]);
}

export async function destroy(request, response) {
    const { id, isValid } = parseId(request.params.id);

    if (!isValid) {
        return response.status(400).json({ message: 'ID non valido' });
    }

    let connection;

    try{
        connection = await connectDB();

        const [result] = await connection.query(
            'DELETE FROM `posts` WHERE id = ?', [id]
        );

        if (result.affectedRows === 0) {
            return response.status(404).json({ message: 'Post non trovato' });
        }

        return response.status(204).send();
    }catch (error) {
        console.error('Errore DESTROY DB', error.message);
        return response.status(500).json({ message: 'Errore durante eliminazione post'});
    }finally{
        if(connection) {
            await connection.end();
        }
    }
}