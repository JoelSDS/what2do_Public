// routes/event.routes.js
const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event.controller");
const isAuthenticated = require("../middleware/isAuthenticated.js");

router.get("/events", eventController.findAll);

router.get(
  "/establishments/:establishmentId/events",
  eventController.findAllEstablishmentEvents
);

router.get("/events/:id", eventController.findById);

router.post("/events", isAuthenticated, eventController.create);

router.put("/events/:eventId", eventController.update);

router.delete("/events/:eventId", eventController.delete);

module.exports = router;
