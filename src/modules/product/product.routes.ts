import { Router } from "express";
import { ProductController } from "./product.controller";

const router = Router();
const controller = new ProductController();

router.post("/", controller.create.bind(controller));
router.get("/", controller.findAll.bind(controller));
router.get("/:id", controller.findOne.bind(controller));
router.put("/:id", controller.update.bind(controller));
router.delete("/:id", controller.delete.bind(controller));

export default router;
