const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.response) {
    // Error from external API
    return res.status(err.response.status || 500).json({
      error: 'External API error',
      message: err.response.data.message || err.message
    });
  }

  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
};

module.exports = {
  errorHandler
}; 