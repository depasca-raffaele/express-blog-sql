import posts from '../data/posts.js';

function parseId(rawId) {
    const id = Number(rawId);
    const isValid = Number.isInteger(id) && id > 0;
    return { id, isValid };
}

export function index(request, response) {
    return response.status(200).json(posts);
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

export function destroy(request, response) {
    const { id, isValid } = parseId(request.params.id);

    if (!isValid) {
        return response.status(400).json({ message: 'ID non valido' });
    }

    const index = posts.findIndex((p) => p.id === id);

    if (index === -1) {
        return response.status(404).json({ message: 'Post non trovato' });
    }

    const deleted = posts.splice(index, 1)[0];
    return response.status(200).json({ message: 'Post eliminato', deleted });
}