import prisma from "./prisma"; // assumes you already have a prismaClient file

export const productRepository = {
  create: (data) => prisma.product.create({ data }),
  findAll: () => prisma.product.findMany(),
  findById: (id) => prisma.product.findUnique({ where: { id } }),
  update: (id, data) => prisma.product.update({ where: { id }, data }),
  delete: (id) => prisma.product.delete({ where: { id } }),
};
