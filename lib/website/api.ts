import type { TestDrivePayload } from './types';
import { vehicles, getVehicle, type Vehicle } from './catalog';

export type { TestDrivePayload } from './types';

export const websiteApi = {
  async getVehicles(): Promise<Vehicle[]> {
    return vehicles;
  },
  async getVehicle(slug: string): Promise<Vehicle> {
    return getVehicle(slug);
  },
  async submitTestDrive(payload: TestDrivePayload) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    return { id: `lead-${Date.now()}`, ...payload };
  },
};
