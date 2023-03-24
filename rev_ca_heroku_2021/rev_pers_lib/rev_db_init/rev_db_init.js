const mysql = require("mysql");

const rev_entity_table_init = require("../rev_entity/rev_pers_rev_entity/rev_pers_lib_create/db_create/rev_entity_table_init");
const rev_entity_metadata_table_init = require("../rev_entity_data/rev_pers_metadata/rev_pers_lib_create/db_create/rev_entity_metadata_table_init");
const rev_entity_annotations_table_init = require("../rev_entity_data/rev_pers_annotations/rev_pers_lib_create/db_create/rev_entity_annotations_table_init");
const rev_entity_relationships_table_init = require("../rev_entity_data/rev_pers_relationships/rev_pers_lib_create/db_create/rev_entity_relationships_table_init");

var pool = mysql.createPool({
    connectionLimit: 10,
    connectTimeout: 60 * 60 * 1000,
    acquireTimeout: 60 * 60 * 1000,
    timeout: 60 * 60 * 1000,
    host: "localhost",
    user: "root",
    password: "",
    database: "rev_c_a",
    charset: "utf8mb4",
});

var getRevConnection = function (callback) {
    pool.getConnection(function (err, connection) {
        if (err) {
            console.error("error connecting: " + err.stack);
            return;
        }

        callback(connection);
    });
};

const revCreateTables = () => {
    rev_entity_table_init.revTableCreate_REV_ENTITY(function (result) {
        console.log(result);
    });

    rev_entity_metadata_table_init.revTableCreate_REV_ENTITY_METADATA((result) => {
        console.log(result);
    });

    rev_entity_annotations_table_init.revTableCreate_REV_ENTITY_ANNOTATIONS((result) => {
        console.log(result);
    });

    rev_entity_relationships_table_init.revTableCreate_REV_ENTITY_RELATIONSHIPS(function (result) {
        console.log(result);
    });
};

module.exports.getRevConnection = getRevConnection;
module.exports.revCreateTables = revCreateTables;
