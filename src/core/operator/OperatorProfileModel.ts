export interface OperatorProfile {
  id: string;
  name: string;
  loyalty_bond: number; // 0-100
  clearance_level: number; // 1-5
}

export const DEFAULT_OPERATOR: OperatorProfile = {
  id: 'user_01',
  name: 'Ensign',
  loyalty_bond: 10,
  clearance_level: 1
};