import type { Subject } from "@/interfaces/Subject";
import type { NodeStyleIcon } from "@antv/graphin/lib/typings/type";
import type { NodeStatuses } from "@/features/grafo/behaviors/StatusActions";
import type { Option } from "@ui/types";
import type { Career } from "@/interfaces/Career";

export function careerEmoji(career: string): string {
  switch (career) {
    case "career:quimica":
      return "🧪";
    case "career:sistemas":
      return "💾";
  }
  return "";
}

/**
 * Returns the NodeStyleIcon for a given subject and selected careers.
 * @param subject - The subject object.
 * @param selectedCareers - The selected careers as DropdownOptions.
 * @returns The NodeStyleIcon object.
 */
export function getNormalIcon(
  subject: Subject,
  selectedCareers: Option[],
  careers?: Career[]
): NodeStyleIcon {
  let icon = "";
  
  if (subject.careers.length > 1) {
    icon = "🤝";
    for (let i = 0; i < subject.careers.length; i++) {
      
      const emoji =  careers?.find((c) => c.id.ID === subject.careers[i].ID)?.emoji ?? "🛠️"
      if (i == 0) {
        icon += "\n\r" + emoji + " ";
        continue;
      }
      icon += emoji + " ";
    }
  } else {
    const career = selectedCareers.find(
      (option) => option.query === `${subject.careers[0].Table}:${subject.careers[0].ID}`
    );
    
    icon = careers?.find((c) => c.name === career?.value)?.emoji ?? "🛠️"
    
  }

  return {
    size: 25,
    type: "text",
    fontFamily: "graphin",
    value: icon,
  };
}

/**
 * Calculates the custom icon properties based on the provided NodeStyleIcon.
 * @param icon - The NodeStyleIcon object.
 * @returns An array containing the label offset and icon length.
 */
export function getCustomIconProps(icon: NodeStyleIcon) {
  let iconLen = icon.value!.replace(/\s/g, "").length;
  iconLen = iconLen == 0 ? 2 : iconLen > 2 ? iconLen * 0.54 : iconLen;
  const labelOffset = iconLen > 2 ? 10 * 0.52 * iconLen : 10;

  return [labelOffset, iconLen];
}

export function isNodeViewed(
  nodeId: string,
  nodeStatuses: NodeStatuses<Subject>
): boolean {
  return nodeStatuses.viewed.has(nodeId);
}

export function isNodeAccessible(
  nodeId: string,
  nodeStatuses: NodeStatuses<Subject>
): boolean {
  return nodeStatuses.accesible.has(nodeId);
}

export function isNodeEnrolled(
  nodeId: string,
  enrolledSubjects: Set<string>
): boolean {
  return enrolledSubjects.has(nodeId);
}

export function isInitialNodeFreeFromCredits(node: Node4j<Subject>): boolean {
  return node.data.BPCredits === 0 && node.data.credits === 0;
}

export function checkDependencies(
  nodeId: string,
  enrolledSubjects: Set<string>,
  subjectRelations: Record<string, Set<string>>,
  dependencyCount: number
): boolean {
  let dependenciesViewed = 0;

  for (const [subject, relations] of Object.entries(subjectRelations)) {
    if (relations.has(nodeId) && enrolledSubjects.has(subject)) {
      dependenciesViewed++;
      if (dependenciesViewed >= dependencyCount) {
        return true;
      }
    }
  }

  return false;
}
