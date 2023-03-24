var revPrePluginInitCallback = async (revVarArgs) => {
    if (revVarArgs && revVarArgs.revRemoteHookMethods) {
        let revRemoteHookMethods = revVarArgs.revRemoteHookMethods;

        let revEntityPluginVids = await revRemoteHookMethods.revGetPluginEntity_By_Plugin_Name("rev_plugin_videos");

        let revEntityPluginVidsOwnerGUID = Number(revEntityPluginVids._revEntityOwnerGUID);
        let revEntityPluginVidsGUID = Number(revEntityPluginVids._remoteRevEntityGUID);

        /** REV START INIT CACHE DATA ARRAYS */
        let revArrayId = "revTrendingVidsGUIDsArr_" + revEntityPluginVidsGUID;

        let revDataObjectArrayVarArgs = {
            "revSessionId": "2727g5gm",
            "revDataArrayId": revArrayId,
            "revPluginDataArrayOwnerGUID": revEntityPluginVidsOwnerGUID,
            "revLoggedInEntityGUID": revEntityPluginVidsOwnerGUID,
            "revEntityGUID": revEntityPluginVidsGUID,
            "revIsWritable": true,
        };

        let revCacheDataArrayInit = revRemoteHookMethods.revCacheDataArrayInit(revDataObjectArrayVarArgs);

        let revPersReadRevEntityMetadataArr = await revRemoteHookMethods.revReadEntityMetadataArr_By_MetadataName({ "revMetadataName": "rev_vid_play_count" });

        for (let i = 0; i < revPersReadRevEntityMetadataArr.length; i++) {
            let revCurrEntityMetadata = revPersReadRevEntityMetadataArr[i];
            let revPluginDataItem = revCurrEntityMetadata._revMetadataEntityGUID;

            let revDataObjectId = "revVidTrendingData_" + revPluginDataItem;

            let revVidTrendingAverage = 222;
            let revVidsClicksStatsCount = 222;
            let revVidViews = 1;
            let revVidPlayCount = 1;

            /** REV START VID CLICKS STATS */
            let revEntityStatsWrapperNameId = "rev_vid_play_count";

            let revPassVarArgs = {
                "revEntityGUID": revPluginDataItem,
                "revEntityStatsWrapperNameId": revEntityStatsWrapperNameId,
                "revEntityStatsWrapperDefVal": revVidTrendingAverage,
            };

            let revEntityMetadataStatsWrapper = await revRemoteHookMethods.revGetEntityStatsWrapper(revPassVarArgs);

            let remoteRevMetadataId = revEntityMetadataStatsWrapper.remoteRevMetadataId;
            revVidTrendingAverage = Number(revEntityMetadataStatsWrapper._metadataValue);
            /** REV END VID CLICKS STATS */

            /** REV START SET DATA OBJECT */
            let revSetDataObjectValsVarArgs = {
                "revSessionId": "2727g5gm",
                "revDataObjectId": revDataObjectId,
                "revLoggedInEntityGUID": revEntityPluginVidsOwnerGUID,
                "revEntityGUID": revPluginDataItem,
                "revDataObjectUpdateVals": {
                    "rev_vid_trending_average": revVidTrendingAverage,
                    "rev_clicks": revVidsClicksStatsCount,
                    "rev_views": revVidViews,
                    "rev_vid_play_count": revVidPlayCount,
                    "rev_vid_views": revVidViews,
                },
            };
            /** REV END SET DATA OBJECT */

            /** REV START SET DATA ARRAY */
            let revRetSetDataObjects = revRemoteHookMethods.revSetCaheDataObjectVals(revSetDataObjectValsVarArgs);

            let revSetDataObjectArrayValsVarArgs = {
                "revSessionId": "2727g5gm",
                "revDataArrayId": revArrayId,
                "revLoggedInEntityGUID": revEntityPluginVidsOwnerGUID,
                "revEntityGUID": revEntityPluginVidsGUID,
                "revDataObjectUpdateVals": [revPluginDataItem],
                "revDataObjectVal": revPluginDataItem,
            };

            let revSplicedPluginDataArray = revRemoteHookMethods.revGetPluginDataArray(revSetDataObjectArrayValsVarArgs).revDataArrayVals;
            /** REV END SET DATA ARRAY */

            /** REV START SPLICE AND RE-ARRANGE DATA ARRAY */
            let revSpliceIndex = revSplicedPluginDataArray.length;

            for (let i = 0; i < revSplicedPluginDataArray.length; i++) {
                let revPluginDataItem = revSplicedPluginDataArray[i];

                let revCurrDataObjectValsVarArgs = {
                    "revSessionId": "2727g5gm",
                    "revDataObjectId": "revVidTrendingData_" + revPluginDataItem,
                    "revLoggedInEntityGUID": revEntityPluginVidsOwnerGUID,
                    "revEntityGUID": revPluginDataItem,
                    "revDataObjectValIdsArr": ["rev_vid_trending_average", "rev_clicks", "rev_views", "rev_vid_play_count", "rev_vid_views"],
                };

                let revCurrCachedPluginsObjectVals = revRemoteHookMethods.revGetCachedPluginsObjectVals(revCurrDataObjectValsVarArgs);

                if (!revCurrCachedPluginsObjectVals || !revCurrCachedPluginsObjectVals.rev_vid_trending_average) {
                    continue;
                }

                let revCurrVidTrendingAverage = revCurrCachedPluginsObjectVals.rev_vid_trending_average;

                if (Number(revCurrVidTrendingAverage) <= Number(revVidTrendingAverage)) {
                    revSpliceIndex = i;

                    break;
                }
            }

            revSetDataObjectArrayValsVarArgs["revSpliceStartIndex"] = revSpliceIndex;
            revSetDataObjectArrayValsVarArgs["revDeleteCount"] = 0;
            revSetDataObjectArrayValsVarArgs["revDataObjectUpdateVal"] = revPluginDataItem;

            let revSpliceStartIndex = revRemoteHookMethods.revSpliceCaheArrayDataVals(revSetDataObjectArrayValsVarArgs);
            /** REV END SPLICE AND RE-ARRANGE DATA ARRAY */
        }
    }

    return revVarArgs;
};

module.exports.revPrePluginInitCallback = revPrePluginInitCallback;
