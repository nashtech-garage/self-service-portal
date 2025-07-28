import type { MenuItem } from "@/entities/menuItem";
import { ADMIN_ROUTES, STAFF_ROUTES } from "@constants/routes";
import { USER_TYPE_ENUM } from "@constants/user";
import { ROUTES } from "../constants/routes";
export interface RouteInfo {
  breadcrumbs: Breadcrumb[];
}

export interface Breadcrumb {
  title: string;
  path: string;
}

type RouteKey = keyof typeof ROUTES;

export const getRouteInfo = (pathname: string): RouteInfo => {
  const matchRoute = () => {
    for (const key of Object.keys(ROUTES)) {
      const route = ROUTES[key as RouteKey];
      // Convert /users/edit/:id -> ^/users/edit/[^/]+$
      const pattern = new RegExp("^" + route.path.replace(/:[^/]+/g, "[^/]+") + "$");
      if (pattern.test(pathname)) {
        return key as RouteKey;
      }
    }
    return undefined;
  };

  const routeKey = matchRoute();

  if (!routeKey) {
    return {
      breadcrumbs: [{ title: "Home", path: "/" }],
    };
  }

  const currentRoute = ROUTES[routeKey];
  const breadcrumbs: Breadcrumb[] = [];

  const addParentBreadcrumbs = (key: RouteKey) => {
    const route = ROUTES[key];
    if (route.parent) {
      const parentKey = route.parent as RouteKey;
      addParentBreadcrumbs(parentKey);
      const parentRoute = ROUTES[parentKey];
      breadcrumbs.push({
        title: parentRoute.title,
        path: parentRoute.path,
      });
    }
  };

  if (currentRoute.parent) {
    addParentBreadcrumbs(routeKey);
  }

  breadcrumbs.push({
    title: currentRoute.title,
    path: currentRoute.path,
  });

  return {
    breadcrumbs,
  };
};

export const getSidebarMenuRoutesByUserType = (
  userType: (typeof USER_TYPE_ENUM)[keyof typeof USER_TYPE_ENUM]
): MenuItem[] => {
  const routeKeys = userType === USER_TYPE_ENUM.ADMIN ? ADMIN_ROUTES : STAFF_ROUTES;
  return routeKeys
    .filter((key) => ROUTES[key as RouteKey]) // Ensure the key exists in ROUTES
    .map((key) => ({
      key,
      ...ROUTES[key as RouteKey], // Spread the route properties
      label: ROUTES[key as RouteKey].title, // Use the title as the label for the sidebar
    }));
};
