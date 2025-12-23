import { SnackbarProvider } from "notistack";
import { componentStyledNotistack } from "./StyledMaterialDesignContent";
import type { ReactNode } from "react";

interface SnackbarProviderAppProps {
  children: ReactNode;
}

/**
 * Componente que envuelve la aplicación para proporcionar
 * funcionalidad de notificaciones mediante notistack.
 */
const SnackbarProviderApp = ({ children }: SnackbarProviderAppProps) => {
  return (
    <SnackbarProvider
      Components={componentStyledNotistack}
      autoHideDuration={3000}
      dense
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
    >
      {children}
    </SnackbarProvider>
  );
};

export { SnackbarProviderApp };
