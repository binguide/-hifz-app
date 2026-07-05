declare module 'react-native-sqlite-storage' {
  export interface SQLiteDatabase {
    executeSql(sql: string, params?: any[]): Promise<[SQLiteResultSet]>;
    close(): Promise<void>;
  }
  export interface SQLiteResultSet {
    rows: {
      length: number;
      item(index: number): any;
      raw(): any[];
    };
  }
  export function openDatabase(config: {name: string; location: string}): Promise<SQLiteDatabase>;
  export function enablePromise(flag: boolean): void;
}

declare module '@react-navigation/bottom-tabs' {
  export function createBottomTabNavigator(): any;
}
