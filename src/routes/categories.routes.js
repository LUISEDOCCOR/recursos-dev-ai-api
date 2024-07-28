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
export default router;
