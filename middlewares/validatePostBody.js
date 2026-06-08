import posts from '../data/posts.js';

const REQUIRED_FIELDS = [
  'title',
  'content',
  'image',
  'tags',
  'slug',
  'published',
  'prep_time',
  'created_at',
];

const ALLOWED_FIELDS = [...REQUIRED_FIELDS];

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidIsoDateString(value) {
  if (typeof value !== 'string') return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function validatePostPayload(payload, { mode, currentId = null } = {}) {
  const errors = [];
  const conflicts = [];
  const isCreate = mode === 'create';
  const isUpdate = mode === 'update' || mode === 'patch';

  if (!isPlainObject(payload)) {
    errors.push('Il body deve essere un oggetto JSON valido');
    return { errors, conflicts };
  }

  const keys = Object.keys(payload);

  if (isCreate && 'id' in payload) errors.push('Non devi passare id in creazione');
  if (isUpdate && 'id' in payload) errors.push('Non puoi modificare id');
  if (isUpdate && keys.length === 0) errors.push('Body vuoto: specifica almeno un campo da aggiornare');

  const unknownFields = keys.filter((key) => !ALLOWED_FIELDS.includes(key) && key !== 'id');
  if (unknownFields.length > 0) errors.push('Campi non consentiti: ' + unknownFields.join(', '));

  const needsField = (field) => (isCreate ? true : field in payload);

  if (needsField('title') && !isNonEmptyString(payload.title)) errors.push('title è obbligatorio e deve essere una stringa non vuota');
  if (needsField('content') && !isNonEmptyString(payload.content)) errors.push('content è obbligatorio e deve essere una stringa non vuota');

  if (needsField('image')) {
    if (!isNonEmptyString(payload.image)) errors.push('image è obbligatorio e deve essere una stringa non vuota');
    else if (!payload.image.startsWith('/img/posts/')) errors.push('image deve iniziare con /img/posts/');
  }

  if (needsField('tags')) {
    if (!Array.isArray(payload.tags)) errors.push('tags deve essere un array');
    else if (payload.tags.some((tag) => !isNonEmptyString(tag))) errors.push('tags deve contenere solo stringhe non vuote');
  }

  if (needsField('slug')) {
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!isNonEmptyString(payload.slug)) errors.push('slug è obbligatorio e deve essere una stringa non vuota');
    else if (!slugRegex.test(payload.slug)) errors.push('slug deve essere in formato kebab-case');
    else {
      const duplicate = posts.find((p) => p.slug === payload.slug && p.id !== currentId);
      if (duplicate) conflicts.push('slug già esistente');
    }
  }

  if (needsField('published') && typeof payload.published !== 'boolean') errors.push('published deve essere boolean');
  if (needsField('prep_time') && (!Number.isInteger(payload.prep_time) || payload.prep_time <= 0)) errors.push('prep_time deve essere un intero positivo');
  if (needsField('created_at') && !isValidIsoDateString(payload.created_at)) errors.push('created_at deve essere una data valida in formato ISO');

  return { errors, conflicts };
}

export function validatePostBody(mode) {
  return (request, response, next) => {
    const currentId = Number(request.params.id) || null;
    const { errors, conflicts } = validatePostPayload(request.body, { mode, currentId });

    if (errors.length > 0) {
      return response.status(400).json({ message: 'Validazione fallita', errors });
    }

    if (conflicts.length > 0) {
      return response.status(409).json({ message: 'Conflitto dati', errors: conflicts });
    }

    next();
  };
}