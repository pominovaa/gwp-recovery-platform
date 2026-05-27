type CustomizeIconProps = {
  className?: string;
};

export function CustomizeIcon({ className = "" }: CustomizeIconProps) {
  return (
    <span aria-hidden="true" className={`inline-block leading-none ${className}`}>
      {"\u2728"}
    </span>
  );
}
