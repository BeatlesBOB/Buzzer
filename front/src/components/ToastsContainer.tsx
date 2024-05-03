import { useCallback, useContext, useState, memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Toast, { type IToast } from "./Toast";
import { ToastContext } from "../contexts/ToastContext";

export default memo(function ToastsContainer() {
  const { pushToastRef } = useContext(ToastContext);
  const [toasts, setToasts] = useState<Array<IToast>>([]);

  pushToastRef.current = ({ duration, title, desc }: IToast) => {
    const id = crypto.randomUUID();

    const timer = setTimeout(() => {
      setToasts((v) => v.filter((t) => t.id !== id));
    }, (duration ?? 5) * 1000);

    const toast = { title, id, timer, desc, duration };
    setToasts((v) => [...v, toast]);
  };

  const onRemove = useCallback(
    (toast: IToast) => {
      clearTimeout(toast.timer);
      setToasts(toasts.filter((t) => t !== toast));
    },
    [toasts]
  );

  return (
    <div className="fixed z-50 flex flex-col gap-4 bottom-12 right-12 items-end justify-end overflow-hidden">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            onClick={() => onRemove(toast)}
            key={toast.id}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
          >
            <Toast {...toast} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});
