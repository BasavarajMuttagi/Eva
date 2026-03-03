import { cssInterop } from "nativewind";
import type {
  IconProps,
  Icon as PhosphorIconType,
} from "phosphor-react-native";
import * as Phosphor from "phosphor-react-native";

interface Props extends IconProps {
  icon: PhosphorIconType;
  className?: string;
}

export default function Icon({
  icon: PhosphorIcon,
  className,
  ...props
}: Props) {
  const StyledIcon = cssInterop(PhosphorIcon, { className: "style" });
  return <StyledIcon className={className} {...props} />;
}

export { Phosphor };
