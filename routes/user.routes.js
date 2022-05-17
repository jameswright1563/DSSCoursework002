const User = require("../db").user

async function checkUserExists(username, email){
    try {
        User.find({"username": username})
            .toArray((err, results) => {
                if (results.length === 0) {
                    console.log("No");
                    return false;
                }
            });
    }   catch (e){
        return false;
    }
    try {
        User.find({"email": email})
            .toArray((err, results) => {
                if (results.length === 0) {
                    console.log("No");
                    return false;
                }
            });
    }   catch (e){
        return false;
    }
    return true;
}

module.exports = {checkUserExists}