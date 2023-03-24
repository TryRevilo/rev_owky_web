var revHookRemoteHandlerCallback = async (revVarArgs) => {
    revVarArgs["revAdsArr"] = [];

    if (revVarArgs && revVarArgs.revRemoteHookMethods) {
        let revRemoteHookMethods = revVarArgs.revRemoteHookMethods;
        let revEntityGUID = revVarArgs.revReqParams.rev_entity_guid;

        revVarArgs["revOwkiMemberEntitiesArr"] = [];

        let revSelectSubTypesArr = "rev_user_entity";
        let revOwkiMemberEntitiesArr = await revRemoteHookMethods.revPersReadRevEntities_By_Subtype(revSelectSubTypesArr, 10);

        for (let i = 0; i < revOwkiMemberEntitiesArr.length; i++) {
            let revOwkiMemberEntity = revOwkiMemberEntitiesArr[i];

            let revOwkiMemberEntityGUID = revOwkiMemberEntity._remoteRevEntityGUID;

            /** REV START PICS ALBUM */
            let revPicsAlbumCountVarArgs = {
                "rev_entity_target_guid": revOwkiMemberEntityGUID,
                "rev_rel_type_val_id_arr": "3",
                "rev_res_status": -1,
            };

            let revPicsAlbumCount = await revRemoteHookMethods.revCountRels_By_TargetGUID_RelValId(revPicsAlbumCountVarArgs);

            if (revPicsAlbumCount > 0) {
                let revTimelinePicsAlbum = await revRemoteHookMethods.revFillEntityPicsAlbum(revOwkiMemberEntityGUID);

                if (revTimelinePicsAlbum) {
                    revOwkiMemberEntity._revEntityChildrenList.push(revTimelinePicsAlbum);
                }
            }
            /** REV END PICS ALBUM */

            revVarArgs.revOwkiMemberEntitiesArr.push(revOwkiMemberEntity);
        }
    }

    return revVarArgs;
};

module.exports.revHookRemoteHandlerCallback = revHookRemoteHandlerCallback;
