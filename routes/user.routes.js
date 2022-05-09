const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");
const router = require("./index");
const db = require("../db.js")
//Is there an existing user - ----------> Do not create again.

// @/routes/users.js
// /session/first/session/view commented or deleted.
// This file is before app.user(session(...), so req.session is not available.
// //View session
// router.get('/session/first', (req, res, next) => {
//   let s = req.session
//   console.log(s)
//   res.send(s)
// })
// //Save views in session
// router.get('/session/view', (req, res, next) => {
//   let s = req.session
//   if (req.session.views) {
//     req.session.views++
//     res.send(`views: ${req.session.views} time.`)
//   } else {
//     req.session.views = 1
//     res.send('views: 1')
//   }
// })

router.post('/signup', (req, res, next) => {
  console.log(req.body)
  conn.collection("users").findOne({username: req.body.username}).then(user => {
    if (user === null) {
      return db.user.create({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
      })
    } else {
      var err = new Error(`User ${req.body.username} already exist!`)
      err.status = 403
      next(err)
    }
  }).then(user => {
    res.statusCode = 200
    res.json({status: 'registration successful', user: user})
  }).catch(err => {
    res.send(err)
  })
})

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  app.get("/api/test/all", controller.allAccess);
  app.get("/api/test/user", [authJwt.verifyToken], controller.userBoard);
  app.get(
    "/api/test/mod",
    [authJwt.verifyToken, authJwt.isModerator],
    controller.moderatorBoard
  );
  app.get(
    "/api/test/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.adminBoard
  );
};