package com.forher.erp_backend.config;

import com.forher.erp_backend.entity.*;
import com.forher.erp_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final BranchRepository branchRepository;
    private final EmployeeRepository employeeRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ContractRepository contractRepository;
    private final AttendanceRepository attendanceRepository;
    private final SupplierRepository supplierRepository;
    private final InventoryRepository inventoryRepository;
    private final OrdersRepository ordersRepository;
    private final RecruitmentRequestRepository recruitmentRequestRepository;
    private final CandidateRepository candidateRepository;
    private final AssetRepository assetRepository;
    private final PayrollRepository payrollRepository;

    @Override
    public void run(String... args) {
        seedBranches();
        seedEmployees();
        seedAccounts();
        seedCategories();
        seedProducts();
        seedContracts();
        seedAttendance();
        seedSuppliers();
        seedInventory();
        seedOrders();
        seedRecruitment();
        seedAssets();
        seedPayroll();
    }

    private void seedBranches() {
        if (branchRepository.count() > 0) return;
        branchRepository.save(Branch.builder().branchId("BR001").branchName("Chi nhánh Quận 1").address("123 Nguyễn Huệ, Q.1, TP.HCM").build());
        branchRepository.save(Branch.builder().branchId("BR002").branchName("Chi nhánh Quận 3").address("456 Võ Văn Tần, Q.3, TP.HCM").build());
        branchRepository.save(Branch.builder().branchId("BR003").branchName("Chi nhánh Bình Thạnh").address("789 Xô Viết Nghệ Tĩnh, Q.BT, TP.HCM").build());
        System.out.println(">>> Đã tạo 3 chi nhánh");
    }

    private void seedEmployees() {
        if (employeeRepository.count() > 0) return;
        Branch br1 = branchRepository.findById("BR001").orElseThrow();
        Branch br2 = branchRepository.findById("BR002").orElseThrow();
        Branch br3 = branchRepository.findById("BR003").orElseThrow();

        employeeRepository.save(Employee.builder().employeeId("EMP001").fullName("Nguyễn Thị Hương").dateOfBirth(LocalDate.of(1990, 5, 15)).idCard("079090001234").phoneNumber("0901234501").bankAccount("0011234567890").position("Giám đốc").branch(br1).build());
        employeeRepository.save(Employee.builder().employeeId("EMP002").fullName("Trần Văn Minh").dateOfBirth(LocalDate.of(1988, 3, 20)).idCard("079088001235").phoneNumber("0901234502").bankAccount("0011234567891").position("Quản lý chi nhánh").branch(br1).build());
        employeeRepository.save(Employee.builder().employeeId("EMP003").fullName("Lê Thị Mai").dateOfBirth(LocalDate.of(1995, 8, 10)).idCard("079095001236").phoneNumber("0901234503").bankAccount("0011234567892").position("Kế toán").branch(br1).build());
        employeeRepository.save(Employee.builder().employeeId("EMP004").fullName("Phạm Văn Hùng").dateOfBirth(LocalDate.of(1993, 12, 5)).idCard("079093001237").phoneNumber("0901234504").bankAccount("0011234567893").position("Quản lý chi nhánh").branch(br2).build());
        employeeRepository.save(Employee.builder().employeeId("EMP005").fullName("Hoàng Thị Lan").dateOfBirth(LocalDate.of(1997, 6, 25)).idCard("079097001238").phoneNumber("0901234505").bankAccount("0011234567894").position("Nhân viên bán hàng").branch(br2).build());
        employeeRepository.save(Employee.builder().employeeId("EMP006").fullName("Đặng Văn Tùng").dateOfBirth(LocalDate.of(1996, 9, 14)).idCard("079096001239").phoneNumber("0901234506").bankAccount("0011234567895").position("Quản lý chi nhánh").branch(br3).build());
        System.out.println(">>> Đã tạo 6 nhân viên");
    }

    private void seedAccounts() {
        if (userAccountRepository.count() > 0) return;
        Employee emp1 = employeeRepository.findById("EMP001").orElseThrow();
        Employee emp2 = employeeRepository.findById("EMP002").orElseThrow();
        Employee emp3 = employeeRepository.findById("EMP003").orElseThrow();
        Employee emp4 = employeeRepository.findById("EMP004").orElseThrow();

        Employee emp5 = employeeRepository.findById("EMP005").orElseThrow();

        userAccountRepository.save(UserAccount.builder().accountId("ACC001").username("admin").password(passwordEncoder.encode("admin123")).role("ADMIN").employee(emp1).build());
        userAccountRepository.save(UserAccount.builder().accountId("ACC002").username("director").password(passwordEncoder.encode("director123")).role("director").employee(emp1).build());
        userAccountRepository.save(UserAccount.builder().accountId("ACC003").username("manager1").password(passwordEncoder.encode("manager123")).role("branch_manager").employee(emp2).build());
        userAccountRepository.save(UserAccount.builder().accountId("ACC004").username("accountant").password(passwordEncoder.encode("accountant123")).role("accountant").employee(emp3).build());
        userAccountRepository.save(UserAccount.builder().accountId("ACC005").username("manager2").password(passwordEncoder.encode("manager123")).role("branch_manager").employee(emp4).build());
        userAccountRepository.save(UserAccount.builder().accountId("ACC006").username("employee1").password(passwordEncoder.encode("employee123")).role("employee").employee(emp5).build());
        System.out.println(">>> Đã tạo 6 tài khoản");
    }

    private void seedCategories() {
        if (categoryRepository.count() > 0) return;
        categoryRepository.save(Category.builder().categoryId("CAT001").categoryName("Áo").description("Các loại áo thời trang").build());
        categoryRepository.save(Category.builder().categoryId("CAT002").categoryName("Quần").description("Các loại quần thời trang").build());
        categoryRepository.save(Category.builder().categoryId("CAT003").categoryName("Váy & Đầm").description("Váy và đầm các kiểu").build());
        categoryRepository.save(Category.builder().categoryId("CAT004").categoryName("Phụ kiện").description("Túi xách, thắt lưng, trang sức").build());
        System.out.println(">>> Đã tạo 4 danh mục");
    }

    private void seedProducts() {
        if (productRepository.count() > 0) return;
        Category cat1 = categoryRepository.findById("CAT001").orElseThrow();
        Category cat2 = categoryRepository.findById("CAT002").orElseThrow();
        Category cat3 = categoryRepository.findById("CAT003").orElseThrow();
        Category cat4 = categoryRepository.findById("CAT004").orElseThrow();

        productRepository.save(Product.builder().productId("PRD001").productName("Áo sơ mi trắng basic").sku("AOB-001").price(new BigDecimal("285000")).sizeInfo("S/M/L/XL").color("Trắng").category(cat1).build());
        productRepository.save(Product.builder().productId("PRD002").productName("Áo thun oversize").sku("AOB-002").price(new BigDecimal("195000")).sizeInfo("S/M/L").color("Đen").category(cat1).build());
        productRepository.save(Product.builder().productId("PRD003").productName("Quần jeans skinny").sku("QJN-001").price(new BigDecimal("450000")).sizeInfo("26/27/28/29/30").color("Xanh đậm").category(cat2).build());
        productRepository.save(Product.builder().productId("PRD004").productName("Quần âu nữ").sku("QAN-001").price(new BigDecimal("395000")).sizeInfo("S/M/L").color("Đen").category(cat2).build());
        productRepository.save(Product.builder().productId("PRD005").productName("Váy midi hoa nhí").sku("VMH-001").price(new BigDecimal("520000")).sizeInfo("S/M/L").color("Hồng pastel").category(cat3).build());
        productRepository.save(Product.builder().productId("PRD006").productName("Đầm wrap dáng A").sku("DWA-001").price(new BigDecimal("650000")).sizeInfo("S/M/L/XL").color("Xanh navy").category(cat3).build());
        productRepository.save(Product.builder().productId("PRD007").productName("Túi tote canvas").sku("TTC-001").price(new BigDecimal("175000")).sizeInfo("One size").color("Kem").category(cat4).build());
        System.out.println(">>> Đã tạo 7 sản phẩm");
    }

    private void seedContracts() {
        if (contractRepository.count() > 0) return;
        Employee emp1 = employeeRepository.findById("EMP001").orElseThrow();
        Employee emp2 = employeeRepository.findById("EMP002").orElseThrow();
        Employee emp3 = employeeRepository.findById("EMP003").orElseThrow();
        Employee emp4 = employeeRepository.findById("EMP004").orElseThrow();
        Employee emp5 = employeeRepository.findById("EMP005").orElseThrow();
        Employee emp6 = employeeRepository.findById("EMP006").orElseThrow();

        contractRepository.save(Contract.builder().contractId("CTR001").employee(emp1).contractType("FULL_TIME").startDate(LocalDate.of(2022, 1, 1)).baseSalary(new BigDecimal("25000000")).allowance(new BigDecimal("3000000")).status("ACTIVE").approvedBy(emp1).approvedDate(LocalDateTime.of(2022, 1, 1, 9, 0)).build());
        contractRepository.save(Contract.builder().contractId("CTR002").employee(emp2).contractType("FULL_TIME").startDate(LocalDate.of(2022, 3, 1)).endDate(LocalDate.of(2025, 2, 28)).baseSalary(new BigDecimal("15000000")).allowance(new BigDecimal("2000000")).status("ACTIVE").approvedBy(emp1).approvedDate(LocalDateTime.of(2022, 3, 1, 9, 0)).build());
        contractRepository.save(Contract.builder().contractId("CTR003").employee(emp3).contractType("FULL_TIME").startDate(LocalDate.of(2023, 6, 1)).endDate(LocalDate.of(2025, 5, 31)).baseSalary(new BigDecimal("12000000")).allowance(new BigDecimal("1500000")).status("ACTIVE").approvedBy(emp1).approvedDate(LocalDateTime.of(2023, 6, 1, 9, 0)).build());
        contractRepository.save(Contract.builder().contractId("CTR004").employee(emp4).contractType("FULL_TIME").startDate(LocalDate.of(2022, 8, 1)).endDate(LocalDate.of(2025, 7, 31)).baseSalary(new BigDecimal("15000000")).allowance(new BigDecimal("2000000")).status("ACTIVE").approvedBy(emp1).approvedDate(LocalDateTime.of(2022, 8, 1, 9, 0)).build());
        contractRepository.save(Contract.builder().contractId("CTR005").employee(emp5).contractType("PART_TIME").startDate(LocalDate.of(2024, 1, 1)).endDate(LocalDate.of(2024, 12, 31)).baseSalary(new BigDecimal("8000000")).status("EXPIRED").build());
        contractRepository.save(Contract.builder().contractId("CTR006").employee(emp6).contractType("FULL_TIME").startDate(LocalDate.of(2023, 4, 1)).endDate(LocalDate.of(2025, 3, 31)).baseSalary(new BigDecimal("15000000")).allowance(new BigDecimal("2000000")).status("ACTIVE").approvedBy(emp1).approvedDate(LocalDateTime.of(2023, 4, 1, 9, 0)).build());
        System.out.println(">>> Đã tạo 6 hợp đồng");
    }

    private void seedAttendance() {
        if (attendanceRepository.count() > 0) return;
        Employee emp1 = employeeRepository.findById("EMP001").orElseThrow();
        Employee emp2 = employeeRepository.findById("EMP002").orElseThrow();
        Employee emp3 = employeeRepository.findById("EMP003").orElseThrow();

        LocalDate today = LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            attendanceRepository.save(Attendance.builder().employee(emp1).dateWork(date).checkInTime(date.atTime(8, 0)).checkOutTime(date.atTime(17, 30)).totalHours(new BigDecimal("9.5")).status("PRESENT").build());
            attendanceRepository.save(Attendance.builder().employee(emp2).dateWork(date).checkInTime(date.atTime(8, 15)).checkOutTime(date.atTime(17, 45)).totalHours(new BigDecimal("9.5")).status("PRESENT").build());
            attendanceRepository.save(Attendance.builder().employee(emp3).dateWork(date).checkInTime(date.atTime(8, 30)).checkOutTime(date.atTime(17, 0)).totalHours(new BigDecimal("8.5")).status("PRESENT").build());
        }
        System.out.println(">>> Đã tạo dữ liệu chấm công 7 ngày");
    }

    private void seedSuppliers() {
        if (supplierRepository.count() > 0) return;
        supplierRepository.save(Supplier.builder().supplierId("SUP001").supplierName("Công ty Thời Trang Việt").contact("Nguyễn Văn An").phoneNumber("0281234567").address("100 Lê Lai, Q.1, TP.HCM").email("contact@thoitrangviet.vn").build());
        supplierRepository.save(Supplier.builder().supplierId("SUP002").supplierName("Xưởng May Minh Châu").contact("Trần Thị Châu").phoneNumber("0287654321").address("50 Nguyễn Trãi, Q.5, TP.HCM").email("minhchau@gmail.com").build());
        supplierRepository.save(Supplier.builder().supplierId("SUP003").supplierName("Fashion Import Co.").contact("Lê Minh Tuấn").phoneNumber("0283456789").address("200 Điện Biên Phủ, Q.BT, TP.HCM").email("info@fashionimport.vn").build());
        System.out.println(">>> Đã tạo 3 nhà cung cấp");
    }

    private void seedInventory() {
        if (inventoryRepository.count() > 0) return;
        Branch br1 = branchRepository.findById("BR001").orElseThrow();
        Branch br2 = branchRepository.findById("BR002").orElseThrow();

        String[] productIds = {"PRD001", "PRD002", "PRD003", "PRD004", "PRD005", "PRD006", "PRD007"};
        int idx = 1;
        for (String pid : productIds) {
            Product p = productRepository.findById(pid).orElseThrow();
            inventoryRepository.save(Inventory.builder().inventoryId("INV" + String.format("%03d", idx)).product(p).branch(br1).quantity(20 + idx * 3).minThreshold(5).build());
            idx++;
            inventoryRepository.save(Inventory.builder().inventoryId("INV" + String.format("%03d", idx)).product(p).branch(br2).quantity(10 + idx).minThreshold(5).build());
            idx++;
        }
        System.out.println(">>> Đã tạo tồn kho cho 2 chi nhánh");
    }

    private void seedOrders() {
        if (ordersRepository.count() > 0) return;
        Branch br1 = branchRepository.findById("BR001").orElseThrow();
        Branch br2 = branchRepository.findById("BR002").orElseThrow();
        Employee emp2 = employeeRepository.findById("EMP002").orElseThrow();
        Employee emp5 = employeeRepository.findById("EMP005").orElseThrow();

        ordersRepository.save(Orders.builder().orderId("ORD001").branch(br1).employee(emp2).orderType("OFFLINE").totalAmount(new BigDecimal("735000")).paymentMethod("CASH").status("COMPLETED").build());
        ordersRepository.save(Orders.builder().orderId("ORD002").branch(br1).employee(emp2).orderType("OFFLINE").totalAmount(new BigDecimal("450000")).paymentMethod("TRANSFER").status("COMPLETED").build());
        ordersRepository.save(Orders.builder().orderId("ORD003").branch(br2).employee(emp5).orderType("OFFLINE").totalAmount(new BigDecimal("1170000")).paymentMethod("CASH").status("COMPLETED").build());
        ordersRepository.save(Orders.builder().orderId("ORD004").branch(br2).employee(emp5).orderType("ONLINE").totalAmount(new BigDecimal("650000")).paymentMethod("TRANSFER").shippingAddress("123 Lê Lợi, Q.1").status("PENDING").build());
        ordersRepository.save(Orders.builder().orderId("ORD005").branch(br1).employee(emp2).orderType("OFFLINE").totalAmount(new BigDecimal("285000")).paymentMethod("CARD").status("COMPLETED").build());
        System.out.println(">>> Đã tạo 5 đơn hàng");
    }

    private void seedRecruitment() {
        if (recruitmentRequestRepository.count() > 0) return;
        Employee emp1 = employeeRepository.findById("EMP001").orElseThrow();
        Employee emp2 = employeeRepository.findById("EMP002").orElseThrow();

        recruitmentRequestRepository.save(RecruitmentRequest.builder().requestId("REC001").position("Nhân viên bán hàng").quantity(2).description("Tuyển 2 nhân viên bán hàng cho chi nhánh Q1").status("OPEN").createdBy(emp1).build());
        recruitmentRequestRepository.save(RecruitmentRequest.builder().requestId("REC002").position("Thu ngân").quantity(1).description("Tuyển thu ngân ca tối").status("OPEN").createdBy(emp2).build());
        recruitmentRequestRepository.save(RecruitmentRequest.builder().requestId("REC003").position("Kho vận").quantity(1).description("Quản lý kho hàng chi nhánh").status("CLOSED").createdBy(emp1).build());

        candidateRepository.save(Candidate.builder().candidateId("CAN001").fullName("Nguyễn Thị Bích").email("bich.nguyen@gmail.com").phoneNumber("0912345001").appliedPosition("Nhân viên bán hàng").source("Facebook").status("INTERVIEWING").build());
        candidateRepository.save(Candidate.builder().candidateId("CAN002").fullName("Trần Văn Đức").email("duc.tran@gmail.com").phoneNumber("0912345002").appliedPosition("Nhân viên bán hàng").source("JobStreet").status("NEW").build());
        candidateRepository.save(Candidate.builder().candidateId("CAN003").fullName("Lê Thị Cẩm").email("cam.le@gmail.com").phoneNumber("0912345003").appliedPosition("Thu ngân").source("Người quen").status("OFFERED").build());
        System.out.println(">>> Đã tạo 3 yêu cầu tuyển dụng, 3 ứng viên");
    }

    private void seedAssets() {
        if (assetRepository.count() > 0) return;
        Employee emp2 = employeeRepository.findById("EMP002").orElseThrow();
        Employee emp3 = employeeRepository.findById("EMP003").orElseThrow();
        Employee emp4 = employeeRepository.findById("EMP004").orElseThrow();

        assetRepository.save(Asset.builder().assetId("AST001").assetName("Laptop Dell Inspiron 15").assetType("Thiết bị IT").employee(emp3).handoverDate(LocalDate.of(2023, 1, 10)).assetCondition("GOOD").assetValue(new BigDecimal("18000000")).build());
        assetRepository.save(Asset.builder().assetId("AST002").assetName("Máy tính bảng Samsung").assetType("Thiết bị IT").employee(emp2).handoverDate(LocalDate.of(2023, 3, 15)).assetCondition("GOOD").assetValue(new BigDecimal("8000000")).build());
        assetRepository.save(Asset.builder().assetId("AST003").assetName("Máy in HP LaserJet").assetType("Văn phòng phẩm").employee(emp4).handoverDate(LocalDate.of(2022, 6, 1)).assetCondition("FAIR").assetValue(new BigDecimal("5000000")).build());
        assetRepository.save(Asset.builder().assetId("AST004").assetName("Điện thoại iPhone 13").assetType("Thiết bị IT").assetCondition("GOOD").assetValue(new BigDecimal("15000000")).build());
        System.out.println(">>> Đã tạo 4 tài sản");
    }

    private void seedPayroll() {
        if (payrollRepository.count() > 0) return;
        Employee emp1 = employeeRepository.findById("EMP001").orElseThrow();
        Employee emp2 = employeeRepository.findById("EMP002").orElseThrow();
        Employee emp3 = employeeRepository.findById("EMP003").orElseThrow();

        payrollRepository.save(Payroll.builder().payrollId("PAY001").employee(emp1).monthNum(3).yearNum(2026).baseSalary(new BigDecimal("25000000")).allowance(new BigDecimal("3000000")).overtimePay(new BigDecimal("0")).salesBonus(new BigDecimal("2000000")).abcBonus(new BigDecimal("0")).deduction(new BigDecimal("0")).netSalary(new BigDecimal("30000000")).status("PAID").approvedBy(emp1).build());
        payrollRepository.save(Payroll.builder().payrollId("PAY002").employee(emp2).monthNum(3).yearNum(2026).baseSalary(new BigDecimal("15000000")).allowance(new BigDecimal("2000000")).overtimePay(new BigDecimal("500000")).salesBonus(new BigDecimal("1000000")).abcBonus(new BigDecimal("0")).deduction(new BigDecimal("0")).netSalary(new BigDecimal("18500000")).status("PAID").approvedBy(emp1).build());
        payrollRepository.save(Payroll.builder().payrollId("PAY003").employee(emp3).monthNum(3).yearNum(2026).baseSalary(new BigDecimal("12000000")).allowance(new BigDecimal("1500000")).overtimePay(new BigDecimal("0")).salesBonus(new BigDecimal("0")).abcBonus(new BigDecimal("0")).deduction(new BigDecimal("300000")).netSalary(new BigDecimal("13200000")).status("CONFIRMED").approvedBy(emp1).build());
        payrollRepository.save(Payroll.builder().payrollId("PAY004").employee(emp1).monthNum(4).yearNum(2026).baseSalary(new BigDecimal("25000000")).allowance(new BigDecimal("3000000")).overtimePay(new BigDecimal("0")).salesBonus(new BigDecimal("0")).abcBonus(new BigDecimal("0")).deduction(new BigDecimal("0")).netSalary(new BigDecimal("28000000")).status("DRAFT").build());
        payrollRepository.save(Payroll.builder().payrollId("PAY005").employee(emp2).monthNum(4).yearNum(2026).baseSalary(new BigDecimal("15000000")).allowance(new BigDecimal("2000000")).overtimePay(new BigDecimal("0")).salesBonus(new BigDecimal("0")).abcBonus(new BigDecimal("0")).deduction(new BigDecimal("0")).netSalary(new BigDecimal("17000000")).status("DRAFT").build());
        System.out.println(">>> Đã tạo 5 bản lương");
    }
}
