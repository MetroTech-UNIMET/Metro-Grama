import { useQuery } from "@tanstack/react-query";
import { queryKeys } from '@/lib/query-keys';

export default function useLazyGraphIcons() {
  const { data: icons, ...query } = useQuery({
    queryKey: queryKeys.lazy.icons.queryKey,
    queryFn: async () => {
      const { registerFontFamily } = await import("@antv/graphin");

      const iconLoader = (await import("@antv/graphin-icons")).default;

      const icons = registerFontFamily(iconLoader);
      return icons;
    },
  });

  return { icons, ...query };
}
