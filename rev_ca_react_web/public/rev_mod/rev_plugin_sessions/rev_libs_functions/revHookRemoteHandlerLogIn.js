var revHookRemoteHandlerCallback = async (revVarArgs) => {
    if (revVarArgs && revVarArgs.revRemoteHookMethods) {
        let revRemoteHookMethods = revVarArgs.revRemoteHookMethods;

        let revUniqueId = revVarArgs.revReqParams.rev_entity_unique_id;
        let revPassword1 = revVarArgs.revReqParams.revPassword1;

        /** REV START GET UNIQUE ID METADATA */

        let revEntityMetadata = await revRemoteHookMethods.revReadUniqueMetadata_By_UniqueValue(revUniqueId);

        if (revEntityMetadata) {
            let revMetadataName = revEntityMetadata._revMetadataName;
            let revMetadataEntityInfoGUID = revEntityMetadata._revMetadataEntityGUID;

            if (revMetadataEntityInfoGUID < 1) {
                return Object.assign(revVarArgs, { revError: "1 Wrong username or Password" });
            }

            let revUserEntityGUID = await revRemoteHookMethods.revReadOwnerEntityGUID_By_RevEntityGUID(revMetadataEntityInfoGUID);

            if (revUserEntityGUID < 1 || revMetadataName.localeCompare("rev_entity_unique_id") !== 0) {
                return Object.assign(revVarArgs, { revError: "2 Wrong username or Password" });
            }

            let revUserEntitySettingsGUID = await revRemoteHookMethods.revGetEntityGUID_By_ContainerGuid_SubType({ "revContainerGUID": revUserEntityGUID, "revEntitySubType": "rev_settings_entity" });

            if (revUserEntitySettingsGUID < 1) {
                return Object.assign(revVarArgs, { revError: "3 Wrong username or Password" });
            }

            let revUserEntitySettingsInfoGUID = await revRemoteHookMethods.revGetEntityGUID_By_ContainerGuid_SubType({ "revContainerGUID": revUserEntitySettingsGUID, "revEntitySubType": "rev_entity_info" });

            if (revUserEntitySettingsInfoGUID < 1) {
                return Object.assign(revVarArgs, { revError: "4 Wrong username or Password" });
            }

            let revReadPassword1Val = await revRemoteHookMethods.revPersReadRevEntityMetadataValue_By_RemoteRevEntityGUID_MetadataName(revUserEntitySettingsInfoGUID, "revPassword1");

            if (revReadPassword1Val.localeCompare(revPassword1) !== 0) {
                return Object.assign(revVarArgs, { revError: "5 Wrong username or Password" });
            }

            let revLoggedInData = await revRemoteHookMethods.revGetFlatEntity(revUserEntityGUID);
            let revLoggedInDataSettings = await revRemoteHookMethods.revGetFlatEntity(revUserEntitySettingsGUID);
            revLoggedInData["_revEntitySettings"] = revLoggedInDataSettings;
            /** REV END GET INIQUE ID METADATA */

            /** REV START LOAD CONNECTIONS */
            let revPassVarArgs_Conn = {
                "revLoggedInEntityGUID": revUserEntityGUID,
                "revRemoteHookMethods": revRemoteHookMethods,
            };

            let revProfileConnEntitiesArr = await revRemoteHookMethods.revPluginHookRemoteEnvironment_GetEntityConns(revPassVarArgs_Conn);
            revVarArgs["revProfileConnEntitiesArr"] = revProfileConnEntitiesArr;
            /** REV END LOAD CONNECTIONS */

            return Object.assign(revVarArgs, { "revLoggedInUserEntity": revLoggedInData });
        }
    }

    return revVarArgs;
};

module.exports.revHookRemoteHandlerCallback = revHookRemoteHandlerCallback;
