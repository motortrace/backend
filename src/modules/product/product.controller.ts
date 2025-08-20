import { Request, Response } from "express";
import { ProductService } from "./product.service";

const service = new ProductService();

export class ProductController {
  async create(req: Request, res: Response) {
    try {
      const product = await service.createProduct(req.body);
      res.status(201).json(product);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async findAll(req: Request, res: Response) {
    const products = await service.getProducts();
    res.json(products);
  }

  async findOne(req: Request, res: Response) {
    try {
      const product = await service.getProductById(req.params.id);
      res.json(product);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const product = await service.updateProduct(req.params.id, req.body);
      res.json(product);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      await service.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
