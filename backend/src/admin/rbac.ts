import type { RestaurantRole } from "../database/entities";

export type RestaurantPermission =
  | "orders.manage"
  | "catalog.manage"
  | "appearance.manage"
  | "settings.manage"
  | "team.manage";

const ROLE_PERMISSIONS: Record<RestaurantRole, readonly RestaurantPermission[]> = {
  owner: ["orders.manage", "catalog.manage", "appearance.manage", "settings.manage", "team.manage"],
  manager: ["orders.manage", "catalog.manage", "appearance.manage", "settings.manage"],
  staff: ["orders.manage"],
};

export function rolesWith(permission: RestaurantPermission): RestaurantRole[] {
  return (Object.keys(ROLE_PERMISSIONS) as RestaurantRole[]).filter((role) =>
    ROLE_PERMISSIONS[role].includes(permission),
  );
}

export function permissionsFor(role: RestaurantRole): RestaurantPermission[] {
  return [...ROLE_PERMISSIONS[role]];
}
