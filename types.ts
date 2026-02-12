export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface ReceiptData {
  items: ReceiptItem[];
  tax: number;
  serviceCharge: number;
  total: number;
}

export interface Person {
  id: string;
  name: string;
}

export interface ItemAssignment {
  itemId: string;
  // Map of personId to number of portions/units they consumed
  portions: Record<string, number>;
  isFreeSplit?: boolean;
}