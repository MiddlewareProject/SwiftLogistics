package com.swiftlogistics.ROS_Adapter.service;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Approximate town-centre coordinates for the Sri Lankan locations used in mock order
 * addresses. There is no real geocoding service wired up, so addresses resolve to the
 * nearest known town centre (with a small deterministic jitter) purely to support
 * distance-based route sequencing on the server side. Mirrors the lookup table used by
 * the frontend map (frontend/src/App.jsx).
 */
public final class SriLankaGeocoder {

    private static final Map<String, double[]> CITY_COORDINATES = new LinkedHashMap<>();

    static {
        CITY_COORDINATES.put("colombo", new double[]{6.9271, 79.8612});
        CITY_COORDINATES.put("kandy", new double[]{7.2906, 80.6337});
        CITY_COORDINATES.put("galle", new double[]{6.0535, 80.2210});
        CITY_COORDINATES.put("matara", new double[]{5.9549, 80.5550});
        CITY_COORDINATES.put("jaffna", new double[]{9.6615, 80.0255});
        CITY_COORDINATES.put("trincomalee", new double[]{8.5874, 81.2152});
        CITY_COORDINATES.put("negombo", new double[]{7.2083, 79.8358});
        CITY_COORDINATES.put("kurunegala", new double[]{7.4863, 80.3623});
        CITY_COORDINATES.put("anuradhapura", new double[]{8.3114, 80.4037});
        CITY_COORDINATES.put("batticaloa", new double[]{7.7167, 81.7000});
        CITY_COORDINATES.put("ratnapura", new double[]{6.6828, 80.3992});
        CITY_COORDINATES.put("badulla", new double[]{6.9934, 81.0550});
        CITY_COORDINATES.put("nuwara eliya", new double[]{6.9497, 80.7891});
        CITY_COORDINATES.put("gampaha", new double[]{7.0917, 80.0099});
        CITY_COORDINATES.put("kalutara", new double[]{6.5854, 79.9607});
        CITY_COORDINATES.put("polonnaruwa", new double[]{7.9403, 81.0188});
        CITY_COORDINATES.put("vavuniya", new double[]{8.7514, 80.4971});
        CITY_COORDINATES.put("ampara", new double[]{7.2975, 81.6747});
        CITY_COORDINATES.put("hambantota", new double[]{6.1246, 81.1185});
        CITY_COORDINATES.put("puttalam", new double[]{8.0362, 79.8283});
        CITY_COORDINATES.put("chilaw", new double[]{7.5765, 79.7958});
        CITY_COORDINATES.put("matale", new double[]{7.4675, 80.6234});
        CITY_COORDINATES.put("kegalle", new double[]{7.2513, 80.3464});
        CITY_COORDINATES.put("nugegoda", new double[]{6.8649, 79.8997});
        CITY_COORDINATES.put("moratuwa", new double[]{6.7730, 79.8816});
        CITY_COORDINATES.put("dehiwala", new double[]{6.8510, 79.8654});
        CITY_COORDINATES.put("maharagama", new double[]{6.8481, 79.9265});
        CITY_COORDINATES.put("kotte", new double[]{6.8905, 79.9016});
        CITY_COORDINATES.put("battaramulla", new double[]{6.8994, 79.9170});
        CITY_COORDINATES.put("malabe", new double[]{6.9057, 79.9634});
        CITY_COORDINATES.put("rajagiriya", new double[]{6.9095, 79.8969});
        CITY_COORDINATES.put("kaduwela", new double[]{6.9330, 79.9836});
        CITY_COORDINATES.put("wattala", new double[]{6.9890, 79.8926});
        CITY_COORDINATES.put("kelaniya", new double[]{6.9553, 79.9218});
        CITY_COORDINATES.put("kadawatha", new double[]{7.0008, 79.9515});
        CITY_COORDINATES.put("kottawa", new double[]{6.8408, 79.9633});
        CITY_COORDINATES.put("piliyandala", new double[]{6.8014, 79.9227});
        CITY_COORDINATES.put("boralesgamuwa", new double[]{6.8386, 79.9010});
        CITY_COORDINATES.put("homagama", new double[]{6.8442, 80.0021});
        CITY_COORDINATES.put("ja-ela", new double[]{7.0744, 79.8917});
        CITY_COORDINATES.put("wellawatte", new double[]{6.8767, 79.8593});
        CITY_COORDINATES.put("kollupitiya", new double[]{6.9105, 79.8497});
    }

    private static final double[] DEFAULT_COORDINATES = CITY_COORDINATES.get("colombo");

    private SriLankaGeocoder() {
    }

    /** Groups addresses for route-batching purposes: the matched town name, or "colombo" if none match. */
    public static String resolveRegion(String address) {
        if (address == null) {
            return "colombo";
        }
        String lower = address.toLowerCase();
        return CITY_COORDINATES.keySet().stream()
                .filter(lower::contains)
                .findFirst()
                .orElse("colombo");
    }

    public static double[] resolveCoordinates(String address) {
        if (address == null) {
            return DEFAULT_COORDINATES;
        }
        String lower = address.toLowerCase();
        double[] base = CITY_COORDINATES.entrySet().stream()
                .filter(entry -> lower.contains(entry.getKey()))
                .map(Map.Entry::getValue)
                .findFirst()
                .orElse(DEFAULT_COORDINATES);

        int hash = address.hashCode();
        double jitterLat = ((hash % 1000) / 1000.0 - 0.5) * 0.025;
        double jitterLng = (((Math.abs(hash) >> 8) % 1000) / 1000.0 - 0.5) * 0.025;
        return new double[]{base[0] + jitterLat, base[1] + jitterLng};
    }

    public static double haversineKm(double[] from, double[] to) {
        double earthRadiusKm = 6371.0;
        double dLat = Math.toRadians(to[0] - from[0]);
        double dLng = Math.toRadians(to[1] - from[1]);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(from[0])) * Math.cos(Math.toRadians(to[0]))
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return earthRadiusKm * c;
    }
}
