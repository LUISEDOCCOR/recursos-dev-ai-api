import { Router } from "express";
import { prisma } from "../prisma.js";
import { createResponse } from "../utils/response.js";

const router = Router();

router.post("/post/create", async (req, res) => {
  try {
    const title = req.body.title;
    const content = req.body.content;
    const src = req.body.src;
    const categorie_id = req.body.categorie_id;

    if (!title || !src || !categorie_id) {
      res.status(400).json(createResponse("All fields are necessary", "error"));
      return;
    }

    const post = await prisma.post.create({
      data: {
        title: title,
        content: content || "",
        src: src,
        category_id: parseInt(categorie_id),
      },
    });

    res.status(200).json(post);
  } catch (error) {
    res.json(createResponse(error.name || error, "error"));
  }
});

router.get("/posts", async (req, res) => {
  try {
    const posts = await prisma.post.findMany();
    res.json(posts);
  } catch (error) {
    res.json(createResponse("Error in server", "error"));
  }
});

export default router;
