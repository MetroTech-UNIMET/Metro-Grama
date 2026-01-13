import type { Option } from '@/components/ui/types/option.types';
import type { ComponentProps } from 'react';
import { Command as CommandPrimitive } from 'cmdk';

type ItemProps = ComponentProps<typeof CommandPrimitive.Item>;

interface ForwardedProps {
  id?: string;
  'cmdk-item'?: string;
  role?: 'option';

  'aria-disabled'?: boolean;
  'aria-selected'?: boolean;
  'data-disabled'?: boolean;
  'data-selected'?: boolean;
  multiple?: boolean

  onClick?: ItemProps['onClick'];
  onMouseDown?: ItemProps['onMouseDown'];
  onPointerMove?: ItemProps['onPointerMove'];
  ref?: ItemProps['ref'];

}

export interface BaseCustomCommand<TValue = string | number, TData = undefined>
  extends ForwardedProps {
  option: Option<TValue, TData>;
  isSelected: boolean;
}
