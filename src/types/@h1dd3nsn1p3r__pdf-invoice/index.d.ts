declare module '@h1dd3nsn1p3r/pdf-invoice' {
  export interface CompanyInfo {
    logo?: string;
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    taxId?: string;
    bank?: string;
  }

  export interface CustomerInfo {
    name: string;
    company?: string;
    address?: string;
    phone?: string;
    email?: string;
    taxId?: string;
  }

  export interface InvoiceInfo {
    number: string | number;
    date?: string;
    dueDate?: string;
    status?: string;
    locale?: string;
    currency?: string;
    path?: string;
  }

  export interface ItemInfo {
    name: string;
    quantity: number;
    price: number;
    finalPrice?: number;
    tax?: number;
    discount?: number;
  }

  export interface QRInfo {
    data: string;
    width?: number;
  }

  export interface NoteInfo {
    text: string;
    italic?: boolean;
  }

  export interface InvoicePayload {
    company: CompanyInfo;
    customer: CustomerInfo;
    invoice: InvoiceInfo;
    items: ItemInfo[];
    qr?: QRInfo;
    note?: NoteInfo;
  }

  export interface ConfigStrings {
    invoice?: string;
    refNumber?: string;
    date?: string;
    dueDate?: string;
    status?: string;
    billTo?: string;
    item?: string;
    quantity?: string;
    price?: string;
    tax?: string;
    total?: string;
    subTotal?: string;
    totalTax?: string;
  }

  export interface ConfigFont {
    [fontName: string]: {
      normal: string;
      italics?: string;
      bold?: string;
      bolditalics?: string;
    };
  }

  export interface ConfigStyle {
    font?: string;
    fontSize?: number;
    lineHeight?: number;
    color?: string;
  }

  export interface InvoiceConfig {
    string?: ConfigStrings;
    font?: ConfigFont;
    style?: ConfigStyle;
  }

  export class PDFInvoice {
    constructor(payload: InvoicePayload, config?: InvoiceConfig);
    create(): Promise<string>;
  }
}
