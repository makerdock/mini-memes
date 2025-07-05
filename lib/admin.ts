// Admin configuration and utilities
export const ADMIN_FIDS = [479]; // Array of admin FIDs

export function isAdmin(fid: number): boolean {
  return ADMIN_FIDS.includes(fid);
}

export interface AdminUser {
  fid: number;
  isAdmin: boolean;
}

export interface CreateTemplateRequest {
  name: string;
  image_url: string;
  description?: string;
  text_boxes?: any[];
}

export interface UpdateTemplateRequest {
  id: string;
  name?: string;
  image_url?: string;
  description?: string;
  text_boxes?: any[];
}