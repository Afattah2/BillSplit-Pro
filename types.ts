
export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
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
  personIds: string[];
}
