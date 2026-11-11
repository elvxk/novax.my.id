import {
  Globe,
  MapPin,
  Shield,
  Key,
  Mail,
  Lock,
  Network,
} from "lucide-react";
import { TOOL_DEFINITIONS, getToolByPath } from "./tool-registry";

export { getToolByPath };

const ICON_MAP = {
  Globe,
  MapPin,
  Shield,
  Key,
  Mail,
  Lock,
  Network,
};

// Map definitions to components with icons
export const ALL_TOOLS = TOOL_DEFINITIONS.map((tool) => ({
  ...tool,
  icon: ICON_MAP[tool.iconName] || Globe,
}));

// Filter out tools that are completely disabled/hidden
export const TOOLS = ALL_TOOLS.filter((t) => !t.disabled);

// Featured tools shown on homepage hero section (must be live and not disabled)
export const FEATURED_TOOLS = TOOLS.filter((t) => t.featured && t.live);
