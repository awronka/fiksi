//Services to interact with nodewebkit GUI and Window
app.factory('GUI', function () {
    //Return nw.gui
    return require('nw.gui');
});
app.factory('Window', function (GUI) {
    return GUI.Window.get();
});