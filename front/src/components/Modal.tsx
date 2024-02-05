import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

const dropIn = {
  initial: {
    scale: 0,
    opacity: 0,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1000,
      type: "spring",
      damping: 25,
      stiffness: 500,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
  },
};

export default function Modal({
  isOpen,
  setIsOpen,
  children,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 px-2 z-10 overflow-hidden flex items-center justify-center w-screen h-screen bg-gray-500 bg-opacity-75 transition-opacity"
        >
          <motion.div
            initial="initial"
            variants={dropIn}
            animate="visible"
            exit="exit"
            className="bg-white rounded-md shadow-xl overflow-hidden max-w-md w-full sm:w-96 md:w-1/2 lg:w-2/3 xl:w-1/3 z-50"
          >
            {children}
            <div className="border-t px-4 py-2 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 underline text-black rounded-md w-full sm:w-auto"
              >
                Accept
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
