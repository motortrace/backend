export interface CreateProductRequest {
    name: string;
    price: number;
  }
  
  export interface UpdateProductRequest {
    name?: string;
    price?: number;
  }
  