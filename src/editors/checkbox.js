/**
 * Checkbox editor
 *
 * Creates a single checkbox, i.e. boolean value
 */
Form.editors.Checkbox = Form.editors.Base.extend({

  _defaultAttributes: {
    type: 'checkbox'
  },

  defaultValue: false,

  tagName: 'input',

  _defaultEvents: {
    'click':  function(event) {
      this.trigger('change', this);
    },
    'focus':  function(event) {
      this.trigger('focus', this);
    },
    'blur':   function(event) {
      this.trigger('blur', this);
    }
  },

  /**
   * Adds the editor to the DOM
   */
  render: function() {
    this.setValue(this.value);

    return this;
  },

  getValue: function() {
    return this.$el.prop('checked');
  },

  setValue: function(value) {
    this.value = !!value;
    this.$el.prop('checked', this.value);
  },

  focus: function() {
    if (this.hasFocus) return;

    this.$el.focus();
  },

  blur: function() {
    if (!this.hasFocus) return;

    this.$el.blur();
  }

});
