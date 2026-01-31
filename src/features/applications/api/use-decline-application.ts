import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_BASE_URL, ENDPOINTS } from "@shared/constants/api";

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
  const token = localStorage.getItem("authToken");

  const response = await fetch(
    `${API_BASE_URL}/api/applications/${request.applicationId}/decline`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        reason: request.reason,
      }),
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to decline application");
  }

  return response.json();
}

export function useDeclineApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: declineApplication,
    onSuccess: (data, variables) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({
        queryKey: ["application", variables.applicationId],
      });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["trustWalletAnalytics"] });
    },
  });
}
