import { createContext, type MutableRefObject, type ReactNode, useRef, memo } from "react";
import ToastsContainer from "../components/ToastsContainer";
import { IToast } from "../components/Toast";

export interface IToastContext {
  pushToastRef: MutableRefObject<(payload: IToast) => void>;
}

export const ToastContext = createContext<IToastContext>(null!);

const ToastProvider = memo(function ToastProvider({
  children,
}: {
  children: ReactNode;
}) {
  const pushToastRef = useRef(() => {});

  return (
    <ToastContext.Provider value={{ pushToastRef }}>
      {children}
      <ToastsContainer />
    </ToastContext.Provider>
  );
});

export default ToastProvider;
