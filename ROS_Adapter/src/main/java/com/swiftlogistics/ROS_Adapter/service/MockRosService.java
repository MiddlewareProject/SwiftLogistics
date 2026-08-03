package com.swiftlogistics.ROS_Adapter.service;

import com.swiftlogistics.ROS_Adapter.dto.DriverInfo;
import com.swiftlogistics.ROS_Adapter.dto.OrderCreatedEvent;
import com.swiftlogistics.ROS_Adapter.dto.RouteResult;
import com.swiftlogistics.ROS_Adapter.dto.VehicleStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Random;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class MockRosService {
    private static final String[] TRAFFIC_LEVELS = {"LOW", "LOW", "MEDIUM", "MEDIUM", "HIGH"};

    private final List<DriverInfo> drivers = List.of(
            DriverInfo.builder().driverId("DRV-01").name("Marcus Vance").status("AVAILABLE").build(),
            DriverInfo.builder().driverId("DRV-02").name("Elena Rostova").status("AVAILABLE").build(),
            DriverInfo.builder().driverId("DRV-03").name("John Miller").status("AVAILABLE").build(),
            DriverInfo.builder().driverId("DRV-04").name("David Kim").status("AVAILABLE").build(),
            DriverInfo.builder().driverId("DRV-05").name("Priya Nair").status("AVAILABLE").build()
    );

    private final List<VehicleStatus> vehicles = List.of(
            VehicleStatus.builder().vehicleId("VEH-01").vehiclePlate("TRK-982").vehicleType("Volvo VNL Truck").status("IDLE").build(),
            VehicleStatus.builder().vehicleId("VEH-02").vehiclePlate("TRK-441").vehicleType("Freightliner M2").status("IDLE").build(),
            VehicleStatus.builder().vehicleId("VEH-03").vehiclePlate("TRK-208").vehicleType("Peterbilt 579").status("IDLE").build(),
            VehicleStatus.builder().vehicleId("VEH-04").vehiclePlate("VAN-115").vehicleType("Ford Transit Van").status("IDLE").build(),
            VehicleStatus.builder().vehicleId("VEH-05").vehiclePlate("VAN-330").vehicleType("Mercedes Sprinter").status("MAINTENANCE").build()
    );

    private final AtomicInteger assignmentIndex = new AtomicInteger(0);
    private final Random random = new Random();

    public RouteResult generateRoute(OrderCreatedEvent event) {
        int startIndex = assignmentIndex.getAndIncrement();
        VehicleStatus vehicle = pickAvailableVehicle(startIndex);
        DriverInfo driver = drivers.get(startIndex % drivers.size());

        vehicle.setStatus("EN_ROUTE");
        driver.setStatus("ON_ROUTE");

        double distanceKm = 2 + ThreadLocalRandom.current().nextDouble(43);
        int durationMinutes = (int) Math.round(distanceKm * (1.5 + ThreadLocalRandom.current().nextDouble(1.5)));
        String trafficLevel = TRAFFIC_LEVELS[ThreadLocalRandom.current().nextInt(TRAFFIC_LEVELS.length)];
        long optimizationTimeMs = 80 + ThreadLocalRandom.current().nextInt(320);
        String routeId = "RT-" + (10000000 + random.nextInt(90000000));

        return RouteResult.builder()
                .orderNumber(event.getOrderNumber())
                .clientId(event.getClientId())
                .routeId(routeId)
                .driverId(driver.getDriverId())
                .driverName(driver.getName())
                .vehicleId(vehicle.getVehicleId())
                .vehiclePlate(vehicle.getVehiclePlate())
                .vehicleType(vehicle.getVehicleType())
                .pickupAddress(event.getSenderAddress())
                .deliveryAddress(event.getRecipientAddress())
                .distanceKm(Math.round(distanceKm * 10) / 10.0)
                .durationMinutes(durationMinutes)
                .trafficLevel(trafficLevel)
                .optimizationTimeMs(optimizationTimeMs)
                .generatedAt(LocalDateTime.now())
                .build();
    }

    public List<VehicleStatus> getVehicleStatuses() {
        return vehicles;
    }

    public int getVehicleCount() {
        return vehicles.size();
    }

    public int getDriverCount() {
        return drivers.size();
    }

    public boolean isHealthy() {
        return true;
    }

    private VehicleStatus pickAvailableVehicle(int startIndex) {
        for (int offset = 0; offset < vehicles.size(); offset++) {
            VehicleStatus candidate = vehicles.get((startIndex + offset) % vehicles.size());
            if (!"MAINTENANCE".equals(candidate.getStatus())) {
                return candidate;
            }
        }
        return vehicles.get(startIndex % vehicles.size());
    }
}
