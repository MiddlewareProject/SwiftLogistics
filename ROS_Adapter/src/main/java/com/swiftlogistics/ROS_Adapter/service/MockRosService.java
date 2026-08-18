package com.swiftlogistics.ROS_Adapter.service;

import com.swiftlogistics.ROS_Adapter.dto.DriverInfo;
import com.swiftlogistics.ROS_Adapter.dto.GroupedRouteDto;
import com.swiftlogistics.ROS_Adapter.dto.OrderCreatedEvent;
import com.swiftlogistics.ROS_Adapter.dto.RouteResult;
import com.swiftlogistics.ROS_Adapter.dto.RouteStopDto;
import com.swiftlogistics.ROS_Adapter.dto.VehicleStatus;
import com.swiftlogistics.ROS_Adapter.exception.RosIntegrationException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Deque;
import java.util.List;
import java.util.Random;
import java.util.concurrent.ConcurrentLinkedDeque;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class MockRosService {
    private static final String[] TRAFFIC_LEVELS = {"LOW", "LOW", "MEDIUM", "MEDIUM", "HIGH"};
    private static final int MAX_STOPS_PER_ROUTE = 4;
    private static final int MAX_ROUTE_HISTORY = 20;
    // Orders within this radius of an existing stop on an open route get batched onto it,
    // instead of every delivery becoming its own single-stop route.
    private static final double CLUSTER_RADIUS_KM = 15.0;

    private final List<DriverInfo> drivers = new CopyOnWriteArrayList<>(List.of(
            DriverInfo.builder().driverId("DRV-01").name("Amal Perera").status("AVAILABLE").build(),
            DriverInfo.builder().driverId("DRV-02").name("Nuwan Silva").status("AVAILABLE").build(),
            DriverInfo.builder().driverId("DRV-03").name("Kasun Fernando").status("AVAILABLE").build(),
            DriverInfo.builder().driverId("DRV-04").name("Chamara Rathnayake").status("AVAILABLE").build(),
            DriverInfo.builder().driverId("DRV-05").name("Saman Wickramasinghe").status("AVAILABLE").build()
    ));

    private final List<VehicleStatus> vehicles = new CopyOnWriteArrayList<>(List.of(
            VehicleStatus.builder().vehicleId("VEH-01").vehiclePlate("TRK-982").vehicleType("Volvo VNL Truck").status("IDLE").build(),
            VehicleStatus.builder().vehicleId("VEH-02").vehiclePlate("TRK-441").vehicleType("Freightliner M2").status("IDLE").build(),
            VehicleStatus.builder().vehicleId("VEH-03").vehiclePlate("TRK-208").vehicleType("Peterbilt 579").status("IDLE").build(),
            VehicleStatus.builder().vehicleId("VEH-04").vehiclePlate("VAN-115").vehicleType("Ford Transit Van").status("IDLE").build(),
            VehicleStatus.builder().vehicleId("VEH-05").vehiclePlate("VAN-330").vehicleType("Mercedes Sprinter").status("MAINTENANCE").build()
    ));

    private final AtomicInteger assignmentIndex = new AtomicInteger(0);
    private final Random random = new Random();

    // Every route ever created this session (open or closed), most recent first.
    private final Deque<OpenRoute> routeHistory = new ConcurrentLinkedDeque<>();

    public synchronized RouteResult generateRoute(OrderCreatedEvent event) {
        double[] deliveryCoords = SriLankaGeocoder.resolveCoordinates(event.getRecipientAddress());
        OpenRoute route = findNearbyOpenRoute(deliveryCoords);

        if (route == null) {
            route = openNewRoute(event);
            routeHistory.addFirst(route);
            while (routeHistory.size() > MAX_ROUTE_HISTORY) {
                routeHistory.removeLast();
            }
        }

        StopEntry stop = new StopEntry();
        stop.orderNumber = event.getOrderNumber();
        stop.receiverName = event.getReceiverName();
        stop.deliveryAddress = event.getRecipientAddress();
        stop.coords = deliveryCoords;
        route.stops.add(stop);

        resequenceStops(route);

        StopEntry thisStop = route.stops.stream()
                .filter(s -> s.orderNumber.equals(event.getOrderNumber()))
                .findFirst()
                .orElseThrow();

        long optimizationTimeMs = 80 + ThreadLocalRandom.current().nextInt(320);

        return RouteResult.builder()
                .orderNumber(event.getOrderNumber())
                .clientId(event.getClientId())
                .routeId(route.routeId)
                .driverId(route.driver.getDriverId())
                .driverName(route.driver.getName())
                .vehicleId(route.vehicle.getVehicleId())
                .vehiclePlate(route.vehicle.getVehiclePlate())
                .vehicleType(route.vehicle.getVehicleType())
                .pickupAddress(route.hubAddress)
                .deliveryAddress(event.getRecipientAddress())
                .distanceKm(round1(thisStop.cumulativeDistanceKm))
                .durationMinutes(thisStop.cumulativeDurationMinutes)
                .trafficLevel(route.trafficLevel)
                .optimizationTimeMs(optimizationTimeMs)
                .generatedAt(LocalDateTime.now())
                .stopSequence(thisStop.sequence)
                .totalStopsInRoute(route.stops.size())
                .build();
    }

    public List<GroupedRouteDto> getGroupedRoutes() {
        return routeHistory.stream().map(this::toGroupedRouteDto).toList();
    }

    public List<VehicleStatus> getVehicleStatuses() {
        return vehicles;
    }

    public List<DriverInfo> getDrivers() {
        return drivers;
    }

    public DriverInfo addDriver(String driverId, String name) {
        boolean alreadyExists = drivers.stream()
                .anyMatch(driver -> driver.getDriverId().equalsIgnoreCase(driverId));

        if (alreadyExists) {
            throw new RosIntegrationException("Driver " + driverId + " already exists");
        }

        DriverInfo driver = DriverInfo.builder()
                .driverId(driverId)
                .name(name)
                .status("AVAILABLE")
                .build();

        drivers.add(driver);
        return driver;
    }

    public VehicleStatus addVehicle(String vehicleId, String vehiclePlate, String vehicleType) {
        boolean alreadyExists = vehicles.stream()
                .anyMatch(vehicle -> vehicle.getVehicleId().equalsIgnoreCase(vehicleId)
                        || vehicle.getVehiclePlate().equalsIgnoreCase(vehiclePlate));

        if (alreadyExists) {
            throw new RosIntegrationException("Vehicle " + vehicleId + " or plate " + vehiclePlate + " already exists");
        }

        VehicleStatus vehicle = VehicleStatus.builder()
                .vehicleId(vehicleId)
                .vehiclePlate(vehiclePlate)
                .vehicleType(vehicleType)
                .status("IDLE")
                .build();

        vehicles.add(vehicle);
        return vehicle;
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

    // Finds the closest open (not-yet-full) route with at least one stop within
    // CLUSTER_RADIUS_KM of the new delivery point, so nearby orders batch onto one run
    // instead of every delivery becoming its own single-stop route.
    private OpenRoute findNearbyOpenRoute(double[] deliveryCoords) {
        OpenRoute best = null;
        double bestDistanceKm = CLUSTER_RADIUS_KM;

        for (OpenRoute candidate : routeHistory) {
            if (candidate.stops.size() >= MAX_STOPS_PER_ROUTE) {
                continue;
            }
            for (StopEntry stop : candidate.stops) {
                double distanceKm = SriLankaGeocoder.haversineKm(stop.coords, deliveryCoords);
                if (distanceKm <= bestDistanceKm) {
                    best = candidate;
                    bestDistanceKm = distanceKm;
                }
            }
        }

        return best;
    }

    private OpenRoute openNewRoute(OrderCreatedEvent event) {
        int startIndex = assignmentIndex.getAndIncrement();
        VehicleStatus vehicle = pickAvailableVehicle(startIndex);
        DriverInfo driver = drivers.get(startIndex % drivers.size());

        vehicle.setStatus("EN_ROUTE");
        driver.setStatus("ON_ROUTE");

        OpenRoute route = new OpenRoute();
        route.routeId = "RT-" + (10000000 + random.nextInt(90000000));
        route.region = SriLankaGeocoder.resolveRegion(event.getRecipientAddress());
        route.driver = driver;
        route.vehicle = vehicle;
        route.hubAddress = event.getSenderAddress();
        route.hubCoords = SriLankaGeocoder.resolveCoordinates(event.getSenderAddress());
        route.trafficLevel = TRAFFIC_LEVELS[ThreadLocalRandom.current().nextInt(TRAFFIC_LEVELS.length)];
        route.createdAt = LocalDateTime.now();
        return route;
    }

    private void resequenceStops(OpenRoute route) {
        List<StopEntry> remaining = new ArrayList<>(route.stops);
        List<StopEntry> ordered = new ArrayList<>();
        double[] current = route.hubCoords;

        while (!remaining.isEmpty()) {
            double[] from = current;
            StopEntry nearest = remaining.stream()
                    .min(Comparator.comparingDouble(s -> SriLankaGeocoder.haversineKm(from, s.coords)))
                    .orElseThrow();
            ordered.add(nearest);
            remaining.remove(nearest);
            current = nearest.coords;
        }

        double cumulativeDistance = 0;
        int cumulativeDuration = 0;
        double[] prev = route.hubCoords;

        for (int i = 0; i < ordered.size(); i++) {
            StopEntry stop = ordered.get(i);
            double legDistance = SriLankaGeocoder.haversineKm(prev, stop.coords);
            cumulativeDistance += legDistance;
            cumulativeDuration += (int) Math.round(legDistance * (1.5 + ThreadLocalRandom.current().nextDouble(1.0)));
            stop.cumulativeDistanceKm = cumulativeDistance;
            stop.cumulativeDurationMinutes = cumulativeDuration;
            stop.sequence = i + 1;
            prev = stop.coords;
        }

        route.stops = ordered;
    }

    private GroupedRouteDto toGroupedRouteDto(OpenRoute route) {
        List<RouteStopDto> stops = route.stops.stream()
                .map(stop -> RouteStopDto.builder()
                        .sequence(stop.sequence)
                        .orderNumber(stop.orderNumber)
                        .receiverName(stop.receiverName)
                        .deliveryAddress(stop.deliveryAddress)
                        .cumulativeDistanceKm(round1(stop.cumulativeDistanceKm))
                        .cumulativeDurationMinutes(stop.cumulativeDurationMinutes)
                        .build())
                .toList();

        StopEntry lastStop = route.stops.isEmpty() ? null : route.stops.get(route.stops.size() - 1);

        return GroupedRouteDto.builder()
                .routeId(route.routeId)
                .driverId(route.driver.getDriverId())
                .driverName(route.driver.getName())
                .vehicleId(route.vehicle.getVehicleId())
                .vehiclePlate(route.vehicle.getVehiclePlate())
                .vehicleType(route.vehicle.getVehicleType())
                .hubAddress(route.hubAddress)
                .region(route.region)
                .totalDistanceKm(lastStop == null ? 0 : round1(lastStop.cumulativeDistanceKm))
                .totalDurationMinutes(lastStop == null ? 0 : lastStop.cumulativeDurationMinutes)
                .trafficLevel(route.trafficLevel)
                .active(route.stops.size() < MAX_STOPS_PER_ROUTE)
                .createdAt(route.createdAt)
                .stops(stops)
                .build();
    }

    private double round1(double value) {
        return Math.round(value * 10) / 10.0;
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

    private static class OpenRoute {
        String routeId;
        String region;
        DriverInfo driver;
        VehicleStatus vehicle;
        String hubAddress;
        double[] hubCoords;
        String trafficLevel;
        LocalDateTime createdAt;
        List<StopEntry> stops = new ArrayList<>();
    }

    private static class StopEntry {
        String orderNumber;
        String receiverName;
        String deliveryAddress;
        double[] coords;
        double cumulativeDistanceKm;
        int cumulativeDurationMinutes;
        int sequence;
    }
}
