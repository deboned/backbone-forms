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

  triggers: {
    'click': 'change',
    'focus': 'focus',
    'blur': 'blur'
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
