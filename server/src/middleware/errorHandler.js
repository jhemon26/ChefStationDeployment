const isProd = process.env.NODE_ENV === 'production';

const errorHandler = (err, req, res, _next) => {
  // In production log a reference ID only — never leak stack traces to logs
  // that could end up in client-visible error messages or third-party log sinks.
  const ref = Date.now().toString(36).toUpperCase();
  if (isProd) {
    console.error(`[err:${ref}]`, err.message);
  } else {
    console.error(`[err:${ref}]`, err);
  }
  if (res.headersSent) return;
  const status = err.status || 500;
  const message = err.publicMessage || (isProd ? 'Internal server error' : err.message) || 'Internal server error';
  res.status(status).json({ error: message });
};

const notFound = (req, res) => res.status(404).json({ error: 'Not found' });

module.exports = { errorHandler, notFound };
