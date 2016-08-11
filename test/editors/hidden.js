;(function(Form, Editor) {

  // var equal = assert.equal
  // var ok = assert.ok
  // var deepEqual = assert.deepEqual

  QUnit.module('Hidden');

  // var same = assert.deepEqual;


  QUnit.module('Hidden#initialize');

  QUnit.test('sets input type', function(assert) {
    var editor = new Editor();

    assert.deepEqual(editor.$el.attr('type'), 'hidden');
  });

  QUnit.test('Default value', function(assert) {
    var editor = new Editor().render();

    assert.equal(editor.getValue(), '');
  });

  QUnit.test('sets noField property so that the wrapping field is not rendered', function(assert) {
    var editor = new Editor();

    assert.deepEqual(editor.noField, true);
  });

})(Backbone.Form, Backbone.Form.editors.Hidden);
