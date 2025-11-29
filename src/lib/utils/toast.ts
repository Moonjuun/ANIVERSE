import { useToastStore } from "@/stores/useToastStore";
import type { ToastType } from "@/stores/useToastStore";

/**
 * 토스트 알림을 표시하는 헬퍼 함수
 * 클라이언트 컴포넌트에서만 사용 가능
 */
export function useToast() {
  const addToast = useToastStore((state) => state.addToast);

  return {
    success: (message: string, duration?: number) => {
      addToast({ type: "success", message, duration });
    },
    error: (message: string, duration?: number) => {
      addToast({ type: "error", message, duration });
    },
    info: (message: string, duration?: number) => {
      addToast({ type: "info", message, duration });
    },
    warning: (message: string, duration?: number) => {
      addToast({ type: "warning", message, duration });
    },
  };
}





