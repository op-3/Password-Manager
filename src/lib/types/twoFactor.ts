export interface TwoFactorAccount {
  id: string;
  name: string;
  issuer: string;
  secret: string;
  type: string; // سنستخدم هذا في الجانب الأمامي
  algorithm: string;
  digits: number;
  period: number;
}
