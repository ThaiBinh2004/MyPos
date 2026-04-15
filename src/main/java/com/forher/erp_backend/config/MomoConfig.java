package com.forher.erp_backend.config;

import org.springframework.context.annotation.Configuration;

@Configuration
public class MomoConfig {
    // THÔNG SỐ TEST SANDBOX TỪ TRANG CHỦ MOMO
    public static final String PARTNER_CODE = "MOMOBKUN20180529";
    public static final String ACCESS_KEY = "klm05TvNCzjfasWj";
    public static final String SECRET_KEY = "at67qH6mk8w5Y1nAwMovdMenXuuwON3HX";

    // API Endpoint của MoMo để tạo mã thanh toán
    public static final String MOMO_API_URL = "https://test-payment.momo.vn/v2/gateway/api/create";

    // Đường dẫn Frontend/Backend sau khi khách thanh toán xong (Sửa port nếu cần)
    public static final String RETURN_URL = "http://localhost:8080/api/v1/payment/momo-return";
    public static final String IPN_URL = "http://localhost:8080/api/v1/payment/momo-ipn";
}