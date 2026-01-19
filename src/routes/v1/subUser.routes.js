const express = require("express");
const subUserController = require("../../controllers/subUser.controller");
const auth = require("../../modules/auth/middlewares/auth.middleware");

const router = express.Router();

router.post("/createSubuser", auth(), subUserController.createSubUser);

router
    .route("/")
    .get(auth(), subUserController.getSubUsers);

router
    .route("/:id")
    .get(auth(), subUserController.getSubUserById)
    .put(auth(), subUserController.updateSubUser);

module.exports = router;
