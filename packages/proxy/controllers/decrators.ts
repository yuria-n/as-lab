type RouteName = string;
export type FieldName = string;

export interface SocketInfo {
  childRoute: string;
}

export interface RouteInfo {
  method: HttpMethod;
  childRoute: RouteName;
}

export interface RouteOption {
  private?: boolean; // default false
}

export const parentRouteMap = new Map<Constructor, RouteName>();
export const childSocketMap = new Map<Constructor, Map<FieldName, SocketInfo>>();
export const childRouteMap = new Map<Constructor, Map<FieldName, RouteInfo>>();
export const childOptionMap = new Map<Constructor, Map<FieldName, RouteOption>>();

export function Route(parentRoute: RouteName) {
  return (Class: Constructor) => {
    parentRouteMap.set(Class, parentRoute);
  };
}

function createMethod(method: HttpMethod) {
  return (childRoute: RouteName) => (Class: any, field: FieldName) => {
    const fieldMap = childRouteMap.get(Class.constructor) ?? new Map<FieldName, RouteInfo>();
    childRouteMap.set(Class.constructor, fieldMap);
    if (fieldMap.has(field)) {
      throw new Error(`Duplicate REST endpoint ${field}`);
    }
    fieldMap.set(field, { method, childRoute });
  };
}

export const Get = createMethod('GET');
export const Post = createMethod('POST');
export const Put = createMethod('PUT');
export const Delete = createMethod('DELETE');

function createOptions(key: keyof RouteOption) {
  return (value = true) => (Class: any, field: FieldName) => {
    const fieldMap = childOptionMap.get(Class.constructor) ?? new Map<FieldName, RouteOption>();
    childOptionMap.set(Class.constructor, fieldMap);
    const info: RouteOption = fieldMap.get(field) ?? {};
    info[key] = value;
    fieldMap.set(field, info);
  };
}

export const Private = createOptions('private');
