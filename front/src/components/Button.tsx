import clsx from "clsx";

type Button = {
  handleClick?: () => void;
  label: string;
  classes?: string;
};

export default function Button({ handleClick, label, classes }: Button) {
  const defaultClasses = clsx({
    "font-primary font-regular underline": true,
    [classes ?? ""]: true,
  });
  return (
    <button onClick={handleClick} className={defaultClasses}>
      {label}
    </button>
  );
}
