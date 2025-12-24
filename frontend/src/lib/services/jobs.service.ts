import { apiClient } from "@/lib/api-client";
import type { Jobs } from "@/types/jobs.types";

class JobsService {
  private convertDates(job: any): Jobs {
    return {
      ...job,
      startDate: new Date(job.startDate),
      subscriptionDeadline: job.subscriptionDeadline ? new Date(job.subscriptionDeadline) : undefined,
      payStart: new Date(job.payStart),
      payDeadline: new Date(job.payDeadline),
      firstPayDeadline: new Date(job.firstPayDeadline),
    };
  }

  async list(): Promise<Jobs[]> {
    const response = await apiClient.get<any[]>("/jobs");
    return response.data.map(this.convertDates);
  }

  async create(data: Partial<Jobs>): Promise<Jobs> {
    const response = await apiClient.post<any>("/jobs", data);
    return this.convertDates(response.data);
  }

  async update(id: number, data: Partial<Jobs>): Promise<Jobs> {
    const response = await apiClient.patch<any>(`/jobs/${id}`, data);
    return this.convertDates(response.data);
  }

  async remove(id: number): Promise<void> {
    await apiClient.delete(`/jobs/${id}`);
  }
}

export const jobsService = new JobsService();