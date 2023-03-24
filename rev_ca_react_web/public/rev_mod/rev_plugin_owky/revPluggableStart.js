/** REV START PAGE VIEWS */
/** REV END PAGE VIEWS */

const revHookRemoteHandlerReadOwkyTimelineEntities = require("./rev_lib_functions/revHookRemoteHandlerReadOwkyTimelineEntities");
const revHookRemoteHandlerReadOwkyUserMembersEntities = require("./rev_lib_functions/revHookRemoteHandlerReadOwkyUserMembersEntities");
const revHookRemoteHandlerOwky_GetConnRequestEntities = require("./rev_lib_functions/revHookRemoteHandlerOwky_GetConnRequestEntities");
const revHookRemoteHandlerUpdateRelationshipsResStatus = require("./rev_lib_functions/revHookRemoteHandlerUpdateRelationshipsResStatus");

var revStart = () => {
    return {
        "revPluginName": "rev_plugin_activity",
        "revPageViews": [],
        "revPluginHookContextsRemoteArr": ["revHookRemoteHandlerReadOwkyTimelineEntities", "revHookRemoteHandlerReadOwkyUserMembersEntities"],
        "revPluginHookHandlersRemote": [
            { "revNameID": "revHookRemoteHandlerReadOwkyTimelineEntities", "revPluginHookContextRemote": "revHookRemoteHandlerReadOwkyTimelineEntities", "revHandler": revHookRemoteHandlerReadOwkyTimelineEntities.revHookRemoteHandlerCallback.toString() },
            { "revNameID": "revHookRemoteHandlerReadOwkyUserMembersEntities", "revPluginHookContextRemote": "revHookRemoteHandlerReadOwkyUserMembersEntities", "revHandler": revHookRemoteHandlerReadOwkyUserMembersEntities.revHookRemoteHandlerCallback.toString() },
            { "revNameID": "revHookRemoteHandlerOwky_GetConnRequestEntities", "revPluginHookContextRemote": "revHookRemoteHandlerOwky_GetConnRequestEntities", "revHandler": revHookRemoteHandlerOwky_GetConnRequestEntities.revHookRemoteHandlerCallback.toString() },
            { "revNameID": "revHookRemoteHandlerUpdateRelationshipsResStatus", "revPluginHookContextRemote": "revHookRemoteHandlerUpdateRelationshipsResStatus", "revHandler": revHookRemoteHandlerUpdateRelationshipsResStatus.revHookRemoteHandlerCallback.toString() },
        ],
    };
};

module.exports.revStart = revStart;
