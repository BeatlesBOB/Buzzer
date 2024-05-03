import { memo } from "react";
import { motion } from "framer-motion";

export interface IToast {
  id?: string;
  title: string;
  desc: string;
  duration?: number;
  timer?: ReturnType<typeof setTimeout>;
}

export default memo(function Toast({ title, desc, duration }: IToast) {
  return (
    <div className="flex flex-col p-5 w-96 rounded-sm gap-4 shadow-md border">
      <p className="uppercase text-lg">{title}</p>
      <div className="text-base">{desc}</div>
      <motion.div
        className="border-b-4 border-black"
        initial={{ scaleX: 1 }}
        transition={{ duration: duration ?? 5 }}
        animate={{ scaleX: 0 }}
      />
    </div>
  );
});
