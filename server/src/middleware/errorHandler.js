const errorHandler = (err, req, res, _next) => {
  console.error('[err]', err);
  if (res.headersSent) return;
  const status = err.status || 500;
  res.status(status).json({ error: err.publicMessage || 'Internal server error' });
};

const notFound = (req, res) => res.status(404).json({ error: 'Not found' });

module.exports = { errorHandler, notFound };
