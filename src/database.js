import firebird from "node-firebird";

const dbOptions = {
    host: 'localhost',
    port: 3050,
    database: 'D:\\Projetos\\Ofigest\\src\\db\\OFIGEST.FDB',    
    user: "SYSDBA",
    password: "masterkey",
    lowercase_keys: false,
    role: null,
    pageSize: 8192,
    encryption: false,
    timeout: 30000,
};

function executeQuery(ssql, params, callback){
    firebird.attach(dbOptions, function(err, db) {
        if (err) {
            return callback(err, []); 
        } 
        db.query(ssql, params, function(err, result) {
            db.detach();
            if (err) {
                return callback(err, []);
            } else {
                return callback(undefined, result);
            }
        });
    });
}

async function executeQueryTrx(transaction, ssql, parameters){
    return new Promise(function (resolve, reject) {
        transaction.query(ssql, parameters, function(err, result){
            if (err) {
                return reject(err);
            } else {
                return resolve(result);
            }
        });
    });
}

export { executeQuery, firebird, dbOptions, executeQueryTrx };
