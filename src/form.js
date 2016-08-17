//==================================================================================================
//FORM
//==================================================================================================

var Form = Backbone.View.extend({

  events: {
    'submit': function(event) {
      this.trigger('submit', event);
    }
  },

  /**
   * Constructor
   *
   * @param {Object} [options.schema]
   * @param {Backbone.Model} [options.model]
   * @param {Object} [options.data]
   * @param {String[]|Object[]} [options.fieldsets]
   * @param {String[]} [options.fields]
   * @param {String} [options.idPrefix]
   * @param {Form.Field} [options.Field]
   * @param {Form.Fieldset} [options.Fieldset]
   * @param {Function} [options.template]
   * @param {Boolean|String} [options.submitButton]
   */
  constructor: function(options) {
    Backbone.View.apply( this, arguments );

    //Merge default options
    options = this.options = _.extend({
      submitButton: false
    }, options);

    //Find the schema to use
    var schema = this.schema = this.createSchema(options);

    //Store important data
    _.extend(this, _.pick(options, 'data', 'idPrefix', 'templateData'));

    //Override defaults
    this._overrideDefaults(options);

    //Check which fields will be included (defaults to all)
    var selectedFields = this.selectedFields = options.fields || _.keys(schema);

    //Create fields
    var fields = this.fields = {};

    _.each(selectedFields, function(key) {
      var fieldSchema = schema[key];
      fields[key] = this.createField(key, fieldSchema);
    }, this);

    //Create fieldsets
    var fieldsetSchema = options.fieldsets || _.result(this, 'fieldsets') || _.result(this.model, 'fieldsets') || [selectedFields],
        fieldsets = this.fieldsets = [];

    _.each(fieldsetSchema, function(itemSchema) {
      this.fieldsets.push(this.createFieldset(itemSchema));
    }, this);
  },

  createSchema: function(options) {
    //Prefer schema from options
    if (options.schema) return _.result(options, 'schema');

    //Then schema on model
    var model = options.model;
    if (model && model.schema) return _.result(model, 'schema');

    //Then built-in schema
    if (this.schema) return _.result(this, 'schema');

    //Fallback to empty schema
    return {};
  },

  _overrideDefaults: function (options) {
    var defaults = ['template', 'Fieldset', 'Field', 'NestedField'];
    defaults.forEach(function (def) {
      this[def] = options[def] || this[def] || this.constructor[def];
    }, this);
  },

  /**
   * Creates a Fieldset instance
   *
   * @param {String[]|Object[]} schema       Fieldset schema
   *
   * @return {Form.Fieldset}
   */
  createFieldset: function(schema) {
    var options = {
      schema: schema,
      fields: this.fields,
      legend: schema.legend || null
    };

    return new this.Fieldset(options);
  },

  /**
   * Creates a Field instance
   *
   * @param {String} key
   * @param {Object} schema       Field schema
   *
   * @return {Form.Field}
   */
  createField: function(key, schema) {
    var options = {
      form: this,
      key: key,
      schema: schema,
      idPrefix: this.idPrefix
    };

    if (this.model) {
      options.model = this.model;
    } else if (this.data) {
      options.value = this.data[key];
    } else {
      options.value = undefined;
    }

    var field = new this.Field(options);

    this.listenTo(field.editor, 'all', this.handleEditorEvent);

    return field;
  },

  /**
   * Callback for when an editor event is fired.
   * Re-triggers events on the form as key:event and triggers additional form-level events
   *
   * @param {String} event
   * @param {Editor} editor
   */
  handleEditorEvent: function(event, editor) {
    //Re-trigger editor events on the form
    var formEvent = editor.key + ':' + event;

    this.trigger.call(this, formEvent, this, editor, Array.prototype.slice.call(arguments, 2));

    //Trigger additional events
    switch (event) {
      case 'change':
        this.trigger('change', this);
        break;

      case 'focus':
        if (!this.hasFocus) this.trigger('focus', this);
        break;

      case 'blur':
        if (this.hasFocus) {
          //TODO: Is the timeout etc needed?
          setTimeout((function() {
            var focusedField = _.find(this.fields, function(field) {
              return field.editor.hasFocus;
            });

            if (!focusedField) this.trigger('blur', this);
          }).bind(this), 0);
        }
        break;
    }
  },

  templateData: function() {
    return {
      submitButton: this.options.submitButton
    }
  },

  _renderElements: function (selector, $form, cb) {
    var $ = Backbone.$,
      self = this;
    $form.find('[' + selector + ']').add($form).each(function(i, el) {
        var $container = $(el),
          selection = $container.attr(selector);

        if (_.isUndefined(selection)) return;

      cb.call(self, selection, $container);
    });
  },

  _dataEditors: function ($form) {
    var fields = this.fields;

    this._renderElements('data-editors', $form, function (selection, $container) {
        //Work out which fields to include
        var keys = (selection == '*')
          ? this.selectedFields || _.keys(fields)
          : selection.split(',');

        //Add them
        _.each(keys, function(key) {
          var field = fields[key];

          $container.append(field.editor.render().el);
        });
    });
  },

  _dataFields: function ($form) {
    var fields = this.fields;

    this._renderElements('data-fields', $form, function (selection, $container) {
      //Work out which fields to include
      var keys = (selection == '*')
        ? this.selectedFields || _.keys(fields)
        : selection.split(',');

      //Add them
      _.each(keys, function(key) {
        var field = fields[key];
        $container.append(field.render().el);
      });
    });
  },

  _dataFieldsets: function ($form) {
    this._renderElements('data-fieldsets', $form, function (selection, $container) {
      _.each(this.fieldsets, function(fieldset) {
        $container.append(fieldset.render().el);
      }, this);
    });
  },

  _renderedElemens: ['_dataEditors', '_dataFields', '_dataFieldsets'],

  render: function() {
    var $ = Backbone.$;

    //Render form
    var $form = $($.trim(this.template(_.result(this, 'templateData'))));

    //Render standalone editors
    //Render standalone fields
    //Render fieldsets
    this._renderedElemens.forEach(function (render) {
      this[render]($form);
    }, this);

    //Set the main element
    this.setElement($form);

    //Set class
    $form.addClass(this.className);

    //Set attributes
    if (this.attributes) {
      $form.attr(this.attributes)
    }

    return this;
  },

  /**
   * Validate the data
   *
   * @return {Object}       Validation errors
   */
  validate: function(options) {
    var fields = this.fields,
        model = this.model,
        errors = {};

    options = options || {};

    //Collect errors from schema validation
    _.each(fields, function(field) {
      var error = field.validate();
      if (error) {
        errors[field.key] = error;
      }
    });

    //Get errors from default Backbone model validator
    if (!options.skipModelValidate && model && model.validate) {
      var modelErrors = model.validate(this.getValue());

      if (modelErrors) {
        var isDictionary = _.isObject(modelErrors) && !_.isArray(modelErrors);

        //If errors are not in object form then just store on the error object
        if (!isDictionary) {
          errors._others = errors._others || [];
          errors._others.push(modelErrors);
        }

        //Merge programmatic errors (requires model.validate() to return an object e.g. { fieldKey: 'error' })
        if (isDictionary) {
          _.each(modelErrors, function(val, key) {
            //Set error on field if there isn't one already
            if (fields[key] && !errors[key]) {
              fields[key].setError(val);
              errors[key] = val;
            }

            else {
              //Otherwise add to '_others' key
              errors._others = errors._others || [];
              var tmpErr = {};
              tmpErr[key] = val;
              errors._others.push(tmpErr);
            }
          });
        }
      }
    }

    return _.isEmpty(errors) ? null : errors;
  },

  /**
   * Update the model with all latest values.
   *
   * @param {Object} [options]  Options to pass to Model#set (e.g. { silent: true })
   *
   * @return {Object}  Validation errors
   */
  commit: function(options) {
    //Validate
    options = options || {};

    var validateOptions = {
        skipModelValidate: !options.validate
    };

    var errors = this.validate(validateOptions);
    if (errors) return errors;

    //Commit
    var modelError;

    var setOptions = _.extend({
      error: function(model, e) {
        modelError = e;
      }
    }, options);

    this.model.set(this.getValue(), setOptions);

    if (modelError) return modelError;
  },

  /**
   * Get all the field values as an object.
   * Use this method when passing data instead of objects
   *
   * @param {String} [key]    Specific field value to get
   */
  getValue: function(key) {
    //Return only given key if specified
    if (key) return this.fields[key].getValue();

    //Otherwise return entire form
    var values = {};
    _.each(this.fields, function(field) {
      values[field.key] = field.getValue();
    });

    return values;
  },

  /**
   * Update field values, referenced by key
   *
   * @param {Object|String} key     New values to set, or property to set
   * @param val                     Value to set
   */
  setValue: function(prop, val) {
    var data = {};
    if (typeof prop === 'string') {
      data[prop] = val;
    } else {
      data = prop;
    }

    var key;
    for (key in this.schema) {
      if (data[key] !== undefined) {
        this.fields[key].setValue(data[key]);
      }
    }
  },

  /**
   * Returns the editor for a given field key
   *
   * @param {String} key
   *
   * @return {Editor}
   */
  getEditor: function(key) {
    var field = this.fields[key];
    if (!field) throw new Error('Field not found: '+key);

    return field.editor;
  },

  /**
   * Gives the first editor in the form focus
   */
  focus: function() {
    if (this.hasFocus) return;

    //Get the first field
    var fieldset = this.fieldsets[0],
        field = fieldset.getFieldAt(0);

    if (!field) return;

    //Set focus
    field.editor.focus();
  },

  /**
   * Removes focus from the currently focused editor
   */
  blur: function() {
    if (!this.hasFocus) return;

    var focusedField = _.find(this.fields, function(field) {
      return field.editor.hasFocus;
    });

    if (focusedField) focusedField.editor.blur();
  },

  /**
   * Manages the hasFocus property
   *
   * @param {String} event
   */
  trigger: function(event) {
    if (event === 'focus') {
      this.hasFocus = true;
    }
    else if (event === 'blur') {
      this.hasFocus = false;
    }

    return Backbone.View.prototype.trigger.apply(this, arguments);
  },

  /**
   * Override default remove function in order to remove embedded views
   *
   * TODO: If editors are included directly with data-editors="x", they need to be removed
   * May be best to use XView to manage adding/removing views
   */
  remove: function() {
    _.each(this.fieldsets, function(fieldset) {
      fieldset.remove();
    });

    _.each(this.fields, function(field) {
      field.remove();
    });

    return Backbone.View.prototype.remove.call(this);
  }

}, {
    editors: {}

});

//Statics to add on after Form is declared
Form.templateSettings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    escape: /<%-([\s\S]+?)%>/g
};

Form.template = _.template('\
    <form>\
     <div data-fieldsets></div>\
      <% if (submitButton) { %>\
        <button type="submit"><%= submitButton %></button>\
      <% } %>\
    </form>\
  ', null, Form.templateSettings);
