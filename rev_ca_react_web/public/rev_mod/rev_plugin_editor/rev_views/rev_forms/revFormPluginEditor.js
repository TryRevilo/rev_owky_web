const revFormPluginEditor_Widget = require("./rev_form_view_widgets/revFormPluginEditor_Widget");

var revPluginOverrideView = () => {
    return {
        "rev_plugin_name": "rev_plugin_editor",
        "revNameId": "revFormPluginEditor",
        "revOverrideView": revFormPluginEditor_Widget.revFormViewWidget.toString(),
        "revMenuAreas": [],
        "revMenuItems": [],
        // 'revCSSFiles': ['/rev_plugin_editor/rev_views/rev_forms/rev_form_view_widgets/revFormPluginEditor_Widget.css']
    };
};

module.exports.revPluginOverrideView = revPluginOverrideView;
