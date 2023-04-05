const express = require("express");
const { randomBytes } = require("crypto");
const axios = require("axios");

const app = express();
app.use(express.json());

const events = [];

app.post("/events", async (req, res) => {
  const event = req.body;

  events.push(event);

  await axios
    .post("http://posts-clusterip-service:4000/events", event)
    .catch((err) => {
      console.log(err);
    });
  await axios
    .post("http://comments-service:4001/events", event)
    .catch((err) => {
      console.log(err);
    });
  await axios.post("http://query-service:4002/events", event).catch((err) => {
    console.log(err);
  });

  await axios
    .post("http://moderation-service:4003/events", event)
    .catch((err) => {
      console.log(err);
    });

  res.send({ status: "OK" });
});

app.get("/events", (req, res) => {
  res.send(events);
});

app.listen(4005, () => {
  console.log("listening on 4005!");
});
