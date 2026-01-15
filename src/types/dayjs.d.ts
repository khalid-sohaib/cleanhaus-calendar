/**
 * Type declarations for dayjs
 * dayjs is a peer dependency, so types are provided here for type checking
 */
declare module 'dayjs' {
  export interface Dayjs {
    format(template?: string): string;
    startOf(unit: 'day' | 'month' | 'year' | 'hour' | 'minute' | 'second' | 'week'): Dayjs;
    endOf(unit: 'day' | 'month' | 'year' | 'hour' | 'minute' | 'second' | 'week'): Dayjs;
    add(value: number, unit: 'day' | 'month' | 'year' | 'hour' | 'minute' | 'second' | 'week'): Dayjs;
    subtract(value: number, unit: 'day' | 'month' | 'year' | 'hour' | 'minute' | 'second' | 'week'): Dayjs;
    toDate(): Date;
    valueOf(): number;
    [key: string]: any;
  }

  interface DayjsExtend {
    extend(plugin: any, option?: any): void;
  }

  const dayjs: ((date?: Date | string | number) => Dayjs) & DayjsExtend;
  
  export default dayjs;
}

