import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@shared/helpers/api-client";
import { API_ENDPOINTS } from "@shared/constants/api";

interface DeclineApplicationRequest {
  applicationId: string;
  reason: string;
}

interface DeclineApplicationResponse {
  success: boolean;
  data: {
    applicationId: string;
    status: string;
    updatedAt: string;
  };
}

async function declineApplication(
  request: DeclineApplicationRequest,
): Promise<DeclineApplicationResponse> {
  return apiClient.post<DeclineApplicationResponse>(
    API_ENDPOINTS.APPLICATIONS.DECLINE(request.applicationId),
    {
      reason: request.reason,
    },
    true,
  );
}

export function useDeclineApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: declineApplication,
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
