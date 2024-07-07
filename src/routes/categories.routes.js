import { Router } from "express";
import { prisma } from "../prisma.js";
import { createResponse } from "../utils/response.js";

const router = Router();

router.get("/categories", async (req, res) => {
  try {
    const categories = await prisma.category.findMany();
    res.status(200).json(categories);
  } catch (e) {
    res.status(500).json(createResponse("Error in server", "error"));
  }
});

router.get("/category/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const posts = await prisma.category.findMany({
      where: {
        id: id,
      },
      include: {
        posts: true,
      },
    });
    res.status(200).json(posts);
  } catch (e) {
    res.status(500).json(createResponse("Error in server", "error"));
  }
});

export default router;
