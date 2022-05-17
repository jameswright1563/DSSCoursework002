const User = require("../db").user

function checkUserExists(username){
    try {
        User.find({"username": username})
            .toArray((err, results) => {
                if (results.length === 0) {
                    console.log("No");
                    return false;
                }
                return true;
            });
    }   catch (e){
        return false;
    }
}

module.exports = {checkUserExists}