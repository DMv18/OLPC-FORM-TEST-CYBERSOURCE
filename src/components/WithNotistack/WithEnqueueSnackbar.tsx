import { useSnackbar } from "notistack";

interface SnackbarHandler {
  handlerEnqueue: (message: string, variant?: "success" | "error" | "warning" | "info") => void;
}

const WithEnqueueSnackbar = (): SnackbarHandler => {
  const { enqueueSnackbar } = useSnackbar();

  const handlerEnqueue = (message: string, variant: "success" | "error" | "warning" | "info" = "success") => {
    enqueueSnackbar(message, { variant });
  };

  return { handlerEnqueue };
};

export { WithEnqueueSnackbar };
