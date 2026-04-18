package com.forher.erp_backend.service;

import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class OtpStore {

    private record OtpEntry(String code, LocalDateTime expiry) {}

    private final Map<String, OtpEntry> store = new ConcurrentHashMap<>();
    private final Random random = new Random();

    public String generate(String key) {
        String code = String.format("%06d", random.nextInt(1_000_000));
        store.put(key, new OtpEntry(code, LocalDateTime.now().plusMinutes(5)));
        System.out.println(">>> OTP [" + key + "] = " + code); // dev log
        return code;
    }

    public boolean verify(String key, String code) {
        OtpEntry entry = store.get(key);
        if (entry == null) return false;
        if (LocalDateTime.now().isAfter(entry.expiry())) { store.remove(key); return false; }
        if (!entry.code().equals(code)) return false;
        store.remove(key);
        return true;
    }
}
