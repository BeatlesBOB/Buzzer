import clsx from "clsx";

type ButtonProps = {
  handleClick?: () => void;
  label: string;
  variant?: "primary" | "secondary";
  type?: "button" | "submit";
  disabled?: boolean;
};

export default function Button({ handleClick, label, variant = "secondary", type = "button", disabled }: ButtonProps) {
  const classes = clsx(
    "px-10 py-2.5 font-primary font-regular border border-black shadow-md shadow-black disabled:opacity-50 disabled:pointer-events-none",
    {
      "hover:bg-black hover:text-white": variant === "secondary",
      "bg-black text-white hover:bg-transparent hover:text-black": variant === "primary",
    }
  );
  return (
    <button type={type} onClick={handleClick} className={classes} disabled={disabled}>
      {label}
    </button>
  );
}
