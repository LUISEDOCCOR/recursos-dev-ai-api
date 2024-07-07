import express from "express";
import categoryRouter from "./routes/categories.routes.js";
import postRouter from "./routes/posts.routes.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/api", categoryRouter);
app.use("/api", postRouter);

app.get("/api/ok", (req, res) => {
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`APP IN PORT ${PORT}`);
});
