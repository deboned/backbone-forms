/**
 * TextArea editor
 */
Form.editors.TextArea = Form.editors.Text.extend({

  tagName: 'textarea',

  _defaultAttributes: {
    type: void 0
  },
  /**
   * Override Text constructor so type property isn't set (issue #261)
   */
  constructor: function(options) {
    Form.editors.Base.apply( this, arguments );
  }

});
