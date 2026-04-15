package com.forher.erp_backend.service;

import com.forher.erp_backend.config.MomoConfig;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;

@Service
public class MomoService {

    public String createPaymentUrl(String orderId, String amountInfo) throws Exception {
        String requestId = UUID.randomUUID().toString();
        String orderInfo = "Thanh toan don hang FORHER: " + orderId;
        String amount = amountInfo;
        String requestType = "captureWallet";
        String extraData = ""; // Base64 rỗng

        // 1. Tạo chuỗi ký tự chuẩn theo format MoMo yêu cầu
        String rawSignature = "accessKey=" + MomoConfig.ACCESS_KEY
                + "&amount=" + amount
                + "&extraData=" + extraData
                + "&ipnUrl=" + MomoConfig.IPN_URL
                + "&orderId=" + orderId
                + "&orderInfo=" + orderInfo
                + "&partnerCode=" + MomoConfig.PARTNER_CODE
                + "&redirectUrl=" + MomoConfig.RETURN_URL
                + "&requestId=" + requestId
                + "&requestType=" + requestType;

        // 2. Mã hóa chữ ký (HMAC SHA256)
        String signature = signHmacSHA256(rawSignature, MomoConfig.SECRET_KEY);

        // 3. Đóng gói dữ liệu gửi lên MoMo
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("partnerCode", MomoConfig.PARTNER_CODE);
        requestBody.put("partnerName", "Test FORHER");
        requestBody.put("storeId", "MomoTestStore");
        requestBody.put("requestId", requestId);
        requestBody.put("amount", amount);
        requestBody.put("orderId", orderId);
        requestBody.put("orderInfo", orderInfo);
        requestBody.put("redirectUrl", MomoConfig.RETURN_URL);
        requestBody.put("ipnUrl", MomoConfig.IPN_URL);
        requestBody.put("lang", "vi");
        requestBody.put("extraData", extraData);
        requestBody.put("requestType", requestType);
        requestBody.put("signature", signature);

        // 4. Bắn Request sang MoMo (Dùng RestTemplate)
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        // Nhận JSON phản hồi từ MoMo (Chứa cái Link quét QR)
        Map<String, Object> response = restTemplate.postForObject(MomoConfig.MOMO_API_URL, entity, Map.class);

        if (response != null && response.get("payUrl") != null) {
            return response.get("payUrl").toString(); // Trả về link cho Frontend
        }
        throw new RuntimeException("Lỗi tạo đơn MoMo: " + response);
    }

    // Hàm băm mật mã chuẩn Java 17
    private String signHmacSHA256(String data, String secretKey) throws Exception {
        Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
        SecretKeySpec secret_key = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256_HMAC.init(secret_key);
        return HexFormat.of().formatHex(sha256_HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8)));
    }
}