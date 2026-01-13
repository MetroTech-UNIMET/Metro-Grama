import { useQuery } from "@tanstack/react-query";

export default function useLazyGraphIcons() {
  const { data: icons, ...query } = useQuery({
    queryKey: ["icons"],
    queryFn: async () => {
      const { registerFontFamily } = await import("@antv/graphin");

      const iconLoader = (await import("@antv/graphin-icons")).default;

      const icons = registerFontFamily(iconLoader);
      return icons;
    },
  });

  return { icons, ...query };
}
