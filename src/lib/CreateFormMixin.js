module.exports = {

  linkField: function (key) {
    if (!this.schema[key]) throw new Error('No value "' + key + '" exists in the schema');
    return this.linkState(key);
  },

  getValues: function () {
    var values = {};
    Object.keys(this.schema).forEach(key => {
      if (typeof this.linkField(key).value === 'undefined') return;
      values[key] = this.linkField(key).value;
    });
    return values;
  },

  submitGroup: function (group, onSuccess, onError) {

    var dirtyFields = this.state.dirtyFields;

    Object.keys(this.schema).forEach(key => {
      if (this.schema[key].group === group) dirtyFields[key] = true;
    });

    this.setState({dirtyFields});

    // TODO return values
    if (this.isGroupValid(group)) {
      onSuccess && onSuccess();
    } else {
      onError && onError();
    }
  },

  submitForm: function(e) {

    if (e) e.preventDefault();

    // Make all fields dirty
    var dirtyFields = this.state.dirtyFields;
    Object.keys(this.schema).forEach(key => {
      dirtyFields[key] = true;
    });

    this.setState({
      dirtyFields,
      didSubmit: true
    });

    if (!this.isValid()) return;

    var data = {};

    Object.keys(this.schema).forEach(key => {
      if (typeof this.state[key] !== 'undefined') data[key] = this.state[key];
    });

    if (this.onSuccess) {
      this.onSuccess(data);
    }
  },

  validations: require('./validations'),

  validateField: function (key) {
    var errors = [];
    var schema = this.schema[key];
    var currentValue = this.state[key];
    var label = schema.label || key;

    if (schema.required === true && !currentValue) errors.push(label + ' is required');
    if (typeof schema.required === 'function') {
      var isConditionallyRequred = schema.required.bind(this)();
      if (isConditionallyRequred && !currentValue) errors.push(label + ' is required');
    }
    if (currentValue && typeof schema.type === 'string' && this.validations[schema.type]) {
      var typeError = this.validations[schema.type](currentValue);
      if (typeError) errors.push(typeError);
    }
    if (currentValue && typeof schema.type === 'function') {
      var typeError = schema.type(currentValue);
      if (typeError) errors.push(typeError);
    }
    if (!errors.length) return false;
    return errors;
  },

  didSubmit: function (field) {
    if (!field) return this.state.didSubmit;
    return this.state.dirtyFields[field];
  },

  isGroupValid: function (groupName) {
    var isValid = true;
    var fields = Object.keys(this.schema).filter(key => this.schema[key].group === groupName);
    fields.forEach(key => {
      if (this.validateField(key)) isValid = false;
    });
    return isValid;
  },

  isValid: function () {
    var isValid = true;
    Object.keys(this.schema).forEach(key => {
      if (this.validateField(key)) isValid = false;
    });
    return isValid;
  }
};
