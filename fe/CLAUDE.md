# FORHER HRM Frontend

## Dự án
HRM system cho công ty thời trang FORHER (3 chi nhánh, ~36 nhân sự). Frontend Next.js kết nối backend API (Odoo-based hoặc custom REST).

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript strict mode
- **Styling**: Tailwind CSS v4
- **State/Data**: TanStack Query v5 (`@tanstack/react-query`)
- **HTTP**: Axios
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date**: date-fns

## Cấu trúc thư mục
```
src/
  types/                  # TypeScript interfaces/types, split by domain
    common.ts             # ApiResponse, PaginatedResponse, SelectOption, enums dùng chung
    auth.ts               # AuthUser, Role
    employee.ts           # Employee, EmployeeListItem, Branch, Department
    contract.ts           # Contract, ContractType, ContractStatus
    recruitment.ts        # RecruitmentRequest, Candidate, CandidateStage
    attendance.ts         # AttendanceRecord, Shift, AttendanceCorrection
    payroll.ts            # PayrollEntry, SalesImportRow
    asset.ts              # Asset, OffboardingRecord, OffboardingAsset
    index.ts              # re-export tất cả

  lib/
    axios.ts              # Axios instance với interceptors (auth token, 401 redirect)
    utils.ts              # cn(), formatCurrency(), formatDate(), v.v.
    query-client.ts       # TanStack Query client config

  services/               # API calls, mỗi file = 1 domain
    auth.service.ts
    employee.service.ts
    contract.service.ts
    recruitment.service.ts
    attendance.service.ts
    payroll.service.ts
    asset.service.ts

  hooks/                  # Custom React hooks (useQuery wrappers)
    use-employees.ts
    use-contracts.ts
    use-recruitment.ts
    use-attendance.ts
    use-payroll.ts
    use-assets.ts

  components/
    ui/                   # Primitive components (Button, Input, Badge, Table, Modal, Card, Avatar)
    layout/               # Shell, Sidebar, Topbar
    [module]/             # Components theo module (employees/, contracts/, v.v.)

  contexts/
    auth-context.tsx      # AuthContext + useAuth hook

  app/                    # Next.js App Router pages
    layout.tsx
    page.tsx              # redirect → /hr
    (auth)/
      login/page.tsx
    hr/
      layout.tsx          # HR shell layout
      page.tsx            # Dashboard
      employees/
      contracts/
      recruitment/
      attendance/
      payroll/
      offboarding/
```

## Modules
| Module | Route | Mô tả |
|--------|-------|-------|
| Employees | `/hr/employees` | Quản lý hồ sơ nhân viên, Employee ID duy nhất |
| Contracts | `/hr/contracts` | Tạo/duyệt hợp đồng, cảnh báo hết hạn |
| Recruitment | `/hr/recruitment` | Pipeline tuyển dụng, chuyển NV |
| Attendance | `/hr/attendance` | Chấm công ca sáng/tối, kiosk mode |
| Payroll | `/hr/payroll` | Tính lương, import doanh số Excel |
| Offboarding | `/hr/offboarding` | Thu hồi tài sản, thanh lý HĐ |

## Roles & Phân quyền
- `director`: toàn quyền
- `branch_manager`: quản lý chi nhánh của mình
- `accountant`: đọc lương/hợp đồng, export
- `employee`: xem thông tin cá nhân, chấm công

## API Base URL
`NEXT_PUBLIC_API_URL` (default: `http://localhost:8069/api`)

## Conventions

### Naming
- Files: `kebab-case.ts` / `kebab-case.tsx`
- Components: `PascalCase`
- Functions/variables: `camelCase`
- Types/Interfaces: `PascalCase`
- Constants: `SCREAMING_SNAKE_CASE`

### Services
- Mỗi function trong service return `Promise<T>` trực tiếp (không wrap thêm)
- Sử dụng `axios` instance từ `@/lib/axios`
- Query params dùng `params` object của axios
- Endpoints: `/hr/employees`, `/hr/contracts`, `/hr/recruitment`, `/hr/attendance`, `/hr/payroll`, `/hr/assets`, `/hr/offboarding`

### Components
- Server Components mặc định, thêm `"use client"` khi cần
- Props interface đặt ngay trên component, không export nếu không cần
- Không dùng `React.FC<>`, dùng function thường với typed props

### Forms
- Luôn dùng Zod schema + `zodResolver`
- Tách schema ra file riêng nếu phức tạp

### Currency
- Đơn vị: VNĐ (không có decimal)
- Format: `formatCurrency(amount)` → `"1.500.000 ₫"`

### Date
- Lưu trữ: ISO string
- Hiển thị: `dd/MM/yyyy` (Việt Nam)
- Dùng `date-fns` + `vi` locale

## Build Order (từng phần)
1. ✅ **Part 1**: Types + Services
2. **Part 2**: lib/utils + Axios + QueryClient
3. **Part 3**: UI components (Button, Input, Badge, Table, Modal, Card, Avatar)
4. **Part 4**: Layout (Shell, Sidebar, Topbar) + AuthContext
5. **Part 5**: App layout, login page
6. **Part 6**: Employees module
7. **Part 7**: Contracts module
8. **Part 8**: Recruitment module
9. **Part 9**: Attendance module (+ Kiosk)
10. **Part 10**: Payroll module (+ Excel import)
11. **Part 11**: Offboarding module
12. **Part 12**: Dashboard + Reports
