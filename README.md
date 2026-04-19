# FORHER ERP – Hệ thống Quản lý Nhân sự và Bán hàng

Hệ thống ERP web-based cho chuỗi cửa hàng thời trang **FORHER**, tích hợp quản lý nhân sự và bán hàng đa chi nhánh.

## Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS v4 |
| Backend | Spring Boot 3.x, Java 21, Spring Security + JWT |
| Database | Oracle Database 21c |
| ORM | Spring Data JPA / Hibernate |
| State Management | TanStack Query v5 |

## Yêu cầu môi trường

- **Node.js** >= 18.x
- **Java** 21
- **Maven** 3.x
- **Oracle Database** 21c (hoặc XE)

---

## Cài đặt và chạy

### 1. Clone repository

```bash
git clone https://github.com/ThaiBinh2004/MyPos.git
cd MyPos
```

### 2. Cài đặt Database

Tạo user Oracle và cấp quyền:

```sql
CREATE USER forher IDENTIFIED BY forher123;
GRANT CONNECT, RESOURCE, DBA TO forher;
```

Các bảng tự động tạo khi Spring Boot khởi động (Hibernate DDL auto).
Dữ liệu mẫu được seed tự động qua `DataInitializer`.

### 3. Cấu hình Backend

Mở `be/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:oracle:thin:@localhost:1521/XEPDB1
spring.datasource.username=forher
spring.datasource.password=forher123
spring.jpa.hibernate.ddl-auto=update
```

Chạy backend:

```bash
cd be
mvn spring-boot:run
```

Backend chạy tại: `http://localhost:8080`

### 4. Cài đặt và chạy Frontend

```bash
cd fe
npm install
npm run dev
```

Frontend chạy tại: `http://localhost:3000`

---

## Tài khoản mặc định

| Vai trò | Username | Password |
|---|---|---|
| Giám đốc | `director` | `123456` |
| Quản lý chi nhánh | `manager1` | `123456` |
| Kế toán | `accountant` | `123456` |
| Nhân sự | `hr1` | `123456` |
| Nhân viên | `emp001` | `123456` |

---

## Chức năng chính

### Module Quản lý Nhân sự
- Quản lý nhân viên, hợp đồng lao động
- Chấm công (admin + Kiosk Mode)
- Tính lương tự động
- Tuyển dụng (pipeline ứng viên)
- Quyết toán nhân sự

### Module Quản lý Bán hàng
- Bán hàng tại quầy (POS)
- Quản lý đơn hàng online & offline
- Quản lý kho hàng realtime + chuyển kho
- Quản lý sản phẩm, khuyến mãi
- Khách hàng tích điểm & xếp hạng loyalty
- Nhà cung cấp & đơn nhập hàng
- Dashboard báo cáo doanh thu

---

## Nhóm thực hiện

| Họ tên | MSSV |
|---|---|
| Phí Ngọc Thái Bình | 22H1120095 |
| Phạm Huỳnh Thiên Huy | 22H1120106 |

**Giảng viên hướng dẫn:** Lê Hữu Thanh Tùng  
**Trường:** Đại học Giao thông Vận tải TP. Hồ Chí Minh
