import { cssInterop } from "nativewind";
import * as Phosphor from "phosphor-react-native";

interface IconProps extends Phosphor.IconProps {
  icon: Phosphor.Icon;
  className?: string;
}

export default function Icon({
  icon: PhosphorIcon,
  className,
  ...props
}: IconProps) {
  const StyledIcon = cssInterop(PhosphorIcon, { className: "style" });
  return <StyledIcon className={className} {...props} />;
}

export { Phosphor };
