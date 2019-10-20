const validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = validatePostInput = (data) => {
    var errors = {};
    data.text = !isEmpty(data.text) ? data.text : '';
    
    if (!validator.isLength(data.text, {min: 10, max: 300})) {
        errors.text = 'Text should be between 10 and 300';
    }

    if (validator.isEmpty(data.text)) {
        errors.text = 'Text is Required';
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}