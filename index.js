import express from "express";
import "dotenv"
import cors from "corss"
import categoryRouter from "./src/routes/categories.routes.js";
import postRouter from "./src/routes/posts.routes.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors())
app.use("/api", categoryRouter);
app.use("/api", postRouter);

app.get("/api/ok", (req, res) => {
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`APP IN PORT ${PORT}`);
});
