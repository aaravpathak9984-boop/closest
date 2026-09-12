/**
 * Form Validation Middleware Helper.
 * Runs custom validation function rules against req.body before proceeding to controller.
 */

function validate(validationRules) {
  return (req, res, next) => {
    const errors = validationRules(req.body);
    if (errors && Object.keys(errors).length > 0) {
      req.validationErrors = errors;
    }
    next();
  };
}

module.exports = validate;
