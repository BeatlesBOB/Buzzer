import { createContext, type MutableRefObject, useRef, memo } from "react";
import ToastsContainer from "../components/ToastsContainer";
import { IToast } from "../components/Toast";

export interface IToastContext {
  pushToastRef: MutableRefObject<(payload: IToast) => void>;
}

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const ToastContext = createContext<IToastContext>(null!);

const ToastProvider = memo(function ToastProvider({
  children,
}: {
  children: JSX.Element;
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
