const validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = validateRegisterInuput = (data) => {
    var errors = {};
    data.name = !isEmpty(data.name) ? data.name : '';
    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';
    data.password2 = !isEmpty(data.password2) ? data.password2 : '';

    if(!validator.isLength(data.name, {min :2, max: 30 })){
         errors.name = 'Name must be between 2 to 30 chars';
    }
    if(validator.isEmpty(data.name)){
        errors.name = 'Name is Required';
    }

    if(validator.isEmpty(data.email)){
        errors.email = 'Email is Required';
    }

    if(!validator.isEmail(data.email)){
        errors.email = 'Email is Invalid';
    }

    if(validator.isEmpty(data.password)){
        errors.password = 'Password is required';
    }
    
    if(!validator.isLength(data.password, {min: 6, max: 30})){
        errors.password = 'Password must be atleast 6 characters';
    }
    
    if(validator.isEmpty(data.password2)){
        errors.password2 = 'Confirm Password is required';
    }

    if(!validator.equals(data.password, data.password2)){
        errors.password2 = 'Passwords must match';
    }
    

    return {
        errors,
        isValid: isEmpty(errors)
    }
}