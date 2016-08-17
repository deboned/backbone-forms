/**
 * Text
 * 
 * Text input with focus, blur and change events
 */
Form.editors.Text = Form.Editor.extend({

  tagName: 'input',

  _defaultAttributes: {
    type: 'text'
  },

  defaultValue: '',

  previousValue: '',

  triggers: {
    'select': 'select',
    'focus': 'focus',
    'blur': 'blur'
  },

  _defaultEvents: {
    'keyup':    'determineChange',
    'keypress': function(event) {
      setTimeout((function() {
        this.determineChange();
      }).bind(this), 0);
    }
  },

  constructor: function(options) {
    Form.editors.Base.apply( this, arguments );

    var schema = this.schema;

    //Allow customising text type (email, phone etc.) for HTML5 browsers
    var type;

    if (schema && schema.editorAttrs && schema.editorAttrs.type) type = schema.editorAttrs.type;
    if (schema && schema.dataType) type = schema.dataType;

    type && this.$el.attr('type', type);
  },

  /**
   * Adds the editor to the DOM
   */
  render: function() {
    this.setValue(this.value);

    return this;
  },

  determineChange: function(event) {
    var currentValue = this.$el.val();
    var changed = (currentValue !== this.previousValue);

    if (changed) {
      this.previousValue = currentValue;

      this.trigger('change', this);
    }
  },

  /**
   * Returns the current editor value
   * @return {String}
   */
  getValue: function() {
    return this.$el.val();
  },

  /**
   * Sets the value of the form element
   * @param {String}
   */
  setValue: function(value) {
    this.value = value;
    this.$el.val(value);
  },

  focus: function() {
    if (this.hasFocus) return;

    this.$el.focus();
  },

  blur: function() {
    if (!this.hasFocus) return;

    this.$el.blur();
  },

  select: function() {
    this.$el.select();
  }

});
