import { useNavigate } from "react-router-dom";

/**
 * - Evitar repetir llamadas a useNavigate en distintos componentes.
 * - Proveer una función reutilizable para navegar a cualquier URL con
 *   control sobre el historial del navegador.
 *
 * Función retornada:
 * - handlerNavigate(url, replace):
 *     - url: la ruta a la que se desea navegar.
 *     - replace: booleano que indica si se reemplaza la entrada actual
 *       en el historial (true: no se puede volver atrás; false: se agrega
 *       al historial, permitiendo volver atrás).
 */

const useHookNavigate = () => {
  const navigate = useNavigate();

  const handlerNavigate = (url: string, replace: boolean) => {
    navigate(url, { replace: replace });
  };

  return {
    handlerNavigate,
  };
};

export { useHookNavigate };
