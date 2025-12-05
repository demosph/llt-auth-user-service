export const validate = (schema) => (req, res, next) => {
  const input = { body: req.body, params: req.params, query: req.query };
  const { error, value } = schema.validate(input, {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      error: "ValidationError",
      details: error.details?.map((d) => ({
        message: d.message,
        path: d.path,
      })),
    });
  }

  if (value.body) req.body = value.body;

  req.validated = {
    body: value.body ?? req.body,
    params: value.params ?? req.params,
    query: value.query ?? req.query,
  };

  next();
};
