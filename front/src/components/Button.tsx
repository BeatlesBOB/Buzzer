type Button = {
  handleClick?: () => void;
  label: string;
};

export default function Button({ handleClick, label }: Button) {
  return (
    <button
      onClick={handleClick}
      className="font-primary font-regular underline"
    >
      {label}
    </button>
  );
}
