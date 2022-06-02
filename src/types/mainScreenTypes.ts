interface Super {
  [key: string]: any;
}

export interface TabList extends Super {
  name: string;
  unit: string;
  value: number;
  img?: string;
}

export interface LegendToolbarList extends Super {
  name: string;
  img: string;
}

/**
 * UI组件的位置参数
 */
export interface ToolsProps extends Super {
  visible?: boolean;
  width?: number;
  height?: number;
  left?: number;
  right?: number;
  top?: number;
  bottom?: number;
  zIndex?: number;
  customClass?: string;
}

export interface DetailInfoItem extends Super {
  name: string;
  value: number;
  longitude: number;
  latitude: number;
  data: any;
}
