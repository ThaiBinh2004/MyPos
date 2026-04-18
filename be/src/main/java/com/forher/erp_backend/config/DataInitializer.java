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
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserAccountRepository    userAccountRepository;
    private final PasswordEncoder          passwordEncoder;
    private final BranchRepository         branchRepository;
    private final EmployeeRepository       employeeRepository;
    private final ContractRepository       contractRepository;
    private final PayrollRepository        payrollRepository;
    private final SalesRecordRepository    salesRecordRepository;
    private final PayrollDeductionRepository payrollDeductionRepository;
    private final AttendanceRepository     attendanceRepository;
    private final AttendanceRequestRepository attendanceRequestRepository;
    private final CategoryRepository        categoryRepository;
    private final ProductRepository         productRepository;
    private final InventoryRepository       inventoryRepository;
    private final CustomerRepository        customerRepository;

    @Override
    public void run(String... args) {
        seedBranches();
        seedEmployees();
        seedAccounts();
        seedContracts();
        seedCategories();
        seedProducts();
        seedInventory();
        seedCustomers();
        cleanJunkData();
    }

    // ── Chi nhánh ────────────────────────────────────────────────────────────────
    private void seedBranches() {
        if (branchRepository.count() > 0) return;
        branchRepository.save(Branch.builder().branchId("BR001").branchName("Chi nhánh Quận 1").address("123 Nguyễn Huệ, Q.1, TP.HCM").build());
        branchRepository.save(Branch.builder().branchId("BR002").branchName("Chi nhánh Quận 3").address("456 Võ Văn Tần, Q.3, TP.HCM").build());
        branchRepository.save(Branch.builder().branchId("BR003").branchName("Chi nhánh Bình Thạnh").address("789 Xô Viết Nghệ Tĩnh, Q.BT, TP.HCM").build());
        System.out.println(">>> Đã tạo 3 chi nhánh");
    }

    // ── Nhân viên ────────────────────────────────────────────────────────────────
    private void seedEmployees() {
        if (employeeRepository.count() > 0) return;
        Branch br1 = branchRepository.findById("BR001").orElseThrow();
        Branch br2 = branchRepository.findById("BR002").orElseThrow();
        Branch br3 = branchRepository.findById("BR003").orElseThrow();

        employeeRepository.save(Employee.builder().employeeId("EMP001").fullName("Phạm Huỳnh Thiên Huy").dateOfBirth(LocalDate.of(1990, 5, 15)).idCard("079090001234").phoneNumber("0901234501").email("phamhuynhthienhuy002@gmail.com").bankAccount("0011234567890").position("Giám đốc").branch(br1).defaultShift("HANH_CHINH").build());
        employeeRepository.save(Employee.builder().employeeId("EMP002").fullName("Trần Văn Minh").dateOfBirth(LocalDate.of(1988, 3, 20)).idCard("079088001235").phoneNumber("0901234502").bankAccount("0011234567891").position("Quản lý chi nhánh").branch(br1).defaultShift("HANH_CHINH").build());
        employeeRepository.save(Employee.builder().employeeId("EMP003").fullName("Lê Thị Mai").dateOfBirth(LocalDate.of(1995, 8, 10)).idCard("079095001236").phoneNumber("0901234503").bankAccount("0011234567892").position("Nhân viên bán hàng").branch(br1).defaultShift("CA_SANG").build());
        employeeRepository.save(Employee.builder().employeeId("EMP004").fullName("Phạm Văn Hùng").dateOfBirth(LocalDate.of(1993, 12, 5)).idCard("079093001237").phoneNumber("0901234504").bankAccount("0011234567893").position("Quản lý chi nhánh").branch(br2).defaultShift("HANH_CHINH").build());
        employeeRepository.save(Employee.builder().employeeId("EMP005").fullName("Hoàng Thị Lan").dateOfBirth(LocalDate.of(1997, 6, 25)).idCard("079097001238").phoneNumber("0901234505").bankAccount("0011234567894").position("Nhân viên bán hàng").branch(br2).defaultShift("CA_TOI").build());
        employeeRepository.save(Employee.builder().employeeId("EMP006").fullName("Đặng Văn Tùng").dateOfBirth(LocalDate.of(1996, 9, 14)).idCard("079096001239").phoneNumber("0901234506").bankAccount("0011234567895").position("Quản lý chi nhánh").branch(br3).defaultShift("HANH_CHINH").build());
        employeeRepository.save(Employee.builder().employeeId("EMP007").fullName("Nguyễn Thị Hoa").dateOfBirth(LocalDate.of(1999, 3, 8)).idCard("079099001240").phoneNumber("0901234507").bankAccount("0011234567896").position("Nhân viên bán hàng").branch(br1).defaultShift("CA_SANG").build());
        System.out.println(">>> Đã tạo 7 nhân viên");
    }

    // ── Tài khoản ────────────────────────────────────────────────────────────────
    private void seedAccounts() {
        if (userAccountRepository.count() > 0) {
            // Đảm bảo luôn có acc kế toán dù đã seed trước đó
            if (userAccountRepository.findByUsername("accountant").isEmpty()) {
                Employee emp3 = employeeRepository.findById("EMP003").orElseThrow();
                userAccountRepository.save(UserAccount.builder()
                        .accountId("ACC003").username("accountant")
                        .password(passwordEncoder.encode("accountant123"))
                        .role("accountant").employee(emp3).build());
                System.out.println(">>> Đã tạo bổ sung acc kế toán");
            }
            return;
        }
        Employee emp1 = employeeRepository.findById("EMP001").orElseThrow();
        Employee emp2 = employeeRepository.findById("EMP002").orElseThrow();
        Employee emp3 = employeeRepository.findById("EMP003").orElseThrow();
        Employee emp4 = employeeRepository.findById("EMP004").orElseThrow();
        Employee emp5 = employeeRepository.findById("EMP005").orElseThrow();
        Employee emp6 = employeeRepository.findById("EMP006").orElseThrow();
        Employee emp7 = employeeRepository.findById("EMP007").orElseThrow();

        userAccountRepository.save(UserAccount.builder().accountId("ACC001").username("director").password(passwordEncoder.encode("director123")).role("director").employee(emp1).build());
        userAccountRepository.save(UserAccount.builder().accountId("ACC002").username("manager1").password(passwordEncoder.encode("manager123")).role("branch_manager").employee(emp2).build());
        userAccountRepository.save(UserAccount.builder().accountId("ACC003").username("accountant").password(passwordEncoder.encode("accountant123")).role("accountant").employee(emp3).build());
        userAccountRepository.save(UserAccount.builder().accountId("ACC004").username("manager2").password(passwordEncoder.encode("manager123")).role("branch_manager").employee(emp4).build());
        userAccountRepository.save(UserAccount.builder().accountId("ACC005").username("hr").password(passwordEncoder.encode("hr123")).role("hr").employee(emp5).build());
        userAccountRepository.save(UserAccount.builder().accountId("ACC006").username("manager3").password(passwordEncoder.encode("manager123")).role("branch_manager").employee(emp6).build());
        userAccountRepository.save(UserAccount.builder().accountId("ACC007").username("employee1").password(passwordEncoder.encode("employee123")).role("employee").employee(emp7).build());
        System.out.println(">>> Đã tạo 7 tài khoản");
    }

    // ── Hợp đồng (luôn đảm bảo đủ & ACTIVE) ────────────────────────────────────
    private void seedContracts() {
        Employee emp1 = employeeRepository.findById("EMP001").orElseThrow();

        upsertContract("CTR001", emp1,  emp1, "FULL_TIME",  LocalDate.of(2022, 1, 1), LocalDate.of(2027, 12, 31), new BigDecimal("25000000"), new BigDecimal("3000000"));
        upsertContract("CTR002", employeeRepository.findById("EMP002").orElseThrow(), emp1, "FULL_TIME",  LocalDate.of(2022, 3, 1), LocalDate.of(2027, 12, 31), new BigDecimal("15000000"), new BigDecimal("2000000"));
        upsertContract("CTR003", employeeRepository.findById("EMP003").orElseThrow(), emp1, "FULL_TIME",  LocalDate.of(2023, 6, 1), LocalDate.of(2027, 12, 31), new BigDecimal("10000000"), new BigDecimal("1000000"));
        upsertContract("CTR004", employeeRepository.findById("EMP004").orElseThrow(), emp1, "FULL_TIME",  LocalDate.of(2022, 8, 1), LocalDate.of(2027, 12, 31), new BigDecimal("15000000"), new BigDecimal("2000000"));
        upsertContract("CTR005", employeeRepository.findById("EMP005").orElseThrow(), emp1, "FULL_TIME",  LocalDate.of(2024, 1, 1), LocalDate.of(2027, 12, 31), new BigDecimal("10000000"), new BigDecimal("1000000"));
        upsertContract("CTR006", employeeRepository.findById("EMP006").orElseThrow(), emp1, "FULL_TIME",  LocalDate.of(2023, 4, 1), LocalDate.of(2027, 12, 31), new BigDecimal("15000000"), new BigDecimal("2000000"));
        upsertContract("CTR007", employeeRepository.findById("EMP007").orElseThrow(), emp1, "FULL_TIME",  LocalDate.of(2024, 6, 1), LocalDate.of(2027, 12, 31), new BigDecimal("8000000"),  new BigDecimal("500000"));
        System.out.println(">>> Đã đảm bảo 7 hợp đồng ACTIVE");
    }

    private void upsertContract(String id, Employee emp, Employee approver,
                                 String type, LocalDate start, LocalDate end,
                                 BigDecimal salary, BigDecimal allowance) {
        Contract existing = contractRepository.findById(id).orElse(null);
        if (existing == null) {
            contractRepository.save(Contract.builder()
                    .contractId(id).employee(emp).contractType(type)
                    .startDate(start).endDate(end)
                    .baseSalary(salary).allowance(allowance)
                    .status("ACTIVE")
                    .approvedBy(approver).approvedDate(LocalDateTime.now())
                    .build());
        } else {
            // Đảm bảo endDate & status luôn đúng
            existing.setEndDate(end);
            existing.setStatus("ACTIVE");
            existing.setBaseSalary(salary);
            existing.setAllowance(allowance);
            contractRepository.save(existing);
        }
    }

    // ── Danh mục ─────────────────────────────────────────────────────────────────
    private void seedCategories() {
        if (categoryRepository.count() > 0) return;
        categoryRepository.save(Category.builder().categoryId("CAT001").categoryName("Áo").description("Áo các loại").build());
        categoryRepository.save(Category.builder().categoryId("CAT002").categoryName("Quần").description("Quần các loại").build());
        categoryRepository.save(Category.builder().categoryId("CAT003").categoryName("Váy").description("Váy đầm các loại").build());
        categoryRepository.save(Category.builder().categoryId("CAT004").categoryName("Phụ kiện").description("Túi xách, thắt lưng, v.v.").build());
        System.out.println(">>> Đã tạo 4 danh mục");
    }

    // ── Sản phẩm ─────────────────────────────────────────────────────────────────
    private void seedProducts() {
        if (productRepository.count() > 0) return;
        Category ao  = categoryRepository.findById("CAT001").orElseThrow();
        Category quan = categoryRepository.findById("CAT002").orElseThrow();
        Category vay  = categoryRepository.findById("CAT003").orElseThrow();
        Category pk   = categoryRepository.findById("CAT004").orElseThrow();

        productRepository.save(Product.builder().productId("PRD001").sku("FH-AO-001").productName("Áo sơ mi trắng dài tay").price(new BigDecimal("320000")).sizeInfo("S/M/L/XL").color("Trắng").category(ao).build());
        productRepository.save(Product.builder().productId("PRD002").sku("FH-AO-002").productName("Áo thun basic cổ tròn").price(new BigDecimal("180000")).sizeInfo("S/M/L").color("Đen").category(ao).build());
        productRepository.save(Product.builder().productId("PRD003").sku("FH-AO-003").productName("Áo blouse hoa nhí").price(new BigDecimal("250000")).sizeInfo("S/M/L").color("Hồng").category(ao).build());
        productRepository.save(Product.builder().productId("PRD004").sku("FH-AO-004").productName("Áo croptop thể thao").price(new BigDecimal("150000")).sizeInfo("S/M").color("Xanh navy").category(ao).build());
        productRepository.save(Product.builder().productId("PRD005").sku("FH-QU-001").productName("Quần jean ống rộng").price(new BigDecimal("420000")).sizeInfo("26/27/28/29/30").color("Xanh nhạt").category(quan).build());
        productRepository.save(Product.builder().productId("PRD006").sku("FH-QU-002").productName("Quần kaki lưng cao").price(new BigDecimal("380000")).sizeInfo("26/27/28/29").color("Be").category(quan).build());
        productRepository.save(Product.builder().productId("PRD007").sku("FH-QU-003").productName("Quần short denim").price(new BigDecimal("220000")).sizeInfo("S/M/L").color("Xanh đậm").category(quan).build());
        productRepository.save(Product.builder().productId("PRD008").sku("FH-VA-001").productName("Váy midi hoa nhí").price(new BigDecimal("350000")).sizeInfo("S/M/L").color("Vàng").category(vay).build());
        productRepository.save(Product.builder().productId("PRD009").sku("FH-VA-002").productName("Đầm wrap dress").price(new BigDecimal("480000")).sizeInfo("S/M/L").color("Đỏ đô").category(vay).build());
        productRepository.save(Product.builder().productId("PRD010").sku("FH-VA-003").productName("Váy mini tennis").price(new BigDecimal("280000")).sizeInfo("S/M").color("Trắng").category(vay).build());
        productRepository.save(Product.builder().productId("PRD011").sku("FH-PK-001").productName("Túi xách tote canvas").price(new BigDecimal("220000")).color("Be").category(pk).build());
        productRepository.save(Product.builder().productId("PRD012").sku("FH-PK-002").productName("Thắt lưng da PU").price(new BigDecimal("130000")).color("Đen").category(pk).build());
        System.out.println(">>> Đã tạo 12 sản phẩm");
    }

    // ── Tồn kho ───────────────────────────────────────────────────────────────────
    private void seedInventory() {
        if (inventoryRepository.count() > 0) return;
        Branch br1 = branchRepository.findById("BR001").orElseThrow();
        Branch br2 = branchRepository.findById("BR002").orElseThrow();
        Branch br3 = branchRepository.findById("BR003").orElseThrow();
        List<Branch> branches = List.of(br1, br2, br3);

        int idx = 1;
        for (String pId : List.of("PRD001","PRD002","PRD003","PRD004","PRD005","PRD006","PRD007","PRD008","PRD009","PRD010","PRD011","PRD012")) {
            Product p = productRepository.findById(pId).orElseThrow();
            int[] qtys = { 30, 20, 15 };
            for (int b = 0; b < 3; b++) {
                String invId = String.format("INV%04d", idx++);
                inventoryRepository.save(Inventory.builder()
                        .inventoryId(invId).product(p).branch(branches.get(b))
                        .quantity(qtys[b]).minThreshold(5).build());
            }
        }
        System.out.println(">>> Đã tạo tồn kho cho 12 sản phẩm x 3 chi nhánh");
    }

    // ── Khách hàng ────────────────────────────────────────────────────────────────
    private void seedCustomers() {
        if (customerRepository.count() > 0) return;
        customerRepository.save(Customer.builder().customerId("CUS001").fullName("Nguyễn Thị Bích").phoneNumber("0911000001").email("bich@gmail.com").loyaltyPoints(1500).customerRank("VIP").build());
        customerRepository.save(Customer.builder().customerId("CUS002").fullName("Trần Minh Châu").phoneNumber("0911000002").email("chau@gmail.com").loyaltyPoints(850).customerRank("Vàng").build());
        customerRepository.save(Customer.builder().customerId("CUS003").fullName("Lê Khánh Ly").phoneNumber("0911000003").loyaltyPoints(350).customerRank("Bạc").build());
        customerRepository.save(Customer.builder().customerId("CUS004").fullName("Phạm Thu Hà").phoneNumber("0911000004").loyaltyPoints(80).customerRank("Thường").build());
        customerRepository.save(Customer.builder().customerId("CUS005").fullName("Hoàng Mỹ Linh").phoneNumber("0911000005").email("linh@gmail.com").loyaltyPoints(2300).customerRank("VIP").build());
        customerRepository.save(Customer.builder().customerId("CUS006").fullName("Vũ Thanh Tâm").phoneNumber("0911000006").loyaltyPoints(120).customerRank("Thường").build());
        customerRepository.save(Customer.builder().customerId("CUS007").fullName("Đỗ Ngọc Ánh").phoneNumber("0911000007").loyaltyPoints(650).customerRank("Bạc").build());
        System.out.println(">>> Đã tạo 7 khách hàng");
    }

    // ── Xóa dữ liệu rác (payroll, attendance, sales, deductions) ────────────────
    private void cleanJunkData() {
        try {
            long pr = payrollRepository.count();
            long sr = salesRecordRepository.count();
            long pd = payrollDeductionRepository.count();
            long at = attendanceRepository.count();
            long ar = attendanceRequestRepository.count();

            if (pr + sr + pd + at + ar == 0) return;

            attendanceRequestRepository.deleteAll();
            attendanceRepository.deleteAll();
            salesRecordRepository.deleteAll();
            payrollDeductionRepository.deleteAll();
            payrollRepository.deleteAll();

            System.out.println(">>> Đã xóa: " + pr + " payroll, " + sr + " sales, "
                    + pd + " deductions, " + at + " attendance, " + ar + " corrections");
        } catch (Exception e) {
            System.err.println(">>> Không thể xóa junk data: " + e.getMessage());
        }
    }
}
