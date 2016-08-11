/**
 * Hidden editor
 */
Form.editors.Hidden = Form.editors.Text.extend({

  defaultValue: '',

  noField: true,

  constructor: function(options) {
    Form.editors.Base.apply( this, arguments );

    this.$el.attr('type', 'hidden');
  },

  focus: function() {

  },

  blur: function() {

  }

});
