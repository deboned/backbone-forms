/**
 * Hidden editor
 */
Form.editors.Hidden = Form.editors.Text.extend({

  _defaultAttributes: {
    type: 'hidden'
  },

  defaultValue: '',

  noField: true,

  focus: function() {

  },

  blur: function() {

  }

});
