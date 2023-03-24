var revHookRemoteHandlerCallback = async (revVarArgs) => {
    revVarArgs["revAdsArr"] = [];

    if (revVarArgs && revVarArgs.revRemoteHookMethods) {
        let revRemoteHookMethods = revVarArgs.revRemoteHookMethods;
        let revEntityGUID = revVarArgs.revReqParams.rev_entity_guid;

        revVarArgs["revTimelineEntities"] = [];

        let revSelectSubTypesArr = "rev_kiwi";
        let revTimelineEntitiesArr = await revRemoteHookMethods.revPersReadRevEntities_By_Subtype(revSelectSubTypesArr, 10);

        let revPublishersGUIDsArr = [];

        for (let i = 0; i < revTimelineEntitiesArr.length; i++) {
            let revTimelineEntity = revTimelineEntitiesArr[i];

            if (!revTimelineEntity || !revTimelineEntity._revEntityOwnerGUID || revTimelineEntity._revEntityOwnerGUID < 1) {
                continue;
            }

            revPublishersGUIDsArr.push(revTimelineEntity._revEntityOwnerGUID);
        }

        /** REV START PUBLISHERS */
        let revGetPublishersArr = await revRemoteHookMethods.revGetFilledEntities(revPublishersGUIDsArr);

        if (!revVarArgs.hasOwnProperty("revEntityPublishersArr")) {
            revVarArgs["revEntityPublishersArr"] = revGetPublishersArr;
        } else {
            revVarArgs.revEntityPublishersArr = revVarArgs.revEntityPublishersArr.concat(revGetPublishersArr);
        }
        /** REV END PUBLISHERS */

        for (let i = 0; i < revTimelineEntitiesArr.length; i++) {
            let revTimelineEntity = revTimelineEntitiesArr[i];

            let revTimelineEntityGUID = revTimelineEntity._remoteRevEntityGUID;

            /** REV START PICS ALBUM */
            let revPicsAlbumCountVarArgs = {
                "rev_entity_target_guid": revTimelineEntityGUID,
                "rev_rel_type_val_id_arr": "3",
                "rev_res_status": -1,
            };

            let revPicsAlbumCount = await revRemoteHookMethods.revCountRels_By_TargetGUID_RelValId(revPicsAlbumCountVarArgs);

            if (revPicsAlbumCount > 0) {
                let revTimelinePicsAlbum = await revRemoteHookMethods.revFillEntityPicsAlbum(revTimelineEntityGUID);

                if (revTimelinePicsAlbum) {
                    revTimelineEntity._revEntityChildrenList.push(revTimelinePicsAlbum);
                }
            }
            /** REV END PICS ALBUM */

            revVarArgs.revTimelineEntities.push(revTimelineEntity);
        }
    }

    return revVarArgs;
};

module.exports.revHookRemoteHandlerCallback = revHookRemoteHandlerCallback;
