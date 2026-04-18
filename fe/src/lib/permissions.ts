export type AppRole = string;

// Nhóm quyền
export const MANAGER_ROLES   = ['director', 'ADMIN', 'branch_manager'];
export const FINANCE_ROLES   = ['director', 'ADMIN', 'branch_manager', 'accountant'];
export const HR_ROLES        = ['director', 'ADMIN', 'branch_manager', 'hr'];
// branch_manager cần xem ứng viên để nhập điểm PV
export const ALL_ROLES       = ['director', 'ADMIN', 'branch_manager', 'accountant', 'hr', 'employee'];

// Trang nào cho role nào
export const ROUTE_ROLES: Record<string, string[]> = {
  '/hr':                    ALL_ROLES,
  '/hr/employees':          MANAGER_ROLES,
  '/hr/contracts':          FINANCE_ROLES,
  '/hr/recruitment':        HR_ROLES,
  '/hr/attendance':         [...MANAGER_ROLES, 'hr', 'employee'],
  '/hr/attendance/kiosk':   ALL_ROLES,
  '/hr/payroll/my':         ['director', 'branch_manager', 'accountant', 'hr', 'employee'],
  '/hr/payroll':            FINANCE_ROLES,
  '/hr/assets':             MANAGER_ROLES,
  '/hr/reports':            ['director'],
  '/sales/orders':          [...MANAGER_ROLES, 'employee'],
  '/sales/customers':       [...MANAGER_ROLES, 'employee'],
  '/sales/products':        [...MANAGER_ROLES, 'employee'],
  '/sales/categories':      ['director', 'ADMIN'],
  '/sales/inventory':       [...MANAGER_ROLES, 'employee'],
  '/sales/suppliers':       MANAGER_ROLES,
  '/sales/reports':         FINANCE_ROLES,
};

export function canAccessRoute(role: AppRole, path: string): boolean {
  const matched = Object.keys(ROUTE_ROLES)
    .filter((r) => path === r || path.startsWith(r + '/'))
    .sort((a, b) => b.length - a.length)[0];
  if (!matched) return true;
  return ROUTE_ROLES[matched].includes(role);
}

// Helpers
export const isManager       = (role: AppRole) => MANAGER_ROLES.includes(role);
export const isFinance       = (role: AppRole) => FINANCE_ROLES.includes(role);
export const isAdmin         = (role: AppRole) => ['director', 'ADMIN'].includes(role);
export const isBranchManager = (role: AppRole) => role === 'branch_manager';
export const isHR            = (role: AppRole) => role === 'hr';
