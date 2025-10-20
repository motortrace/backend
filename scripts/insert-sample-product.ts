import prisma from '../src/infrastructure/database/prisma';

async function main() {
  const product = await prisma.product.create({
    data: {
      productname: 'Sample Product',
      category: 'Paints & Coatings',
      subcategory: 'Automotive',
      description: 'Example product inserted by script',
      price: '19.99',
      rating: 4.5,
      reviewcount: 10,
      availability: 'IN_STOCK',
      image: 'https://example.com/image.jpg',
      stock: 100,
      compatibility: 'Universal',
      position: 'shelf-a',
      brand: 'Acme',
      finish: 'Matte',
      material: 'Polymer',
      surfaceuse: 'Exterior',
      type: 'Liquid',
      color: 'Red',
      volume: '1L',
      mountingfeatures: '',
      colorcode: 'R123',
      quantity: 1,
      minquantity: 1,
      discounttype: 'NONE',
      discountvalue: 0,
      warranty: '1 year',
      manufacturer: 'Acme Corp',
      manufactureddate: new Date('2025-01-01'),
      expirydate: new Date('2027-01-01'),
      notes: '',
      resistance: '',
      drytime: '',
      applicationmethod: '',
      voltage: '',
      amprating: '',
      connectortype: '',
      size: 'Standard'
    }
  });

  console.log('Inserted product:', product);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
