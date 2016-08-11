/**
 * Password editor
 */
Form.editors.Password = Form.editors.Text.extend({

  constructor: function(options) {
    Form.editors.Text.apply( this, arguments );

    this.$el.attr('type', 'password');
  }

});
