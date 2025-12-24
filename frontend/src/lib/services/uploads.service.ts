import { apiClient } from '../api-client';

class UploadsService {
  async uploadFile(file: File, destination: string, allowedMimeTypes?: string): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const params = new URLSearchParams();
    params.append('destination', destination);
    if (allowedMimeTypes) {
      params.append('allowedMimeTypes', allowedMimeTypes);
    }

    const response = await apiClient.post(`/uploads/file?${params.toString()}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }
}

const uploadsService = new UploadsService();
export default uploadsService;
