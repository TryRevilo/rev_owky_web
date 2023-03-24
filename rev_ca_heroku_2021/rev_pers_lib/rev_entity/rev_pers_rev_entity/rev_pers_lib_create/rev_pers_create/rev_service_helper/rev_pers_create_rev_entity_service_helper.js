const rev_pers_rev_entity_accessor = require("../rev_accessor/rev_pers_rev_entity_accessor");
const rev_pers_read_rev_entity_service_helper = require("../../../rev_pers_lib_read/rev_service_heper/rev_pers_read_rev_entity_service_helper");
const rev_pers_create_metadata_service_helper = require("../../../../../rev_entity_data/rev_pers_metadata/rev_pers_lib_create/rev_pers_create/rev_service_heper/rev_pers_create_metadata_service_helper");
const rev_pers_read_rev_entity_metadata_service_helper = require("../../../../../rev_entity_data/rev_pers_metadata/rev_pers_lib_read/rev_service_helper/rev_pers_read_rev_entity_metadata_service_helper");
const rev_pers_create_rev_entity_rel_service_helper = require("../../../../../rev_entity_data/rev_pers_relationships/rev_pers_lib_create/rev_pers_create/rev_service_heper/rev_pers_create_rev_entity_rel_service_helper");
const rev_pers_read_rev_entity_relationship_service_helper = require("../../../../../rev_entity_data/rev_pers_relationships/rev_pers_lib_read/rev_service_helper/rev_pers_read_rev_entity_relationship_service_helper");

const rev_db_entity_metadata_const_resolver = require("../../../../../rev_entity_data/rev_pers_metadata/rev_db_models/rev_db_entity_metadata_const_resolver");
const rev_db_rels_const_resolver = require("../../../../../rev_entity_data/rev_pers_relationships/rev_db_models/rev_db_rels_const_resolver");

const rev_json_functions = require("../../../../../../rev_helper_functions/rev_json_functions");

let revPersSaveRevEntityItem = (revData) => {
    return new Promise(function (resolve, reject) {
        rev_pers_rev_entity_accessor.revPersSaveRevEntity(revData, function (result) {
            resolve(result);
        });
    });
};

var revUserEntityExista = async (revUsername) => {
    // return await rev_pers_read_rev_entity_metadata_service_helper.revPersMetadataValueExists_By_MetadataName_MetadataValue_Serv("rev_user_entity_email_value", revUsername);
    return await rev_pers_read_rev_entity_metadata_service_helper.revPersMetadataValueExists_By_MetadataName_MetadataValue_Serv("rev_entity_unique_id", revUsername);
};

function revSaveRevEntityPromise_Serv(nextID, revCurrentIndex, revArray) {
    if (!nextID) {
        return;
    }

    return new Promise(async (resolve, reject) => {
        let retRevEntity = { "_revEntityGUID": nextID._revEntityGUID };
        retRevEntity["_revEntityOwnerGUID"] = nextID._revEntityOwnerGUID;

        let revTimeCreated = nextID._revTimeCreated;
        let revEntitySubType = nextID._revEntitySubType;

        if (revEntitySubType.localeCompare("rev_entity_info") == 0 || !revTimeCreated || revTimeCreated.length == 0) {
            revArray[revCurrentIndex] = retRevEntity;
            return resolve(null);
        }

        let revEntityExistaGUID = -1;

        if (nextID._revEntityType === "rev_user_entity") {
            if (rev_json_functions.revIsEmptyJSONObject(nextID._revInfoEntity)) {
                return resolve(null);
            }

            let revEntityUniqueId = rev_db_entity_metadata_const_resolver.revGetMetadataValue(nextID._revInfoEntity["_revEntityMetadataList"], "rev_entity_unique_id");

            revEntityExistaGUID = await revUserEntityExista(revEntityUniqueId);
        }

        if (revEntityExistaGUID == -1) {
            let resRevEntityGUID = await revPersSaveRevEntityItem(nextID);

            if (resRevEntityGUID == -1) {
                return resolve(null);
            }

            retRevEntity["_remoteRevEntityGUID"] = resRevEntityGUID;
            retRevEntity["_revTimePublished"] = await rev_pers_read_rev_entity_service_helper.revPersReadRevPublishedDate_By_RevEntityGUID_Serv(resRevEntityGUID);

            if (Object.keys(nextID._revEntityMetadataList).length) {
                let revEntityMetadataList = nextID._revEntityMetadataList;

                let revPersMetadataRes = await rev_pers_create_metadata_service_helper.createNewRevMetadataArrayService(revEntityMetadataList, resRevEntityGUID);

                if (revPersMetadataRes && revPersMetadataRes.filter) {
                    retRevEntity["_revEntityMetadataList"] = revPersMetadataRes.filter;
                }
            }

            /** START REV SAVE ENTITY INFO */
            if (nextID._revInfoEntity && !rev_json_functions.revIsEmptyJSONObject(nextID._revInfoEntity)) {
                nextID._revInfoEntity._revEntityOwnerGUID = resRevEntityGUID;
                nextID._revInfoEntity._revEntityContainerGUID = resRevEntityGUID;
                let resEntityInfoGUID = await revPersSaveRevEntityItem(nextID._revInfoEntity);

                let revInfoRel = rev_db_rels_const_resolver.REV_ENTITY_RELATIONSHIP_STRUCT();
                revInfoRel._revEntityRelationshipType = "rev_entity_info";
                revInfoRel._revOwnerGUID = retRevEntity._revEntityOwnerGUID;
                revInfoRel._remoteRevEntityTargetGUID = resRevEntityGUID;
                revInfoRel._revEntitySubjectGUID = resEntityInfoGUID;
                revInfoRel._remoteRevEntitySubjectGUID = resEntityInfoGUID;

                if (resRevEntityGUID && resEntityInfoGUID) {
                    let revInfoRelResult = await rev_pers_create_rev_entity_rel_service_helper.revPersSaveRevRelItem_serv(revInfoRel);
                    retRevEntity["_revEntityInfoRelationship"] = revInfoRelResult;
                }

                retRevEntity["_revInfoEntity"] = { _revEntityGUID: nextID._revInfoEntity._revEntityGUID, _remoteRevEntityGUID: resEntityInfoGUID };

                if (nextID._revInfoEntity && Array.isArray(nextID._revInfoEntity._revEntityMetadataList)) {
                    let revEntityInfoMetadataList = nextID._revInfoEntity._revEntityMetadataList;

                    let revPersInfoMetadataRes = await rev_pers_create_metadata_service_helper.createNewRevMetadataArrayService(revEntityInfoMetadataList, resEntityInfoGUID);

                    if (revPersInfoMetadataRes && revPersInfoMetadataRes.filter) {
                        retRevEntity["_revEntityMetadataList"] = revPersInfoMetadataRes.filter;
                    }
                }
            }
            /** END REV SAVE ENTITY INFO */
        } else {
            if (!nextID.hasOwnProperty("_revInfoEntity") || rev_json_functions.revIsEmptyJSONObject(nextID._revInfoEntity)) {
                return resolve(null);
            }

            let revLocalInfoEntity = nextID._revInfoEntity;
            let revLocalInfoEntityGUID = revLocalInfoEntity._revEntityGUID;

            let revEntityGUID = await rev_pers_read_rev_entity_relationship_service_helper.revPersReadRevEntityRelTargetGUID_By_SubjectGUID_RevRelId_Serv(revEntityExistaGUID, 0);
            let revEntity = await rev_pers_read_rev_entity_service_helper.promiseToReadRevEntityByRemoteRevEntityGUID(revEntityGUID);

            retRevEntity["revEntityGUID"] = nextID._revEntityGUID;
            retRevEntity["_remoteRevEntityGUID"] = revEntityGUID;
            retRevEntity["_revOwnerGUID"] = revEntity.REV_ENTITY_OWNER_GUID;
            retRevEntity["_revTimePublished"] = revEntity.REV_PUBLISHED_DATE;
            retRevEntity["_revTimePublishedUpdated"] = revEntity.REV_UPDATED_DATE;

            let revEntityRetMetadata = await rev_pers_read_rev_entity_metadata_service_helper.promiseToGetUnresolvedRevEntityMetadataServ(revEntityGUID);

            if (revEntityRetMetadata && revEntityRetMetadata.filter) {
                retRevEntity["_revEntityMetadataList"] = revEntityRetMetadata.filter;
            }

            let revUserEntityInfo = await rev_pers_read_rev_entity_service_helper.promiseToReadRevEntityByRemoteRevEntityGUID(revEntityExistaGUID);

            let revInfoEntityMetadataList = await rev_pers_read_rev_entity_metadata_service_helper.promiseToGetUnresolvedRevEntityMetadataServ(revEntityExistaGUID);

            let revInfoEntity = {
                "revEntityGUID": revLocalInfoEntityGUID,
                "_remoteRevEntityGUID": revEntityExistaGUID,
                "_revEntityMetadataList": revInfoEntityMetadataList.filter,
                "_revTimePublished": revUserEntityInfo.REV_PUBLISHED_DATE,
                "_revTimePublishedUpdated": revUserEntityInfo.REV_UPDATED_DATE,
            };

            retRevEntity["_revInfoEntity"] = revInfoEntity;
        }

        let revSubjectEntityRelationships;
        if (nextID._revSubjectEntityRelationships) {
            revSubjectEntityRelationships = nextID._revSubjectEntityRelationships;
        }

        if (revSubjectEntityRelationships && Array.isArray(revSubjectEntityRelationships) && revSubjectEntityRelationships.length > 0) {
            for (let i = 0; i < revSubjectEntityRelationships.length; i++) {
                nextID._revSubjectEntityRelationships[i]._revEntitySubjectGUID = retRevEntity._remoteRevEntityGUID;
                nextID._revSubjectEntityRelationships[i]._remoteRevEntitySubjectGUID = retRevEntity._remoteRevEntityGUID;

                if (!nextID._revSubjectEntityRelationships[i]["_revOwnerGUID"] || nextID._revSubjectEntityRelationships[i]["_revOwnerGUID"] < 1) {
                    nextID._revSubjectEntityRelationships[i]["_revOwnerGUID"] = nextID._revEntityOwnerGUID;
                }
            }

            let revNewSubjectEntityRelationshipsArr = await rev_pers_create_rev_entity_rel_service_helper.createNewRevEntitiesRelationshipsArrayService(nextID._revSubjectEntityRelationships);
            retRevEntity["_revSubjectEntityRelationships"] = revNewSubjectEntityRelationshipsArr;
        }

        let revTargetEntityRelationships;
        if (nextID._revTargetEntityRelationships) {
            revTargetEntityRelationships = nextID._revTargetEntityRelationships;
        }

        if (revTargetEntityRelationships && Array.isArray(revTargetEntityRelationships) && revTargetEntityRelationships.length) {
            for (let i = 0; i < revTargetEntityRelationships.length; i++) {
                if (!nextID._revTargetEntityRelationships[i]) {
                    continue;
                }

                nextID._revTargetEntityRelationships[i]._revEntityTargetGUID = retRevEntity._remoteRevEntityGUID;
                nextID._revTargetEntityRelationships[i]._remoteRevEntityTargetGUID = retRevEntity._remoteRevEntityGUID;

                if (!nextID._revTargetEntityRelationships[i]["_revOwnerGUID"] || nextID._revTargetEntityRelationships[i]["_revOwnerGUID"] < 1) {
                    nextID._revTargetEntityRelationships[i]["_revOwnerGUID"] = nextID._revEntityOwnerGUID;
                }
            }

            let revNewTargetEntityRelationshipsArr = await rev_pers_create_rev_entity_rel_service_helper.createNewRevEntitiesRelationshipsArrayService(nextID._revTargetEntityRelationships);
            retRevEntity["_revTargetEntityRelationships"] = revNewTargetEntityRelationshipsArr;
        }

        if (Array.isArray(nextID._revPersContainerChildren) && nextID._revPersContainerChildren.length > 0) {
            let revPersContainerChildrenArr = nextID._revPersContainerChildren;

            for (let i = 0; i < revPersContainerChildrenArr.length; i++) {
                if (!retRevEntity || retRevEntity._remoteRevEntityGUID < 1 || !revPersContainerChildrenArr[i]) {
                    continue;
                }

                revPersContainerChildrenArr[i]._revEntityContainerGUID = retRevEntity._remoteRevEntityGUID;

                try {
                    await [revPersContainerChildrenArr[i]].reduce((previousPromise, nextID, revCurrentIndex, revArray) => {
                        return previousPromise.then(() => {
                            return revSaveRevEntityPromise_Serv(nextID, null, revCurrentIndex, revArray);
                        });
                    }, Promise.resolve());
                } catch (error) {
                    console.log("ERR -> revSaveRevEntityPromise_Serv -> " + error);
                }
            }
        }

        revArray[revCurrentIndex] = retRevEntity;

        resolve(retRevEntity);
    });
}

var createNewRevEntitiesArray_Serv = async (revEntities, callback) => {
    let filterRevRetArr = {
        "revPersOptions": {
            "revPersType": "rev_create",
        },
        "filter": [],
    };

    try {
        await revEntities.reduce((previousPromise, nextID, revCurrentIndex, revArray) => {
            return previousPromise.then(() => {
                return revSaveRevEntityPromise_Serv(nextID, revCurrentIndex, revArray);
            });
        }, Promise.resolve());
    } catch (error) {
        console.log("ERR -> createNewRevEntitiesArray_Serv -> " + error);
    }

    filterRevRetArr.filter = revEntities;

    if (callback) {
        callback(filterRevRetArr);
    } else {
        return filterRevRetArr;
    }
};

module.exports.revSaveRevEntityPromise_Serv = revSaveRevEntityPromise_Serv;
module.exports.createNewRevEntitiesArray_Serv = createNewRevEntitiesArray_Serv;
