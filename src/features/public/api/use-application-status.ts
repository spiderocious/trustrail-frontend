import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/helpers/api-client";
import { API_ENDPOINTS } from "@/shared/constants/api";
import type { ApplicationStatus } from "../types";

export function useApplicationStatus(applicationId: string, enabled = true) {
  return useQuery({
    queryKey: ["application-status", applicationId],
    queryFn: async () => {
      const response = await apiClient.get<ApplicationStatus>(
        API_ENDPOINTS.PUBLIC.APPLICATION_STATUS(applicationId),
        { requiresAuth: false }
      );
      return response;
    },
    enabled: !!applicationId && enabled,
    refetchInterval: (data) => {
      // Auto-refetch every 5 seconds if status is PENDING or ANALYZING
      const status = data?.status;
      if (
        status === "PENDING" ||
        status === "PENDING_ANALYSIS" ||
        status === "ANALYZING"
      ) {
        return 5000;
      }
      return false;
    },
  });
}
