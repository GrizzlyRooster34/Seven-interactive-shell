export interface OperatorProfile {
  id: string;
  name: string;
  loyalty_bond: number; // 0-100
  clearance_level: number; // 1-5
}

// Stub: Constant CREATOR matching OperatorProfileModel.
export const CREATOR: OperatorProfile = {
  id: 'user_01',
  name: 'Ensign',
  loyalty_bond: 10,
  clearance_level: 1
};