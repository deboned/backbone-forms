;(function(Form, Editor) {
  // var ok = assert.ok
  QUnit.module('TextArea');

  // var same = assert.deepEqual;


  QUnit.module('TextArea#initialize');

  QUnit.test('sets tag type', function(assert) {
    var editor = new Editor();

    assert.ok(editor.$el.is('textarea'));
  });

  QUnit.test('does not set type attribute', function(assert) {
    var editor = new Editor();

    assert.deepEqual(editor.$el.attr('type'), undefined);
  });


})(Backbone.Form, Backbone.Form.editors.TextArea);
