const User = require("../db").user

async function checkUserExists(username, email){
    User.find({"username": username})
            .then(results => {
                if (results.length === 0) {
                    console.log("No");
                    return false;
                }
            }).catch(err =>{
                console.log(err)
                return false
        });
    User.find({"email": email})
        .then( results => {
            if (results.length === 0) {
                console.log("No");
                return false;
            }
        }).catch(err =>{
            console.log(err)
            return false
    });
    return true;
}

module.exports = {checkUserExists}