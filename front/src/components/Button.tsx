import clsx from "clsx";

type Button = {
  handleClick?: () => void;
  label: string;
  type?: string;
};

export default function Button({
  handleClick,
  label,
  type = "secondary",
}: Button) {
  const defaultClasses = clsx({
    "px-10 py-2.5 font-primary font-regular border border-black shadow-md shadow-black":
      true,
    "hover:bg-black hover:text-white": type === "secondary",
    "bg-black text-white hover:bg-transparent hover:text-black":
      type === "primary",
  });
  return (
    <button onClick={handleClick} className={defaultClasses}>
      {label}
    </button>
  );
}
