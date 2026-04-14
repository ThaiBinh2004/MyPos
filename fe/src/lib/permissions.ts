export type AppRole = string;

// Nhóm quyền
export const MANAGER_ROLES = ['director', 'ADMIN', 'branch_manager'];
export const FINANCE_ROLES = ['director', 'ADMIN', 'branch_manager', 'accountant'];
export const ALL_ROLES = ['director', 'ADMIN', 'branch_manager', 'accountant', 'employee'];

// Trang nào cho role nào
export const ROUTE_ROLES: Record<string, string[]> = {
  '/hr':                    ALL_ROLES,
  '/hr/employees':          MANAGER_ROLES,
  '/hr/contracts':          FINANCE_ROLES,
  '/hr/recruitment':        MANAGER_ROLES,
  '/hr/attendance':         [...MANAGER_ROLES, 'employee'],
  '/hr/attendance/kiosk':   ALL_ROLES,
  '/hr/payroll':            FINANCE_ROLES,
  '/hr/assets':             MANAGER_ROLES,
  '/sales/orders':          MANAGER_ROLES,
  '/sales/products':        MANAGER_ROLES,
  '/sales/categories':      ['director', 'ADMIN'],
  '/sales/inventory':       MANAGER_ROLES,
  '/sales/suppliers':       MANAGER_ROLES,
  '/sales/reports':         FINANCE_ROLES,
};

export function canAccessRoute(role: AppRole, path: string): boolean {
  // Tìm route match dài nhất
  const matched = Object.keys(ROUTE_ROLES)
    .filter((r) => path === r || path.startsWith(r + '/'))
    .sort((a, b) => b.length - a.length)[0];
  if (!matched) return true;
  return ROUTE_ROLES[matched].includes(role);
}

// Helpers
export const isManager  = (role: AppRole) => MANAGER_ROLES.includes(role);
export const isFinance  = (role: AppRole) => FINANCE_ROLES.includes(role);
export const isAdmin    = (role: AppRole) => ['director', 'ADMIN'].includes(role);
