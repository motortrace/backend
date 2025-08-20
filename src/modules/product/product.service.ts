import { PrismaClient } from "@prisma/client";
import { CreateProductRequest, UpdateProductRequest } from "./product.types";

const prisma = new PrismaClient();

export class ProductService {
  async createProduct(data: CreateProductRequest) {
    return await prisma.product.create({ data });
  }

  async getProducts() {
    return await prisma.product.findMany({ orderBy: { name: "asc" } });
  }

  async getProductById(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new Error(`Product with ID '${id}' not found`);
    return product;
  }

  async updateProduct(id: string, data: UpdateProductRequest) {
    return await prisma.product.update({ where: { id }, data });
  }

  async deleteProduct(id: string) {
    return await prisma.product.delete({ where: { id } });
  }
}
