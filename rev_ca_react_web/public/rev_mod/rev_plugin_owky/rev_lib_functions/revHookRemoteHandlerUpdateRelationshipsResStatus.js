var revHookRemoteHandlerCallback = async (revVarArgs) => {
    if (revVarArgs && revVarArgs.revRemoteHookMethods) {
        let revRemoteHookMethods = revVarArgs.revRemoteHookMethods;

        let revReqBody = revVarArgs.revReqBody;

        let revLoggedInEntityGUID = revReqBody.revLoggedInEntityGUID;
        let revUpdateRelsResStatusArr = revReqBody.revUpdateRelsResStatusArr;

        /** REV START UPDATE RELS RES STATUS */
        if (Array.isArray && revUpdateRelsResStatusArr.length) {
            let revRetData = { revSuccess: [], revFail: [] };

            for (let i = 0; i < revUpdateRelsResStatusArr.length; i++) {
                let revCurrRel = revUpdateRelsResStatusArr[i];

                let revResolveStatus = revCurrRel.revResolveStatus;
                let revEntityRelationshipId = revCurrRel.revEntityRelationshipId;

                if (revResolveStatus < 1 || revEntityRelationshipId < 1) {
                    continue;
                }

                let revUpdateRelRes = await revRemoteHookMethods.revSetRelResStatus(revResolveStatus, revEntityRelationshipId);
                let revPersResolveStatus = revUpdateRelRes._revResolveStatus;

                if (revPersResolveStatus > 0) {
                    revRetData.revSuccess.push(revCurrRel.revEntityRelationshipId);
                } else {
                    revRetData.revFail.push(revCurrRel.revEntityRelationshipId);
                }
            }

            revVarArgs["revRelResStatusRetData"] = revRetData;
        }
        /** REV END UPDATE RELS RES STATUS */
    }

    return revVarArgs;
};

module.exports.revHookRemoteHandlerCallback = revHookRemoteHandlerCallback;
