const express = require("express");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(express.json());
app.use(cors());

const commentsByPostId = {};

app.get("/comments", (req, res) => {
  res.send(commentsByPostId);
});
app.get("/posts/:id/comments", (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

app.post("/posts/:id/comments", async (req, res) => {
  const commentId = randomBytes(4).toString("hex");
  const { content } = req.body;
  const { id } = req.params;

  const comments = commentsByPostId[id] || [];
  comments.push({ id: commentId, content, status: "pending" });
  commentsByPostId[id] = comments;

  // event bus fire off
  await axios
    .post("http://event-bus-service:4005/events", {
      type: "CommentCreated",
      data: { id: commentId, content, postId: id, status: "pending" },
    })
    .catch((err) => {
      console.log(err);
    });

  res.status(201).send(comments);
});

app.post("/events", async (req, res) => {
  const { type, data } = req.body;

  if (type === "CommentModerated") {
    const { id, postId, status, content } = data;
    const comments = commentsByPostId[postId];
    const comment = comments.find((comment) => comment.id === id);
    comment.status = status;

    await axios
      .post("http://event-bus-service:4005/events", {
        type: "CommentUpdated",
        data: { id, content, postId, status },
      })
      .catch((err) => {
        console.log(err);
      });
  }

  res.send({});
});

app.listen(4001, () => {
  console.log("listening on 4001!");
});
