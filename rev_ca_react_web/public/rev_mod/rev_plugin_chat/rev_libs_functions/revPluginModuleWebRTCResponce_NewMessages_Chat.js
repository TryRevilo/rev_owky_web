var revPluginHookCallback = async (revVarArgs) => {
    console.log("- NEW MESSAGE ALLERT +++ " + JSON.stringify(revVarArgs));

    return revVarArgs;
};

module.exports.revPluginHookCallback = revPluginHookCallback;
