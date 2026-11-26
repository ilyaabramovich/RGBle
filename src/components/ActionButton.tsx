type ActionButtonProps = React.PropsWithChildren<{
  onClick: () => void;
  disabled?: boolean;
}>;

// aria-disabled rather than disabled: a natively disabled button drops keyboard focus
// to <body> in WebKit when its own press disables it (Reset, the last Undo).
export default function ActionButton({ children, onClick, disabled }: ActionButtonProps) {
  return (
    <button
      type="button"
      className="cursor-pointer rounded-md border px-4 py-2 font-semibold whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 aria-disabled:cursor-default aria-disabled:opacity-40"
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
}
