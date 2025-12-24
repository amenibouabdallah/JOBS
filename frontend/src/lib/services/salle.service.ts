import { apiClient } from "@/lib/api-client";
import type { Salle } from "@/types/salle.types";

class SalleService {
  async list(): Promise<Salle[]> {
    const response = await apiClient.get<Salle[]>("/salles");
    return response.data;
  }
  async create(
    data: Partial<Salle> & {
      name: string;
      capacity: number;
      type?: Salle["type"];
    }
  ): Promise<Salle> {
    const response = await apiClient.post("/salles", data);
    return response.data;
  }
  async update(id: number, data: Partial<Salle>): Promise<Salle> {
    const response = await apiClient.patch(`/salles/${id}`, data);
    return response.data;
  }
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/salles/${id}`);
  }
}

export const salleService = new SalleService();
