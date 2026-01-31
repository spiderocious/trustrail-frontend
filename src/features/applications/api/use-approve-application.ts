import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@shared/helpers/api-client";
import { API_ENDPOINTS } from "@shared/constants/api";

interface ApproveApplicationRequest {
  applicationId: string;
  reason?: string;
}

interface ApproveApplicationResponse {
  success: boolean;
  data: {
    applicationId: string;
    status: string;
    updatedAt: string;
  };
}

async function approveApplication(
  request: ApproveApplicationRequest,
): Promise<ApproveApplicationResponse> {
  return apiClient.post<ApproveApplicationResponse>(
    API_ENDPOINTS.APPLICATIONS.APPROVE(request.applicationId),
    {
      reason: request.reason,
    },
    true,
  );
}

export function useApproveApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveApplication,
    onSuccess: (_, variables) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({
        queryKey: ["application", variables.applicationId],
      });
      queryClient.invalidateQueries({ queryKey: ["applications-list"] });
      queryClient.invalidateQueries({ queryKey: ["trustWalletAnalytics"] });
    },
  });
}
