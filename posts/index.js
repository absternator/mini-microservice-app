const express = require("express");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());

const posts = {};

app.get("/posts", (req, res) => {
  res.send(posts);
});

app.post("/posts/create", async (req, res) => {
  const id = randomBytes(4).toString("hex");
  const { title } = req.body;
  posts[id] = {
    id,
    title,
  };
  // event bus fire off
  await axios
    .post("http://event-bus-service:4005/events", {
      type: "PostCreated",
      data: { id, title },
    })
    .catch((err) => {
      console.log(err);
    });

  res.status(201).send(posts[id]);
});

app.post("/events", (req, res) => {
  res.send({});
});

app.listen(4000, () => {
  console.log("v55");
  console.log("listening on 4000!");
});
