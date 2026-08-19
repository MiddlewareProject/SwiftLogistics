import { useCallback, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

const API_BASE = 'http://localhost:8080';
const AUTH_USER_STORAGE_KEY = 'swifttrack-auth-user';
const REGISTERED_ACCOUNTS_STORAGE_KEY = 'swifttrack-registered-accounts';
const DASHBOARD_SCREEN_STORAGE_KEY = 'swifttrack-current-screen';
const DASHBOARD_TAB_STORAGE_KEY = 'swifttrack-dashboard-tab';
const DRIVER_VERIFIED_SESSION_KEY = 'swifttrack_driver_verified';
const DRIVER_ID_SESSION_KEY = 'swifttrack_driver_id';

const getPortalPathTab = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (window.location.pathname === '/warehouse') {
    return 'warehouse';
  }

  if (window.location.pathname === '/driver') {
    return 'driver';
  }

  return null;
};

const readStoredValue = (key, fallback) => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const value = window.localStorage.getItem(key);
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const writeStoredValue = (key, value) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
};

const readSessionValue = (key, fallback = '') => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  return window.sessionStorage.getItem(key) || fallback;
};

const writeSessionValue = (key, value) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(key, value);
};

const removeSessionValue = (key) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(key);
};

const seedRegisteredAccounts = [
  {
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@acmecorp.com',
    password: 'password123',
    company: 'Acme Industries Ltd',
    role: 'Client Portal Manager'
  }
];

// SVG Icons Component Library
const LogoIcon = () => (
  <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const DashboardIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" />
    <rect x="14" y="3" width="7" height="5" />
    <rect x="14" y="12" width="7" height="9" />
    <rect x="3" y="16" width="7" height="5" />
  </svg>
);

const PlusCircleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);

const HistoryIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8v4l3 3" />
    <path d="M3.05 11a9 9 0 1 1 .5 4m-.5 5v-5h5" />
  </svg>
);

const TrackingIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CmsIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="14" rx="2" />
    <path d="M7 20h10" />
    <path d="M9 8h6" />
    <path d="M9 12h6" />
  </svg>
);

const RouteOptimizationIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="19" r="3" />
    <circle cx="18" cy="5" r="3" />
    <path d="M9 19h4.5a3.5 3.5 0 0 0 3.5-3.5v-7A3.5 3.5 0 0 1 20.5 5H21" />
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const DriversIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogOutIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const TruckIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const ShieldCheckIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 11 2 2 4-4" />
  </svg>
);

const RouteIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="19" r="3" />
    <circle cx="18" cy="5" r="3" />
    <path d="M9 19h4.5a3.5 3.5 0 0 0 3.5-3.5v-7A3.5 3.5 0 0 1 20.5 5H21" />
  </svg>
);

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const toDisplayStatus = (status) => {
  if (!status) return 'Pending';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const normalizeStatusKey = (status) => {
  if (!status) return 'PENDING';
  return String(status)
    .trim()
    .replace(/[_\s-]+/g, '_')
    .toUpperCase();
};

const toWarehouseStatusLabel = (status) => {
  const labels = {
    WAREHOUSE: 'Warehouse',
    LOADED: 'Loaded',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered',
    FAILED: 'Failed',
    PENDING: 'Pending'
  };
  return labels[status] || toDisplayStatus(status);
};

const getWarehouseStatusBadge = (status) => {
  if (status === 'DELIVERED') return 'badge-completed';
  if (status === 'FAILED') return 'badge-failed';
  if (status === 'PENDING' || status === 'WAREHOUSE') return 'badge-pending';
  return 'badge-transit';
};

const getDeliveryProgress = (status) => {
  const progress = {
    WAREHOUSE: 20,
    LOADED: 40,
    OUT_FOR_DELIVERY: 75,
    DELIVERED: 100,
    FAILED: 100
  };
  return progress[status] || 0;
};

const getClientTrackingProgress = (status) => {
  const progress = {
    PENDING: 10,
    WAREHOUSE: 20,
    LOADED: 40,
    OUT_FOR_DELIVERY: 75,
    DELIVERED: 100,
    FAILED: 100
  };
  return progress[status] || 0;
};

const getClientStatusMessage = (status) => {
  const messages = {
    PENDING: 'Awaiting processing',
    WAREHOUSE: 'Preparing for dispatch',
    LOADED: 'Preparing for delivery',
    OUT_FOR_DELIVERY: 'Delivery in progress',
    DELIVERED: 'Delivered',
    FAILED: 'Delivery attempt unsuccessful'
  };
  return messages[status] || 'Tracking status unavailable';
};

// Backend timestamps are naive LocalDateTime strings (no timezone suffix) representing
// UTC (the container clock), e.g. "2026-08-19T03:20:02". Without a 'Z'/offset, the
// browser's Date parser wrongly treats them as already being in local time and skips
// conversion entirely - so append 'Z' when missing to get correct local-time display.
const toUtcDate = (value) => {
  if (!value) return null;
  const hasTimezone = /[zZ]|[+-]\d{2}:\d{2}$/.test(value);
  return new Date(hasTimezone ? value : `${value}Z`);
};

const formatDateTime = (value) => {
  const date = toUtcDate(value);
  if (!date) return 'Not available';
  return date.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const decodeJwtPayload = (token) => {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const getStoredUser = () => {
  const storedUser = readStoredValue(AUTH_USER_STORAGE_KEY, null);
  return storedUser && storedUser.token ? storedUser : null;
};

const mapBackendOrder = (order) => {
  const displayStatus = toDisplayStatus(order.status);
  const time = order.createdAt
    ? toUtcDate(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return {
    id: order.orderNumber,
    date: (order.createdAt || '').split('T')[0],
    pickupAddress: order.senderAddress,
    receiverName: order.receiverName || 'Unknown',
    receiverPhone: order.receiverPhone || 'Unknown',
    deliveryAddress: order.recipientAddress,
    packageType: order.packageType || 'Parcel',
    weight: order.weight,
    priority: order.priority || 'Standard',
    status: displayStatus,
    driver: 'Unassigned',
    vehicle: 'TBD',
    notes: order.deliveryNotes || 'None',
    history: [{ status: displayStatus, time }]
  };
};

const mergeClientTrackingStatus = (order, tracking) => {
  if (!tracking?.status) {
    return order;
  }

  const statusKey = normalizeStatusKey(tracking.status);
  return {
    ...order,
    status: toWarehouseStatusLabel(statusKey),
    statusKey,
    currentLocation: tracking.currentLocation || order.currentLocation,
    trackingHistory: tracking.history || order.trackingHistory
  };
};

// Approximate town-centre coordinates for the Sri Lankan locations used in mock order addresses.
// There is no geocoding service wired up, so routes resolve to the nearest known town centre.
const CITY_COORDINATES = {
  colombo: [6.9271, 79.8612],
  kandy: [7.2906, 80.6337],
  galle: [6.0535, 80.2210],
  matara: [5.9549, 80.5550],
  jaffna: [9.6615, 80.0255],
  trincomalee: [8.5874, 81.2152],
  negombo: [7.2083, 79.8358],
  kurunegala: [7.4863, 80.3623],
  anuradhapura: [8.3114, 80.4037],
  batticaloa: [7.7167, 81.7000],
  ratnapura: [6.6828, 80.3992],
  badulla: [6.9934, 81.0550],
  'nuwara eliya': [6.9497, 80.7891],
  gampaha: [7.0917, 80.0099],
  kalutara: [6.5854, 79.9607],
  polonnaruwa: [7.9403, 81.0188],
  vavuniya: [8.7514, 80.4971],
  ampara: [7.2975, 81.6747],
  hambantota: [6.1246, 81.1185],
  puttalam: [8.0362, 79.8283],
  chilaw: [7.5765, 79.7958],
  matale: [7.4675, 80.6234],
  kegalle: [7.2513, 80.3464],
  nugegoda: [6.8649, 79.8997],
  moratuwa: [6.7730, 79.8816],
  dehiwala: [6.8510, 79.8654],
  maharagama: [6.8481, 79.9265],
  kotte: [6.8905, 79.9016],
  battaramulla: [6.8994, 79.9170],
  malabe: [6.9057, 79.9634],
  rajagiriya: [6.9095, 79.8969],
  kaduwela: [6.9330, 79.9836],
  wattala: [6.9890, 79.8926],
  kelaniya: [6.9553, 79.9218],
  kadawatha: [7.0008, 79.9515],
  kottawa: [6.8408, 79.9633],
  piliyandala: [6.8014, 79.9227],
  boralesgamuwa: [6.8386, 79.9010],
  homagama: [6.8442, 80.0021],
  'ja-ela': [7.0744, 79.8917],
  wellawatte: [6.8767, 79.8593],
  kollupitiya: [6.9105, 79.8497]
};

const DEFAULT_CITY_COORDINATES = CITY_COORDINATES.colombo;

const hashString = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash;
};

// Resolves a free-text address to real coordinates for its town, with a small deterministic
// jitter so multiple addresses in the same town don't render as a single overlapping pin.
const resolveAddressCoordinates = (address) => {
  if (!address) return DEFAULT_CITY_COORDINATES;
  const lower = address.toLowerCase();
  const matchedCity = Object.keys(CITY_COORDINATES).find((city) => lower.includes(city));
  const base = matchedCity ? CITY_COORDINATES[matchedCity] : DEFAULT_CITY_COORDINATES;
  const hash = hashString(address);
  const jitterLat = ((hash % 1000) / 1000 - 0.5) * 0.025;
  const jitterLng = (((Math.abs(hash) >> 8) % 1000) / 1000 - 0.5) * 0.025;
  return [base[0] + jitterLat, base[1] + jitterLng];
};

const ROUTE_MAP_COLORS = ['#2563eb', '#16a34a', '#f97316', '#db2777', '#7c3aed', '#0891b2', '#ca8a04'];

// Fetches a real road-following path between two [lat, lng] points via OSRM's public
// routing server (free, no API key). Falls back to a straight line if the request fails.
const fetchRoadPath = async (from, to) => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${from[1]},${from[0]};${to[1]},${to[0]}?overview=full&geometries=geojson`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('routing request failed');
    const data = await response.json();
    const coordinates = data.routes?.[0]?.geometry?.coordinates;
    if (!coordinates || coordinates.length < 2) throw new Error('no route geometry');
    return coordinates.map(([lng, lat]) => [lat, lng]);
  } catch {
    return [from, to];
  }
};

// Real interactive map (Leaflet + OpenStreetMap tiles) plotting pickup/delivery pins and a
// route line for every route passed in, color-coded per order.
// routes: [{ routeId, driverName, hubAddress, stops: [{ sequence, orderNumber, deliveryAddress }] }]
const RouteOptimizationMap = ({ routes, selectedRouteId, onSelectRoute }) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerGroupRef = useRef(null);
  const polylinesRef = useRef({});
  const onSelectRouteRef = useRef(onSelectRoute);

  useEffect(() => {
    onSelectRouteRef.current = onSelectRoute;
  }, [onSelectRoute]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined;

    const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView([7.6, 80.7], 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map);

    mapRef.current = map;
    layerGroupRef.current = L.layerGroup().addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return undefined;

    let cancelled = false;

    const draw = async () => {
      layerGroup.clearLayers();
      polylinesRef.current = {};
      if (!routes.length) return;

      const bounds = [];

      for (let index = 0; index < routes.length; index += 1) {
        const route = routes[index];
        const color = ROUTE_MAP_COLORS[index % ROUTE_MAP_COLORS.length];
        const hub = resolveAddressCoordinates(route.hubAddress);
        const stopPoints = route.stops.map((stop) => ({
          stop,
          coords: resolveAddressCoordinates(stop.deliveryAddress)
        }));
        const waypoints = [hub, ...stopPoints.map((s) => s.coords)];

        const legPaths = await Promise.all(
          waypoints.slice(0, -1).map((point, i) => fetchRoadPath(point, waypoints[i + 1]))
        );
        if (cancelled) return;

        const fullPath = legPaths.flat();

        const polyline = L.polyline(fullPath, { color, weight: 4, opacity: 0.6 })
          .addTo(layerGroup)
          .on('click', () => onSelectRouteRef.current?.(route.routeId));
        polylinesRef.current[route.routeId] = polyline;

        const hubMarker = L.marker(hub, {
          icon: L.divIcon({
            className: 'route-map-pin-icon',
            html: `<span style="background:${color}">H</span>`,
            iconSize: [24, 24]
          })
        }).addTo(layerGroup).bindPopup(`<strong>${route.routeId}</strong><br/>Hub: ${route.hubAddress}`);
        hubMarker.on('click', () => onSelectRouteRef.current?.(route.routeId));

        stopPoints.forEach(({ stop, coords }) => {
          const marker = L.marker(coords, {
            icon: L.divIcon({
              className: 'route-map-pin-icon',
              html: `<span style="background:${color}">${stop.sequence}</span>`,
              iconSize: [24, 24]
            })
          }).addTo(layerGroup).bindPopup(
            `<strong>${stop.receiverName || stop.orderNumber}</strong><br/>${stop.orderNumber} · stop ${stop.sequence}<br/>Driver: ${route.driverName}<br/>${stop.deliveryAddress}`
          );
          marker.on('click', () => onSelectRouteRef.current?.(route.routeId));
        });

        bounds.push(...fullPath);
      }

      if (bounds.length && !cancelled) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
      }
    };

    draw();

    return () => {
      cancelled = true;
    };
  }, [routes]);

  useEffect(() => {
    Object.entries(polylinesRef.current).forEach(([routeId, polyline]) => {
      const isSelected = routeId === selectedRouteId;
      polyline.setStyle({ weight: isSelected ? 6 : 4, opacity: isSelected ? 1 : 0.6 });
      if (isSelected) {
        polyline.bringToFront();
      }
    });
  }, [selectedRouteId, routes]);

  return <div ref={containerRef} className="route-optimization-map" />;
};

const RouteMapVisual = ({ pickupAddress, deliveryAddress }) => (
  <div className="route-map">
    <div className="route-map-track">
      <div className="route-map-pin start"></div>
      <div className="route-map-road">
        <div className="route-map-vehicle">
          <TruckIcon />
        </div>
      </div>
      <div className="route-map-pin end"></div>
    </div>
    <div className="route-map-labels">
      <div className="route-map-label">
        <span className="route-map-label-tag">Pickup</span>
        {pickupAddress || 'Not available'}
      </div>
      <div className="route-map-label end">
        <span className="route-map-label-tag">Delivery</span>
        {deliveryAddress || 'Not available'}
      </div>
    </div>
  </div>
);

function App() {
  const [portalPathTab, setPortalPathTab] = useState(() => getPortalPathTab());

  // Navigation Screens: 'landing', 'login', 'register', 'dashboard'
  const [currentScreen, setCurrentScreen] = useState(() => {
    const pathTab = getPortalPathTab();
    const storedUser = getStoredUser();
    const storedScreen = readStoredValue(DASHBOARD_SCREEN_STORAGE_KEY, 'landing');

    if (pathTab === 'driver') {
      return 'dashboard';
    }

    if (pathTab) {
      return storedUser ? 'dashboard' : 'login';
    }

    if (!storedUser && storedScreen === 'dashboard') {
      return 'landing';
    }

    return storedScreen;
  });

  // Dashboard Sub-tabs: 'overview', 'create', 'history', 'tracking', 'cms', 'notifications', 'profile'
  const [dashboardTab, setDashboardTab] = useState(() => {
    const pathTab = getPortalPathTab();
    if (pathTab) {
      return pathTab;
    }

    const storedTab = readStoredValue(DASHBOARD_TAB_STORAGE_KEY, 'overview');
    const storedUser = getStoredUser();

    if (storedTab === 'warehouse' || storedTab === 'driver') {
      return 'overview';
    }
    if (storedTab === 'cms') {
      return storedUser?.role === 'ADMIN' ? 'system-overview' : 'overview';
    }

    const isAdminOnlyTab = storedTab === 'routes' || storedTab === 'drivers' || storedTab === 'vehicles'
      || storedTab === 'system-overview' || storedTab === 'admin-users' || storedTab === 'admin-orders';
    const isClientOnlyTab = storedTab === 'overview' || storedTab === 'create' || storedTab === 'history' || storedTab === 'tracking';

    if (isAdminOnlyTab && storedUser?.role !== 'ADMIN') {
      return 'overview';
    }
    if (isClientOnlyTab && storedUser?.role === 'ADMIN') {
      return 'system-overview';
    }
    return storedTab;
  });

  // Authenticated user state
  const [user, setUser] = useState(() => getStoredUser());

  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Register form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerSubmitting, setRegisterSubmitting] = useState(false);

  // Order submission form states
  const [pickupAddress, setPickupAddress] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [packageType, setPackageType] = useState('Parcel');
  const [weight, setWeight] = useState('');
  const [priority, setPriority] = useState('Standard');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [latestSubmittedId, setLatestSubmittedId] = useState('');
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSubmitError, setOrderSubmitError] = useState('');

  // Search, Filter and Sorting states for Order History
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');

  // Tracking search state
  const [trackingSearchTerm, setTrackingSearchTerm] = useState('');
  const [clientTracking, setClientTracking] = useState(null);
  const [clientTrackingLoading, setClientTrackingLoading] = useState(false);
  const [clientTrackingError, setClientTrackingError] = useState('');
  const [clientTrackingRefreshError, setClientTrackingRefreshError] = useState('');
  const [clientTrackingLastRefreshedAt, setClientTrackingLastRefreshedAt] = useState(null);
  const clientTrackingRefreshInFlightRef = useRef(false);

  // Contact Form states
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState('');

  // Orders loaded from order-service for the signed-in client
  const [orders, setOrders] = useState([]);

  // Tracking details active order state
  const [activeTrackingOrder, setActiveTrackingOrder] = useState(null);

  // Notifications state
  const [notifications, setNotifications] = useState([]);

  // Loads notifications from the persisted Notification Service (source of truth).
  // Reused by the polling effect below AND called directly right after actions like
  // order creation, so the real, persisted notification shows up immediately instead
  // of waiting for the next poll tick - without ever inventing a local-only fake one.
  const loadNotifications = useCallback(async () => {
    if (!user?.token) return;

    try {
      let endpoint;
      if (user.role === 'DRIVER') {
        endpoint = `${API_BASE}/api/notifications/driver/${user.username}`;
      } else if (user.role === 'ADMIN') {
        endpoint = `${API_BASE}/api/notifications`;
      } else {
        const claims = decodeJwtPayload(user.token);
        if (!claims?.userId) return;
        endpoint = `${API_BASE}/api/notifications/client/${claims.userId}`;
      }

      const response = await fetch(endpoint, { headers: { Authorization: `Bearer ${user.token}` } });
      if (!response.ok) return;

      const data = await response.json();

      const mapped = data.map((n) => ({
        id: n.id,
        title: n.title,
        desc: n.message,
        time: formatDateTime(n.createdAt),
        type: (n.notificationType || '').includes('DRIVER') ? 'driver' :
              (n.notificationType || '').includes('ORDER') ? 'order' :
              (n.notificationType || '').includes('DELIVERY') ? 'delivery' : 'wms',
        unread: !n.read
      }));
      setNotifications(mapped);
    } catch {
      // ignore transient failures, keep last known notifications
    }
  }, [user]);

  // Poll the real Notification Service instead of showing hardcoded demo notifications.
  useEffect(() => {
    if (!user?.token) return undefined;

    const runInitialLoad = async () => {
      await loadNotifications();
    };
    runInitialLoad();

    const intervalId = setInterval(loadNotifications, 15000);

    return () => {
      clearInterval(intervalId);
    };
  }, [user, loadNotifications]);
  const [cmsDashboard, setCmsDashboard] = useState(null);
  const [cmsLatestResult, setCmsLatestResult] = useState(null);
  const [cmsLoading, setCmsLoading] = useState(false);
  const [cmsError, setCmsError] = useState('');
  const [retryingOrderNumber, setRetryingOrderNumber] = useState(null);
  const [cmsRetryError, setCmsRetryError] = useState('');
  const [rosDashboard, setRosDashboard] = useState(null);
  const [rosLoading, setRosLoading] = useState(false);
  const [rosError, setRosError] = useState('');
  const [selectedRosRouteId, setSelectedRosRouteId] = useState(null);
  const [loadedOrderNumbers, setLoadedOrderNumbers] = useState(() => new Set());
  const [warehouseDashboard, setWarehouseDashboard] = useState(null);
  const [warehouseLoading, setWarehouseLoading] = useState(false);
  const [warehouseError, setWarehouseError] = useState('');
  const [wmsStatus, setWmsStatus] = useState(null);
  const [selectedWarehousePackage, setSelectedWarehousePackage] = useState(null);
  const [selectedWarehouseTracking, setSelectedWarehouseTracking] = useState(null);
  const [selectedWarehouseTrackingLoading, setSelectedWarehouseTrackingLoading] = useState(false);
  const [selectedWarehouseTrackingError, setSelectedWarehouseTrackingError] = useState('');
  const [warehouseLoadPackage, setWarehouseLoadPackage] = useState(null);
  const [warehouseLoadLocation, setWarehouseLoadLocation] = useState('');
  const [warehouseLoadSubmitting, setWarehouseLoadSubmitting] = useState(false);
  const [warehouseLoadError, setWarehouseLoadError] = useState('');
  const [systemOverview, setSystemOverview] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [systemCmsStatus, setSystemCmsStatus] = useState(null);
  const [systemRosStatus, setSystemRosStatus] = useState(null);
  const [systemWmsStatus, setSystemWmsStatus] = useState(null);
  const [systemTrackingStats, setSystemTrackingStats] = useState(null);
  const [systemRosDrivers, setSystemRosDrivers] = useState([]);
  const [systemOverviewLoading, setSystemOverviewLoading] = useState(false);
  const [systemOverviewError, setSystemOverviewError] = useState('');
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);
  const [adminUsersError, setAdminUsersError] = useState('');
  const [adminOrders, setAdminOrders] = useState([]);
  const [adminOrdersLoading, setAdminOrdersLoading] = useState(false);
  const [adminOrdersError, setAdminOrdersError] = useState('');
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverEmail, setNewDriverEmail] = useState('');
  const [newDriverPassword, setNewDriverPassword] = useState('');
  const [addDriverSubmitting, setAddDriverSubmitting] = useState(false);
  const [addDriverError, setAddDriverError] = useState('');
  const [addDriverSuccess, setAddDriverSuccess] = useState('');
  const [newVehiclePlate, setNewVehiclePlate] = useState('');
  const [newVehicleType, setNewVehicleType] = useState('');
  const [addVehicleSubmitting, setAddVehicleSubmitting] = useState(false);
  const [addVehicleError, setAddVehicleError] = useState('');
  const [addVehicleSuccess, setAddVehicleSuccess] = useState('');
  const [, setDriverVerified] = useState(() => readSessionValue(DRIVER_VERIFIED_SESSION_KEY) === 'true');
  const [, setDriverId] = useState(() => readSessionValue(DRIVER_ID_SESSION_KEY));
  const [driverLoginId, setDriverLoginId] = useState('');
  const [driverPassword, setDriverPassword] = useState('');
  const [driverLoginError, setDriverLoginError] = useState('');
  const [driverDashboard, setDriverDashboard] = useState(null);
  const [driverOrderDetails, setDriverOrderDetails] = useState({});
  const [driverHistory, setDriverHistory] = useState([]);
  const [driverHistoryLoading, setDriverHistoryLoading] = useState(false);
  const [driverHistoryError, setDriverHistoryError] = useState('');
  const [driverView, setDriverView] = useState('dashboard');
  const [driverLoading, setDriverLoading] = useState(false);
  const [driverError, setDriverError] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [selectedDeliveryTracking, setSelectedDeliveryTracking] = useState(null);
  const [selectedDeliveryOrder, setSelectedDeliveryOrder] = useState(null);
  const [selectedDeliveryRoute, setSelectedDeliveryRoute] = useState(null);
  const [selectedDeliveryLoading, setSelectedDeliveryLoading] = useState(false);
  const [selectedDeliveryError, setSelectedDeliveryError] = useState('');
  const [deliveryActionLoading, setDeliveryActionLoading] = useState('');
  const [deliveryActionError, setDeliveryActionError] = useState('');
  const [podOpen, setPodOpen] = useState(false);
  const [podPhotoFile, setPodPhotoFile] = useState(null);
  const [podPhotoPreviewUrl, setPodPhotoPreviewUrl] = useState('');
  const [podNote, setPodNote] = useState('');
  const [podSignatureDrawn, setPodSignatureDrawn] = useState(false);
  const [podValidationError, setPodValidationError] = useState('');
  const [failureOpen, setFailureOpen] = useState(false);
  const [failureReason, setFailureReason] = useState('');
  const [failureNote, setFailureNote] = useState('');
  const [failureValidationError, setFailureValidationError] = useState('');
  const signatureCanvasRef = useRef(null);
  const signatureDrawingRef = useRef(false);
  const authenticatedDriver = Boolean(user?.token && user?.role === 'DRIVER' && user?.username);
  const authenticatedDriverId = authenticatedDriver ? user.username : '';

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const syncPortalPath = () => {
      const nextPortalPath = getPortalPathTab();
      setPortalPathTab(nextPortalPath);

      if (nextPortalPath === 'driver') {
        setDashboardTab(nextPortalPath);
        setCurrentScreen('dashboard');
      } else if (nextPortalPath) {
        setDashboardTab(nextPortalPath);
        setCurrentScreen(getStoredUser() ? 'dashboard' : 'login');
      }
    };

    window.addEventListener('popstate', syncPortalPath);
    return () => {
      window.removeEventListener('popstate', syncPortalPath);
    };
  }, []);

  useEffect(() => {
    writeStoredValue(DASHBOARD_SCREEN_STORAGE_KEY, currentScreen);
  }, [currentScreen]);

  useEffect(() => {
    writeStoredValue(DASHBOARD_TAB_STORAGE_KEY, dashboardTab);
  }, [dashboardTab]);

  useEffect(() => {
    if (user) {
      writeStoredValue(AUTH_USER_STORAGE_KEY, user);
    } else if (typeof window !== 'undefined') {
      window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    }
  }, [user]);

  const openPortalEntry = (portal) => {
    const path = `/${portal}`;
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
    }

    setPortalPathTab(portal);
    setDashboardTab(portal);
    setCurrentScreen(portal === 'driver' || user?.token ? 'dashboard' : 'login');
  };

  const returnToClientLogin = () => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/');
    }

    setPortalPathTab(null);
    setDashboardTab('overview');
    setCurrentScreen('login');
  };

  // Load the signed-in client's real orders from order-service whenever the session changes
  useEffect(() => {
    if (!user?.token) {
      return;
    }

    let cancelled = false;
    const authHeaders = { Authorization: `Bearer ${user.token}` };

    const loadOrderHistory = async () => {
      const response = await fetch(`${API_BASE}/api/orders/history`, { headers: authHeaders });
      const data = response.ok ? await response.json() : [];
      if (cancelled) return;

      const mapped = data.map(mapBackendOrder);
      setOrders(mapped);
      setActiveTrackingOrder(mapped[0] || null);

      // Enrich with real tracking status and ROS-assigned driver/vehicle where available.
      const [routeResults, trackingResults] = await Promise.all([
        Promise.all(
          mapped.map((order) =>
            fetch(`${API_BASE}/api/ros/routes/${order.id}`, { headers: authHeaders })
              .then((res) => (res.ok ? res.json() : null))
              .catch(() => null)
          )
        ),
        Promise.all(
          mapped.map((order) =>
            fetch(`${API_BASE}/api/tracking/${order.id}`, { headers: authHeaders })
              .then((res) => (res.ok ? res.json() : null))
              .catch(() => null)
          )
        )
      ]);

      if (cancelled) return;

      const enriched = mapped.map((order, index) => {
        const route = routeResults[index];
        const trackedOrder = mergeClientTrackingStatus(order, trackingResults[index]);
        return route
          ? { ...trackedOrder, driver: route.driverName || 'Unassigned', vehicle: route.vehiclePlate || 'TBD' }
          : trackedOrder;
      });

      setOrders(enriched);
      setActiveTrackingOrder((prev) => enriched.find((o) => o.id === prev?.id) || enriched[0] || null);
    };

    loadOrderHistory().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storedAccounts = readStoredValue(REGISTERED_ACCOUNTS_STORAGE_KEY, null);
    if (!storedAccounts) {
      writeStoredValue(REGISTERED_ACCOUNTS_STORAGE_KEY, seedRegisteredAccounts);
    }
  }, []);

  useEffect(() => {
    if (dashboardTab !== 'cms') {
      return;
    }

    let cancelled = false;

    const loadCmsDashboard = async () => {
      setCmsLoading(true);
      setCmsError('');

      try {
        const dashboardResponse = await fetch('http://localhost:8083/api/cms/dashboard');
        if (!dashboardResponse.ok) {
          throw new Error(`CMS dashboard request failed with ${dashboardResponse.status}`);
        }

        const dashboardData = await dashboardResponse.json();
        if (cancelled) {
          return;
        }

        setCmsDashboard(dashboardData);

        const latestResultResponse = await fetch('http://localhost:8083/api/cms/latest');
        if (latestResultResponse.ok) {
          const latestResultData = await latestResultResponse.json();
          if (!cancelled) {
            setCmsLatestResult(latestResultData);
          }
        } else if (!cancelled) {
          setCmsLatestResult(null);
        }
      } catch (error) {
        if (!cancelled) {
          setCmsError(error.message || 'Unable to load CMS dashboard');
          setCmsDashboard(null);
          setCmsLatestResult(null);
        }
      } finally {
        if (!cancelled) {
          setCmsLoading(false);
        }
      }
    };

    loadCmsDashboard();

    return () => {
      cancelled = true;
    };
  }, [dashboardTab]);

  // Re-fetches CMS dashboard data on demand (e.g. after a manual retry); not tied to any effect.
  const refreshCmsDashboard = async () => {
    try {
      const dashboardResponse = await fetch('http://localhost:8083/api/cms/dashboard');
      if (dashboardResponse.ok) {
        setCmsDashboard(await dashboardResponse.json());
      }

      const latestResultResponse = await fetch('http://localhost:8083/api/cms/latest');
      setCmsLatestResult(latestResultResponse.ok ? await latestResultResponse.json() : null);
    } catch {
      // Keep the previously loaded dashboard state if a background refresh fails.
    }
  };

  const handleRetryOrder = async (orderNumber) => {
    setRetryingOrderNumber(orderNumber);
    setCmsRetryError('');

    try {
      const response = await fetch(`http://localhost:8083/api/cms/retries/${orderNumber}`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`Retry failed with status ${response.status}`);
      }

      await refreshCmsDashboard();
    } catch (error) {
      setCmsRetryError(error.message || `Unable to retry order ${orderNumber}`);
    } finally {
      setRetryingOrderNumber(null);
    }
  };

  useEffect(() => {
    if (dashboardTab !== 'routes' && dashboardTab !== 'drivers' && dashboardTab !== 'vehicles') {
      return;
    }

    let cancelled = false;

    const loadRosDashboard = async () => {
      setRosLoading(true);
      setRosError('');

      try {
        const authHeaders = user?.token ? { Authorization: `Bearer ${user.token}` } : {};

        const dashboardResponse = await fetch(`${API_BASE}/api/ros/dashboard`, { headers: authHeaders });
        if (!dashboardResponse.ok) {
          throw new Error(`ROS dashboard request failed with ${dashboardResponse.status}`);
        }

        const dashboardData = await dashboardResponse.json();
        if (cancelled) {
          return;
        }

        setRosDashboard(dashboardData);

        if (dashboardTab === 'routes') {
          const trackingResponse = await fetch(`${API_BASE}/api/tracking/dashboard`, { headers: authHeaders });
          if (trackingResponse.ok) {
            const trackingData = await trackingResponse.json();
            if (!cancelled) {
              const loadedNumbers = (trackingData?.packages ?? [])
                .filter((pkg) => pkg.status === 'LOADED')
                .map((pkg) => pkg.orderNumber);
              setLoadedOrderNumbers(new Set(loadedNumbers));
            }
          } else if (!cancelled) {
            setLoadedOrderNumbers(new Set());
          }
        }
      } catch (error) {
        if (!cancelled) {
          setRosError(error.message || 'Unable to load Route Optimization dashboard');
          setRosDashboard(null);
          setLoadedOrderNumbers(new Set());
        }
      } finally {
        if (!cancelled) {
          setRosLoading(false);
        }
      }
    };

    loadRosDashboard();

    return () => {
      cancelled = true;
    };
  }, [dashboardTab, user]);

  useEffect(() => {
    if (dashboardTab !== 'system-overview' || !user?.token) {
      return;
    }

    let cancelled = false;

    const loadSystemOverview = async () => {
      setSystemOverviewLoading(true);
      setSystemOverviewError('');

      const authHeaders = { Authorization: `Bearer ${user.token}` };

      const fetchText = async (url) => {
        try {
          const response = await fetch(url, { headers: authHeaders });
          return response.ok ? (await response.text()).trim() : 'DOWN';
        } catch {
          return 'DOWN';
        }
      };

      const fetchJson = async (url) => {
        try {
          const response = await fetch(url, { headers: authHeaders });
          return response.ok ? await response.json() : null;
        } catch {
          return null;
        }
      };

      try {
        const [stats, status, cmsStatus, rosStatus, wmsStatusData, trackingDashboard, rosDashboardData] = await Promise.all([
          fetchJson(`${API_BASE}/api/orders/admin/stats`),
          fetchJson(`${API_BASE}/api/gateway/system-status`),
          fetchText('http://localhost:8083/api/cms/status'),
          fetchText(`${API_BASE}/api/ros/status`),
          fetchJson(`${API_BASE}/api/wms/status`),
          fetchJson(`${API_BASE}/api/tracking/dashboard`),
          fetchJson(`${API_BASE}/api/ros/dashboard`)
        ]);

        if (cancelled) {
          return;
        }

        setSystemOverview(stats);
        setSystemStatus(status);
        setSystemCmsStatus(cmsStatus === 'Connected' ? 'UP' : 'DOWN');
        setSystemRosStatus(rosStatus === 'Connected' ? 'UP' : 'DOWN');
        setSystemWmsStatus(wmsStatusData?.status === 'ONLINE' ? 'UP' : 'DOWN');
        setSystemTrackingStats(trackingDashboard?.stats || null);
        setSystemRosDrivers(rosDashboardData?.drivers || []);
      } catch (error) {
        if (!cancelled) {
          setSystemOverviewError(error.message || 'Unable to load system overview');
        }
      } finally {
        if (!cancelled) {
          setSystemOverviewLoading(false);
        }
      }
    };

    loadSystemOverview();

    return () => {
      cancelled = true;
    };
  }, [dashboardTab, user]);

  useEffect(() => {
    if (dashboardTab !== 'admin-users' || !user?.token) {
      return;
    }

    let cancelled = false;

    const loadAdminUsers = async () => {
      setAdminUsersLoading(true);
      setAdminUsersError('');

      try {
        const response = await fetch(`${API_BASE}/api/orders/admin/users`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });

        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
        }

        const data = await response.json();
        if (!cancelled) {
          setAdminUsers(data);
        }
      } catch (error) {
        if (!cancelled) {
          setAdminUsersError(error.message || 'Unable to load users');
        }
      } finally {
        if (!cancelled) {
          setAdminUsersLoading(false);
        }
      }
    };

    loadAdminUsers();

    return () => {
      cancelled = true;
    };
  }, [dashboardTab, user]);

  useEffect(() => {
    if (dashboardTab !== 'admin-orders' || !user?.token) {
      return;
    }

    let cancelled = false;

    const loadAdminOrders = async () => {
      setAdminOrdersLoading(true);
      setAdminOrdersError('');

      try {
        const response = await fetch(`${API_BASE}/api/orders/admin/orders`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });

        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
        }

        const data = await response.json();
        if (!cancelled) {
          setAdminOrders(data);
        }
      } catch (error) {
        if (!cancelled) {
          setAdminOrdersError(error.message || 'Unable to load orders');
        }
      } finally {
        if (!cancelled) {
          setAdminOrdersLoading(false);
        }
      }
    };

    loadAdminOrders();

    return () => {
      cancelled = true;
    };
  }, [dashboardTab, user]);

  const handleAddDriver = async (e) => {
    e.preventDefault();
    if (!newDriverName.trim() || !newDriverEmail.trim() || !newDriverPassword.trim()) {
      setAddDriverError('Please fill out all fields.');
      return;
    }

    setAddDriverSubmitting(true);
    setAddDriverError('');
    setAddDriverSuccess('');

    const driverIdToAdd = nextDriverId;

    try {
      const rosResponse = await fetch(`${API_BASE}/api/ros/drivers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ driverId: driverIdToAdd, name: newDriverName.trim() })
      });

      if (!rosResponse.ok) {
        throw new Error(await rosResponse.text() || 'Unable to add driver to route pool');
      }

      const authResponse = await fetch(`${API_BASE}/api/auth/register-driver`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({
          driverId: driverIdToAdd,
          email: newDriverEmail.trim(),
          password: newDriverPassword
        })
      });

      if (!authResponse.ok) {
        throw new Error(await authResponse.text() || `Driver added to ROS route pool, but Order Service login account creation failed (${authResponse.status})`);
      }

      setAddDriverSuccess(`Driver ${newDriverName.trim()} (${driverIdToAdd}) added successfully.`);
      setNewDriverName('');
      setNewDriverEmail('');
      setNewDriverPassword('');

      const dashboardResponse = await fetch(`${API_BASE}/api/ros/dashboard`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (dashboardResponse.ok) {
        setRosDashboard(await dashboardResponse.json());
      }
    } catch (error) {
      setAddDriverError(error.message || 'Unable to add driver');
    } finally {
      setAddDriverSubmitting(false);
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!newVehiclePlate.trim() || !newVehicleType.trim()) {
      setAddVehicleError('Please fill out all fields.');
      return;
    }

    setAddVehicleSubmitting(true);
    setAddVehicleError('');
    setAddVehicleSuccess('');

    const vehicleIdToAdd = nextVehicleId;

    try {
      const rosResponse = await fetch(`${API_BASE}/api/ros/vehicles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({
          vehicleId: vehicleIdToAdd,
          vehiclePlate: newVehiclePlate.trim(),
          vehicleType: newVehicleType.trim()
        })
      });

      if (!rosResponse.ok) {
        throw new Error(await rosResponse.text() || 'Unable to add vehicle to fleet');
      }

      setAddVehicleSuccess(`Vehicle ${newVehicleType.trim()} (${vehicleIdToAdd}) added successfully.`);
      setNewVehiclePlate('');
      setNewVehicleType('');

      const dashboardResponse = await fetch(`${API_BASE}/api/ros/dashboard`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (dashboardResponse.ok) {
        setRosDashboard(await dashboardResponse.json());
      }
    } catch (error) {
      setAddVehicleError(error.message || 'Unable to add vehicle');
    } finally {
      setAddVehicleSubmitting(false);
    }
  };

  useEffect(() => {
    if (dashboardTab !== 'warehouse' || !user?.token) {
      return;
    }

    let cancelled = false;

    const loadWarehouseDashboard = async () => {
      setWarehouseLoading(true);
      setWarehouseError('');

      try {
        const authHeaders = { Authorization: `Bearer ${user.token}` };
        const [dashboardResponse, wmsStatusResponse] = await Promise.all([
          fetch(`${API_BASE}/api/tracking/dashboard`, { headers: authHeaders }),
          fetch(`${API_BASE}/api/wms/status`, { headers: authHeaders })
        ]);

        if (!dashboardResponse.ok) {
          throw new Error(`Warehouse dashboard request failed with ${dashboardResponse.status}`);
        }

        const dashboardData = await dashboardResponse.json();
        const statusData = wmsStatusResponse.ok
          ? await wmsStatusResponse.json()
          : { status: 'UNKNOWN' };

        if (cancelled) {
          return;
        }

        setWarehouseDashboard(dashboardData);
        setWmsStatus(statusData);
        setSelectedWarehousePackage((current) => {
          const packages = dashboardData.packages || [];
          if (!packages.length) {
            return null;
          }
          return packages.find((item) => item.orderNumber === current?.orderNumber) || packages[0];
        });
      } catch (error) {
        if (!cancelled) {
          setWarehouseError(error.message || 'Unable to load warehouse dashboard');
          setWarehouseDashboard(null);
          setWmsStatus({ status: 'UNKNOWN' });
          setSelectedWarehousePackage(null);
        }
      } finally {
        if (!cancelled) {
          setWarehouseLoading(false);
        }
      }
    };

    loadWarehouseDashboard();

    return () => {
      cancelled = true;
    };
  }, [dashboardTab, user]);

  useEffect(() => {
    if (dashboardTab !== 'warehouse' || !user?.token || !selectedWarehousePackage?.orderNumber) {
      return;
    }

    let cancelled = false;

    const loadPackageTracking = async () => {
      setSelectedWarehouseTrackingLoading(true);
      setSelectedWarehouseTrackingError('');

      try {
        const response = await fetch(`${API_BASE}/api/tracking/${selectedWarehousePackage.orderNumber}`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });

        if (!response.ok) {
          throw new Error(`Tracking request failed with ${response.status}`);
        }

        const data = await response.json();
        if (!cancelled) {
          setSelectedWarehouseTracking(data);
        }
      } catch (error) {
        if (!cancelled) {
          setSelectedWarehouseTracking(null);
          setSelectedWarehouseTrackingError(error.message || 'Unable to load package tracking history');
        }
      } finally {
        if (!cancelled) {
          setSelectedWarehouseTrackingLoading(false);
        }
      }
    };

    loadPackageTracking();

    return () => {
      cancelled = true;
    };
  }, [dashboardTab, selectedWarehousePackage, user]);

  useEffect(() => {
    if (dashboardTab !== 'driver' || !authenticatedDriver) {
      return;
    }

    let cancelled = false;
    let inFlight = false;
    let intervalId;

    const loadDriverDashboard = async (background = false) => {
      if (inFlight) {
        return;
      }

      inFlight = true;
      if (!background) {
        setDriverLoading(true);
      }
      setDriverError('');

      try {
        const response = await fetch(`${API_BASE}/api/tracking/driver`, {
          headers: { Authorization: `Bearer ${user.token}` },
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error(`Driver manifest request failed with ${response.status}`);
        }

        const data = await response.json();
        console.log('DRIVER DASHBOARD RESPONSE:', data);
        if (!cancelled) {
          setDriverDashboard(data);
        }

        const detailEntries = await Promise.all(
          (data.packages || []).map((pkg) =>
            fetch(`${API_BASE}/api/orders/status/${pkg.orderNumber}`, {
              headers: { Authorization: `Bearer ${user.token}` }
            })
              .then((res) => (res.ok ? res.json() : null))
              .then((order) => [pkg.orderNumber, order])
              .catch(() => [pkg.orderNumber, null])
          )
        );

        if (!cancelled) {
          setDriverOrderDetails(Object.fromEntries(detailEntries.filter(([, order]) => Boolean(order))));
        }
      } catch (error) {
        if (!cancelled) {
          setDriverError(error.message || 'Unable to load driver manifest');
        }
      } finally {
        inFlight = false;
        if (!cancelled) {
          setDriverLoading(false);
        }
      }
    };

    loadDriverDashboard();
    intervalId = window.setInterval(() => {
      loadDriverDashboard(true);
    }, 5000);

    return () => {
      cancelled = true;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [dashboardTab, authenticatedDriver, user]);

  useEffect(() => {
    if (dashboardTab !== 'driver' || !authenticatedDriver) {
      return;
    }

    let cancelled = false;

    const loadDriverHistory = async () => {
      setDriverHistoryLoading(true);
      setDriverHistoryError('');

      try {
        const response = await fetch(`${API_BASE}/api/tracking/driver/history`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });

        if (!response.ok) {
          throw new Error(`Driver history request failed with ${response.status}`);
        }

        const data = await response.json();
        if (!cancelled) {
          setDriverHistory(data.packages || []);
        }
      } catch (error) {
        if (!cancelled) {
          setDriverHistory([]);
          setDriverHistoryError(error.message || 'Unable to load driver history');
        }
      } finally {
        if (!cancelled) {
          setDriverHistoryLoading(false);
        }
      }
    };

    loadDriverHistory();

    return () => {
      cancelled = true;
    };
  }, [dashboardTab, authenticatedDriver, user]);

  useEffect(() => {
    if (dashboardTab !== 'driver' || !authenticatedDriver || !selectedDelivery?.orderNumber) {
      return;
    }

    let cancelled = false;

    const loadDeliveryDetails = async () => {
      setSelectedDeliveryLoading(true);
      setSelectedDeliveryError('');
      setSelectedDeliveryTracking(null);
      setSelectedDeliveryOrder(null);
      setSelectedDeliveryRoute(null);

      try {
        const authHeaders = { Authorization: `Bearer ${user.token}` };
        const [trackingResponse, orderResponse, routeResponse] = await Promise.all([
          fetch(`${API_BASE}/api/tracking/${selectedDelivery.orderNumber}`, { headers: authHeaders, cache: 'no-store' }),
          fetch(`${API_BASE}/api/orders/status/${selectedDelivery.orderNumber}`, { headers: authHeaders, cache: 'no-store' }),
          fetch(`${API_BASE}/api/ros/routes/${selectedDelivery.orderNumber}`, { headers: authHeaders, cache: 'no-store' })
        ]);

        if (!trackingResponse.ok) {
          throw new Error(`Tracking detail request failed with ${trackingResponse.status}`);
        }

        const trackingData = await trackingResponse.json();
        const orderData = orderResponse.ok ? await orderResponse.json() : null;
        const routeData = routeResponse.ok ? await routeResponse.json() : null;

        if (!cancelled) {
          setSelectedDeliveryTracking(trackingData);
          setSelectedDeliveryOrder(orderData);
          setSelectedDeliveryRoute(routeData || selectedDelivery);
        }
      } catch (error) {
        if (!cancelled) {
          setSelectedDeliveryError(error.message || 'Unable to load delivery details');
        }
      } finally {
        if (!cancelled) {
          setSelectedDeliveryLoading(false);
        }
      }
    };

    loadDeliveryDetails();

    return () => {
      cancelled = true;
    };
  }, [dashboardTab, authenticatedDriver, selectedDelivery, user]);

  const refreshClientTracking = useCallback(async (orderNumber, background = false) => {
    if (!user?.token || !orderNumber || clientTrackingRefreshInFlightRef.current) {
      return;
    }

    clientTrackingRefreshInFlightRef.current = true;
    if (!background) {
      setClientTrackingLoading(true);
      setClientTrackingError('');
    }
    setClientTrackingRefreshError('');

    try {
      const response = await fetch(`${API_BASE}/api/tracking/${encodeURIComponent(orderNumber)}`, {
        headers: { Authorization: `Bearer ${user.token}` },
        cache: 'no-store'
      });

      if (response.status === 404) {
        throw new Error('NOT_FOUND');
      }

      if (!response.ok) {
        throw new Error('REFRESH_FAILED');
      }

      const data = await response.json();
      setClientTracking(data);
      setClientTrackingLastRefreshedAt(new Date());
    } catch (error) {
      if (background && clientTracking) {
        setClientTrackingRefreshError('Unable to refresh tracking right now. Showing the last loaded update.');
      } else if (error.message === 'NOT_FOUND') {
        setClientTracking(null);
        setClientTrackingError('Tracking information was not found for this order number.');
      } else {
        setClientTracking(null);
        setClientTrackingError('Unable to load tracking information. Please try again.');
      }
    } finally {
      clientTrackingRefreshInFlightRef.current = false;
      if (!background) {
        setClientTrackingLoading(false);
      }
    }
  }, [clientTracking, user]);

  useEffect(() => {
    if (
      dashboardTab !== 'tracking'
      || !user?.token
      || !clientTracking?.orderNumber
      || ['DELIVERED', 'FAILED'].includes(clientTracking.status)
    ) {
      return;
    }

    const intervalId = window.setInterval(() => {
      refreshClientTracking(clientTracking.orderNumber, true);
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [dashboardTab, clientTracking?.orderNumber, clientTracking?.status, refreshClientTracking, user]);

  useEffect(() => {
    return () => {
      if (podPhotoPreviewUrl) {
        URL.revokeObjectURL(podPhotoPreviewUrl);
      }
    };
  }, [podPhotoPreviewUrl]);

  const rosEventLog = rosDashboard?.recentEvents ?? [];
  const rosRouteQueue = rosDashboard?.recentRoutes ?? [];
  const rosGroupedRoutes = rosDashboard?.groupedRoutes ?? [];
  // Route Optimization only shows stops for orders currently marked Loaded at the warehouse.
  const visibleGroupedRoutes = rosGroupedRoutes
    .map((route) => {
      const loadedStops = route.stops.filter((stop) => loadedOrderNumbers.has(stop.orderNumber));
      if (loadedStops.length === 0) return null;
      const lastStop = loadedStops[loadedStops.length - 1];
      return {
        ...route,
        stops: loadedStops,
        totalDistanceKm: lastStop.cumulativeDistanceKm,
        totalDurationMinutes: lastStop.cumulativeDurationMinutes
      };
    })
    .filter(Boolean);
  const rosVehicleStatus = rosDashboard?.vehicleStatus ?? [];
  const rosDrivers = rosDashboard?.drivers ?? [];
  const rosConnected = rosDashboard?.connected ?? false;

  const rosActiveVehicleCount = rosVehicleStatus.filter((v) => v.status === 'EN_ROUTE').length;
  const rosActiveDriverCount = rosDrivers.filter((d) => d.status === 'ON_ROUTE').length;
  const rosActiveRouteCount = rosGroupedRoutes.filter((r) => r.active).length;

  const rosSummaryMetrics = rosDashboard
    ? [
        { label: 'Routes Generated', value: String(rosDashboard.routesGenerated), tone: 'primary' },
        { label: 'Active Routes', value: String(rosActiveRouteCount), tone: 'primary' },
        { label: 'Vehicles Active', value: `${rosActiveVehicleCount}/${rosDashboard.vehicleCount}`, tone: 'completed' },
        { label: 'Drivers Assigned', value: `${rosActiveDriverCount}/${rosDashboard.driverCount}`, tone: 'completed' }
      ]
    : [];

  const selectedRosRoute = visibleGroupedRoutes.find((route) => route.routeId === selectedRosRouteId)
    || visibleGroupedRoutes[0]
    || null;

  const nextDriverId = (() => {
    const existingNumbers = (rosDashboard?.drivers ?? [])
      .map((driver) => parseInt(driver.driverId.replace(/^DRV-/, ''), 10))
      .filter((number) => !Number.isNaN(number));
    const nextNumber = (existingNumbers.length ? Math.max(...existingNumbers) : 0) + 1;
    return `DRV-${String(nextNumber).padStart(2, '0')}`;
  })();

  const nextVehicleId = (() => {
    const existingNumbers = (rosDashboard?.vehicleStatus ?? [])
      .map((vehicle) => parseInt(vehicle.vehicleId.replace(/^VEH-/, ''), 10))
      .filter((number) => !Number.isNaN(number));
    const nextNumber = (existingNumbers.length ? Math.max(...existingNumbers) : 0) + 1;
    return `VEH-${String(nextNumber).padStart(2, '0')}`;
  })();

  const systemStatusCards = [
    { label: 'Users', value: String(systemOverview?.totalUsers ?? 0), tone: 'primary' },
    { label: 'Orders', value: String(systemOverview?.totalOrders ?? 0), tone: 'primary' },
    { label: 'Drivers', value: String(systemOverview?.totalDrivers ?? 0), tone: 'primary' },
    { label: 'CMS Status', value: systemCmsStatus || 'UNKNOWN', tone: systemCmsStatus === 'UP' ? 'completed' : 'failed' },
    { label: 'ROS Status', value: systemRosStatus || 'UNKNOWN', tone: systemRosStatus === 'UP' ? 'completed' : 'failed' },
    { label: 'WMS Status', value: systemWmsStatus || 'UNKNOWN', tone: systemWmsStatus === 'UP' ? 'completed' : 'failed' },
    { label: 'RabbitMQ Status', value: systemStatus?.rabbitmqStatus || 'UNKNOWN', tone: systemStatus?.rabbitmqStatus === 'UP' ? 'completed' : 'failed' },
    { label: 'Gateway Status', value: systemStatus?.gatewayStatus || 'UNKNOWN', tone: systemStatus?.gatewayStatus === 'UP' ? 'completed' : 'failed' }
  ];

  const dailyOrdersChart = systemOverview?.dailyOrders ?? [];
  const dailyOrdersMax = Math.max(1, ...dailyOrdersChart.map((day) => day.count));

  const deliveredCount = systemTrackingStats?.delivered ?? 0;
  const failedCount = systemTrackingStats?.failed ?? 0;
  const deliveryOutcomeMax = Math.max(1, deliveredCount, failedCount);

  const activeDriversCount = systemRosDrivers.filter((driver) => driver.status === 'ON_ROUTE').length;
  const totalDriversForChart = Math.max(1, systemRosDrivers.length);

  const integrationHealthItems = [
    { label: 'CMS', status: systemCmsStatus },
    { label: 'ROS', status: systemRosStatus },
    { label: 'WMS', status: systemWmsStatus },
    { label: 'RabbitMQ', status: systemStatus?.rabbitmqStatus },
    { label: 'Gateway', status: systemStatus?.gatewayStatus }
  ];

  const cmsSummaryMetrics = cmsDashboard
    ? [
        { label: 'Total SOAP Requests', value: String(cmsDashboard.totalSoapRequests), tone: 'primary' },
        { label: 'Successful Requests', value: String(cmsDashboard.successfulRequests), tone: 'completed' },
        { label: 'Failed Requests', value: String(cmsDashboard.failedRequests), tone: 'failed' },
        { label: 'Retry Queue', value: String(cmsDashboard.retryQueueSize), tone: 'pending' }
      ]
    : [];

  const cmsEventLog = cmsDashboard?.recentEvents ?? [];
  const cmsRetryQueue = cmsDashboard?.retryQueue ?? [];

  const cmsSoapPreview = cmsLatestResult?.soapRequest || 'No CMS request captured yet.';
  const cmsJsonPreview = cmsLatestResult?.responseJson || 'No CMS JSON response captured yet.';

  const cmsRecentMessages = cmsDashboard?.recentEvents?.length
    ? cmsDashboard.recentEvents.map((entry) => ({
        title: entry.event,
        detail: entry.details || entry.event
      }))
    : [];

  const cmsConnected = cmsDashboard?.connected ?? false;
  const warehouseStats = warehouseDashboard?.stats || {};
  const warehouseCapacity = warehouseDashboard?.capacity || {};
  const warehousePackages = warehouseDashboard?.packages || [];
  const warehouseRecentActivity = warehouseDashboard?.recentActivity || [];
  const warehouseAvailableCapacity = Math.max(0, (warehouseCapacity.total ?? 0) - (warehouseCapacity.used ?? 0));
  const selectedWarehouseTrackingForPackage = selectedWarehousePackage?.orderNumber === selectedWarehouseTracking?.orderNumber
    ? selectedWarehouseTracking
    : null;
  const wmsStatusValue = wmsStatus?.status || 'UNKNOWN';
  const wmsStatusBadge = wmsStatusValue === 'ONLINE'
    ? 'badge-completed'
    : wmsStatusValue === 'OFFLINE'
      ? 'badge-failed'
      : 'badge-pending';

  console.log('DRIVER DASHBOARD STATE:', driverDashboard);
  console.log('DRIVER PACKAGES RAW:', driverDashboard?.packages);
  const driverPackages =
    (driverDashboard?.packages || []).filter((pkg) =>
      ['LOADED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'].includes(pkg.status)
    );

  const driverStats = {
    todaysDeliveries: driverPackages.length,
    remaining: driverPackages.filter((pkg) =>
      ['LOADED', 'OUT_FOR_DELIVERY'].includes(pkg.status)
    ).length,
    inProgress: driverPackages.filter((pkg) =>
      pkg.status === 'OUT_FOR_DELIVERY'
    ).length,
    completed: driverPackages.filter((pkg) => pkg.status === 'DELIVERED').length,
    failed: driverPackages.filter((pkg) => pkg.status === 'FAILED').length
  };
  const sortedDriverPackages = [...driverPackages].sort((a, b) => {
    const sequenceA = a.stopSequence ?? Number.MAX_SAFE_INTEGER;
    const sequenceB = b.stopSequence ?? Number.MAX_SAFE_INTEGER;
    if (sequenceA !== sequenceB) return sequenceA - sequenceB;
    return new Date(a.assignmentTime || a.updatedAt || 0) - new Date(b.assignmentTime || b.updatedAt || 0);
  });
  const nextDelivery = sortedDriverPackages.find((pkg) => pkg.status === 'OUT_FOR_DELIVERY')
    || sortedDriverPackages.find((pkg) => pkg.status === 'LOADED')
    || null;
  const nextDeliveryInfo = nextDelivery ? (driverOrderDetails[nextDelivery.orderNumber] || {}) : {};
  const routeId = sortedDriverPackages.find((pkg) => pkg.routeId)?.routeId || 'Not available';
  const activeDriverName = sortedDriverPackages.find((pkg) => pkg.driverName)?.driverName || authenticatedDriverId;
  const currentVehicle = sortedDriverPackages.find((pkg) => pkg.vehiclePlate || pkg.vehicleId) || {};
  const deliveredTodayCount = driverStats.completed;
  const routeProgress = driverPackages.length > 0 ? Math.round((deliveredTodayCount / driverPackages.length) * 100) : 0;
  const recentDriverActivity = sortedDriverPackages
    .filter((pkg) => ['DELIVERED', 'FAILED', 'OUT_FOR_DELIVERY'].includes(pkg.status))
    .slice(0, 5);
  const selectedOrderInfo = selectedDeliveryOrder || orders.find((order) => order.id === selectedDelivery?.orderNumber) || {};
  const currentDeliveryStatus = selectedDeliveryTracking?.status || selectedDelivery?.status;
  const deliveryProgress = getDeliveryProgress(currentDeliveryStatus);
  const mapAddress = selectedOrderInfo.recipientAddress || selectedOrderInfo.deliveryAddress;
  const mapsHref = mapAddress ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapAddress)}` : '';
  const driverPreviewPickup = selectedOrderInfo.senderAddress || selectedOrderInfo.pickupAddress;
  const driverPreviewRoutes = driverPreviewPickup && mapAddress
    ? [{
        routeId: selectedDeliveryRoute?.routeId || selectedDeliveryRoute?.orderNumber || selectedDelivery?.orderNumber || '',
        hubAddress: driverPreviewPickup,
        driverName: selectedDeliveryRoute?.driverName || 'Assigned driver',
        stops: [{
          sequence: selectedDeliveryRoute?.stopSequence || 1,
          orderNumber: selectedDeliveryRoute?.orderNumber || selectedDelivery?.orderNumber || '',
          deliveryAddress: mapAddress
        }]
      }]
    : [];
  const bestDeliveryLocation = mapAddress
    || selectedDeliveryTracking?.currentLocation
    || selectedDelivery?.currentLocation
    || '';
  const canConfirmPod = Boolean(podPhotoFile && podSignatureDrawn && !deliveryActionLoading);
  const canConfirmFailure = Boolean(failureReason && !deliveryActionLoading);
  const clientTrackingStatus = clientTracking?.status;
  const clientTrackingProgress = getClientTrackingProgress(clientTrackingStatus);
  const clientTrackingHistory = clientTracking?.history || [];
  const clientTrackingUpdates = [...clientTrackingHistory].reverse();
  const clientTrackingOrderInfo = orders.find((order) => order.id === clientTracking?.orderNumber) || {};
  const clientTrackingDestination = clientTrackingOrderInfo.deliveryAddress || clientTrackingOrderInfo.recipientAddress;
  const clientTrackingMapsHref = clientTrackingDestination
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clientTrackingDestination)}`
    : '';
  const latestTerminalEvent = clientTrackingHistory
    .filter((entry) => entry.status === clientTrackingStatus)
    .at(-1);

  // Count unread notifications
  const unreadCount = notifications.filter(n => n.unread).length;

  // Handle Login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Please fill in all fields.');
      return;
    }

    setLoginSubmitting(true);
    setLoginError('');

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginEmail.trim(), password: loginPassword })
      });

      const bodyText = await response.text();
      if (!response.ok) {
        throw new Error(bodyText || 'Invalid email or password.');
      }

      const auth = JSON.parse(bodyText);
      const registeredAccounts = readStoredValue(REGISTERED_ACCOUNTS_STORAGE_KEY, seedRegisteredAccounts);
      const matchedAccount = registeredAccounts.find(
        (account) => account.email.toLowerCase() === loginEmail.trim().toLowerCase()
      );

      setUser({
        name: matchedAccount?.name || auth.username,
        email: loginEmail.trim(),
        company: matchedAccount?.company || '',
        role: auth.role,
        username: auth.username,
        token: auth.token
      });
      setCurrentScreen('dashboard');
      setDashboardTab(portalPathTab || (auth.role === 'ADMIN' ? 'system-overview' : 'overview'));
    } catch (error) {
      setLoginError(error.message || 'Unable to sign in. Please try again.');
    } finally {
      setLoginSubmitting(false);
    }
  };

  // Handle Register submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim() || !regCompany.trim()) {
      setRegisterError('Please fill in all fields.');
      return;
    }

    setRegisterSubmitting(true);
    setRegisterError('');

    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regEmail.trim(),
          email: regEmail.trim(),
          password: regPassword
        })
      });

      const bodyText = await response.text();
      if (!response.ok) {
        throw new Error(bodyText || 'Unable to create account.');
      }

      const auth = JSON.parse(bodyText);

      const registeredAccounts = readStoredValue(REGISTERED_ACCOUNTS_STORAGE_KEY, seedRegisteredAccounts);
      const newAccount = {
        name: regName.trim(),
        email: regEmail.trim(),
        company: regCompany.trim()
      };
      writeStoredValue(REGISTERED_ACCOUNTS_STORAGE_KEY, [...registeredAccounts, newAccount]);

      setUser({
        name: newAccount.name,
        email: newAccount.email,
        company: newAccount.company,
        role: auth.role,
        username: auth.username,
        token: auth.token
      });
      setCurrentScreen('dashboard');
      setDashboardTab(portalPathTab || 'overview');
    } catch (error) {
      setRegisterError(error.message || 'Unable to create account. Please try again.');
    } finally {
      setRegisterSubmitting(false);
    }
  };

  // Handle new order submission
  const handleCreateOrderSubmit = async (e) => {
    e.preventDefault();
    if (!pickupAddress.trim() || !receiverName.trim() || !receiverPhone.trim() || !deliveryAddress.trim() || !weight) {
      alert('Please fill out all required fields.');
      return;
    }

    if (!user?.token) {
      setOrderSubmitError('Your session has expired. Please sign in again.');
      return;
    }

    setOrderSubmitting(true);
    setOrderSubmitError('');

    try {
      const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          description: `${packageType} - ${priority} priority${deliveryNotes ? ` - ${deliveryNotes}` : ''}`,
          senderAddress: pickupAddress,
          recipientAddress: deliveryAddress,
          weight: parseFloat(weight),
          receiverName,
          receiverPhone,
          packageType,
          priority,
          deliveryNotes
        })
      });

      const bodyText = await response.text();
      if (!response.ok) {
        throw new Error(bodyText || 'Unable to create order.');
      }

      const createdOrder = JSON.parse(bodyText);
      const newOrderId = createdOrder.orderNumber;
      const newOrder = {
        id: newOrderId,
        date: (createdOrder.createdAt || new Date().toISOString()).split('T')[0],
        pickupAddress,
        receiverName,
        receiverPhone,
        deliveryAddress,
        packageType,
        weight: parseFloat(weight),
        priority,
        status: 'Pending',
        driver: 'Assigning...',
        vehicle: 'TBD',
        notes: deliveryNotes || 'None',
        history: [
          { status: 'Pending', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]
      };

      // Update database
      setOrders([newOrder, ...orders]);
      setLatestSubmittedId(newOrderId);
      setShowSuccessModal(true);

      // The real "Order Created" notification is persisted server-side by the
      // Notification Service (via the OrderCreated RabbitMQ event) - refresh from
      // there instead of fabricating a local, non-persisted notification.
      setTimeout(loadNotifications, 800);

      // Reset Form
      setPickupAddress('');
      setReceiverName('');
      setReceiverPhone('');
      setDeliveryAddress('');
      setPackageType('Parcel');
      setWeight('');
      setPriority('Standard');
      setDeliveryNotes('');
    } catch (error) {
      setOrderSubmitError(error.message || 'Unable to create order. Please try again.');
    } finally {
      setOrderSubmitting(false);
    }
  };

  // Handle search tracking number
  const handleTrackSubmit = async (e) => {
    e.preventDefault();
    const orderNumber = trackingSearchTerm.trim();
    if (!orderNumber) {
      setClientTrackingError('Please enter an order number.');
      setClientTracking(null);
      return;
    }

    await refreshClientTracking(orderNumber);
  };

  const resetClientTracking = () => {
    setClientTracking(null);
    setClientTrackingError('');
    setClientTrackingRefreshError('');
    setClientTrackingLastRefreshedAt(null);
    setTrackingSearchTerm('');
  };

  const refreshWarehouseDashboard = async () => {
    if (!user?.token) {
      return;
    }

    const authHeaders = { Authorization: `Bearer ${user.token}` };
    const [dashboardResponse, wmsStatusResponse] = await Promise.all([
      fetch(`${API_BASE}/api/tracking/dashboard`, { headers: authHeaders }),
      fetch(`${API_BASE}/api/wms/status`, { headers: authHeaders })
    ]);

    if (!dashboardResponse.ok) {
      throw new Error(`Warehouse dashboard request failed with ${dashboardResponse.status}`);
    }

    const dashboardData = await dashboardResponse.json();
    setWarehouseDashboard(dashboardData);
    setWmsStatus(wmsStatusResponse.ok ? await wmsStatusResponse.json() : { status: 'UNKNOWN' });
    setSelectedWarehousePackage((current) => {
      const packages = dashboardData.packages || [];
      if (!packages.length) {
        return null;
      }
      return packages.find((item) => item.orderNumber === current?.orderNumber) || packages[0];
    });
  };

  const openWarehouseLoadPanel = (pkg) => {
    setWarehouseLoadPackage(pkg);
    setWarehouseLoadLocation('');
    setWarehouseLoadError('');
  };

  const closeWarehouseLoadPanel = () => {
    setWarehouseLoadPackage(null);
    setWarehouseLoadLocation('');
    setWarehouseLoadError('');
  };

  const handleWarehouseMarkLoaded = async () => {
    if (!warehouseLoadPackage || warehouseLoadSubmitting) {
      return;
    }

    if (!warehouseLoadLocation.trim()) {
      setWarehouseLoadError('Vehicle / Loading Location is required.');
      return;
    }

    setWarehouseLoadSubmitting(true);
    setWarehouseLoadError('');

    try {
      const response = await fetch(`${API_BASE}/api/tracking/${warehouseLoadPackage.orderNumber}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({
          status: 'LOADED',
          location: warehouseLoadLocation.trim(),
          description: 'Package loaded onto delivery vehicle'
        })
      });

      const bodyText = await response.text();
      if (!response.ok) {
        throw new Error(bodyText || `Unable to mark package as loaded (${response.status})`);
      }

      closeWarehouseLoadPanel();
      await refreshWarehouseDashboard();
    } catch (error) {
      setWarehouseLoadError(error.message || 'Unable to mark package as loaded.');
    } finally {
      setWarehouseLoadSubmitting(false);
    }
  };

  const handleDriverLoginSubmit = async (e) => {
    e.preventDefault();

    if (!driverLoginId.trim() || !driverPassword.trim()) {
      setDriverLoginError('Driver ID and password are required.');
      return;
    }

    setDriverLoginError('');

    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: driverLoginId.trim(),
          password: driverPassword
        })
      });

      // Read response as text first.
      // This works whether backend returns JSON or plain text.
      const responseText = await response.text();

      let data = {};

      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        // Backend returned plain text instead of JSON
        data = {
          message: responseText.trim()
        };
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          'Invalid driver ID or password.'
        );
      }

      // Make sure this account is actually a DRIVER account
      if (data.role !== 'DRIVER') {
        throw new Error('This account is not registered as a driver.');
      }

      // Store the authenticated backend user
      const authenticatedUser = {
        username: data.username,
        role: data.role,
        token: data.token
      };

      setUser(authenticatedUser);
      writeStoredValue(AUTH_USER_STORAGE_KEY, authenticatedUser);

      // Driver-specific session information
      writeSessionValue(DRIVER_VERIFIED_SESSION_KEY, 'true');
      writeSessionValue(DRIVER_ID_SESSION_KEY, data.username);

      setDriverId(data.username);
      setDriverVerified(true);

      setDriverLoginId('');
      setDriverPassword('');
      setDriverLoginError('');

    } catch (error) {
      console.error('Driver login error:', error);

      setDriverLoginError(
        error.message || 'Unable to login. Please try again.'
      );
    }
  };  

  const handleDriverLogout = () => {
    removeSessionValue(DRIVER_VERIFIED_SESSION_KEY);
    removeSessionValue(DRIVER_ID_SESSION_KEY);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    }
    setUser(null);
    setDriverVerified(false);
    setDriverId('');
    setDriverLoginId('');
    setDriverPassword('');
    setDriverLoginError('');
    setSelectedDelivery(null);
    setSelectedDeliveryTracking(null);
    setSelectedDeliveryOrder(null);
    setSelectedDeliveryRoute(null);
    setDriverDashboard(null);
    setPodOpen(false);
    setFailureOpen(false);
  };

  const refreshDriverDashboard = async () => {
    if (!authenticatedDriver) {
      return null;
    }

    const response = await fetch(`${API_BASE}/api/tracking/driver`, {
      headers: { Authorization: `Bearer ${user.token}` },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Driver manifest request failed with ${response.status}`);
    }

    const data = await response.json();
    setDriverDashboard(data);
    const detailEntries = await Promise.all(
      (data.packages || []).map((pkg) =>
        fetch(`${API_BASE}/api/orders/status/${pkg.orderNumber}`, {
          headers: { Authorization: `Bearer ${user.token}` },
          cache: 'no-store'
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((order) => [pkg.orderNumber, order])
          .catch(() => [pkg.orderNumber, null])
      )
    );
    setDriverOrderDetails(Object.fromEntries(detailEntries.filter(([, order]) => Boolean(order))));
    setSelectedDelivery((current) => {
      if (!current) {
        return current;
      }
      return (data.packages || []).find((pkg) => pkg.orderNumber === current.orderNumber) || current;
    });
    return data;
  };

  const refreshSelectedDeliveryDetails = async () => {
    if (!authenticatedDriver || !selectedDelivery?.orderNumber) {
      return;
    }

    const authHeaders = { Authorization: `Bearer ${user.token}` };
    const [trackingResponse, orderResponse, routeResponse] = await Promise.all([
      fetch(`${API_BASE}/api/tracking/${selectedDelivery.orderNumber}`, { headers: authHeaders, cache: 'no-store' }),
      fetch(`${API_BASE}/api/orders/status/${selectedDelivery.orderNumber}`, { headers: authHeaders, cache: 'no-store' }),
      fetch(`${API_BASE}/api/ros/routes/${selectedDelivery.orderNumber}`, { headers: authHeaders, cache: 'no-store' })
    ]);

    if (!trackingResponse.ok) {
      throw new Error(`Tracking detail request failed with ${trackingResponse.status}`);
    }

    setSelectedDeliveryTracking(await trackingResponse.json());
    setSelectedDeliveryOrder(orderResponse.ok ? await orderResponse.json() : null);
    setSelectedDeliveryRoute(routeResponse.ok ? await routeResponse.json() : selectedDelivery);
  };

  const updateDeliveryStatus = async ({ status, location, reason, note, loadingKey }) => {
    if (!authenticatedDriver || !selectedDelivery?.orderNumber) {
      return;
    }

    setDeliveryActionLoading(loadingKey);
    setDeliveryActionError('');

    try {
      const response = await fetch(`${API_BASE}/api/tracking/driver/${selectedDelivery.orderNumber}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ status, location, reason, note })
      });

      const bodyText = await response.text();
      if (!response.ok) {
        throw new Error(bodyText || `Tracking update failed with ${response.status}`);
      }

      const updatedTracking = bodyText ? JSON.parse(bodyText) : null;
      if (updatedTracking) {
        setSelectedDeliveryTracking(updatedTracking);
      }
      await refreshDriverDashboard();
      await refreshSelectedDeliveryDetails();
    } catch (error) {
      setDeliveryActionError(error.message || 'Unable to update delivery status');
      throw error;
    } finally {
      setDeliveryActionLoading('');
    }
  };

  const handleStartDelivery = async () => {
    try {
      await updateDeliveryStatus({
        status: 'OUT_FOR_DELIVERY',
        location: 'In transit',
        description: 'Driver started delivery',
        loadingKey: 'start'
      });
    } catch {
      // Error state is shown in the delivery details panel.
    }
  };

  const clearPodState = () => {
    setPodOpen(false);
    setPodPhotoFile(null);
    setPodPhotoPreviewUrl('');
    setPodNote('');
    setPodSignatureDrawn(false);
    setPodValidationError('');
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const clearFailureState = () => {
    setFailureOpen(false);
    setFailureReason('');
    setFailureNote('');
    setFailureValidationError('');
  };

  const handlePodPhotoChange = (event) => {
    const file = event.target.files?.[0] || null;
    setPodPhotoFile(file);
    setPodValidationError('');

    if (podPhotoPreviewUrl) {
      URL.revokeObjectURL(podPhotoPreviewUrl);
    }

    setPodPhotoPreviewUrl(file ? URL.createObjectURL(file) : '');
  };

  const getSignaturePoint = (event) => {
    const canvas = signatureCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height
    };
  };

  const handleSignaturePointerDown = (event) => {
    const canvas = signatureCanvasRef.current;
    const context = canvas.getContext('2d');
    const point = getSignaturePoint(event);
    signatureDrawingRef.current = true;
    canvas.setPointerCapture(event.pointerId);
    context.beginPath();
    context.moveTo(point.x, point.y);
  };

  const handleSignaturePointerMove = (event) => {
    if (!signatureDrawingRef.current) {
      return;
    }

    const canvas = signatureCanvasRef.current;
    const context = canvas.getContext('2d');
    const point = getSignaturePoint(event);
    context.lineWidth = 3;
    context.lineCap = 'round';
    context.strokeStyle = '#0f172a';
    context.lineTo(point.x, point.y);
    context.stroke();
    setPodSignatureDrawn(true);
  };

  const handleSignaturePointerUp = () => {
    signatureDrawingRef.current = false;
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    setPodSignatureDrawn(false);
  };

  const getSignatureBlob = () => new Promise((resolve, reject) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) {
      reject(new Error('Customer signature is required.'));
      return;
    }

    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Unable to capture customer signature.'));
      }
    }, 'image/png');
  });

  const handleConfirmDelivery = async () => {
    if (!podPhotoFile || !podSignatureDrawn) {
      setPodValidationError('Delivery photo and customer signature are required.');
      return;
    }

    const note = podNote.trim();
    setDeliveryActionLoading('delivered');
    setDeliveryActionError('');

    try {
      const signatureBlob = await getSignatureBlob();
      const formData = new FormData();
      formData.append('photo', podPhotoFile);
      formData.append('signature', signatureBlob, 'signature.png');
      formData.append('note', note);
      formData.append('location', bestDeliveryLocation);

      const response = await fetch(`${API_BASE}/api/tracking/driver/${selectedDelivery.orderNumber}/complete`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`
        },
        body: formData
      });

      const bodyText = await response.text();
      if (!response.ok) {
        throw new Error(bodyText || `Proof of Delivery failed with ${response.status}`);
      }

      await refreshSelectedDeliveryDetails();
      await refreshDriverDashboard();
      clearPodState();
    } catch (error) {
      setDeliveryActionError(error.message || 'Unable to complete delivery');
    } finally {
      setDeliveryActionLoading('');
    }
  };

  const handleConfirmFailure = async () => {
    if (!failureReason) {
      setFailureValidationError('Failure reason is required.');
      return;
    }

    try {
      await updateDeliveryStatus({
        status: 'FAILED',
        location: bestDeliveryLocation,
        reason: failureReason,
        note: failureNote.trim(),
        loadingKey: 'failed'
      });
      clearFailureState();
    } catch {
      // Error state is shown in the delivery details panel.
    }
  };

  // Handle Contact Form Submit
  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSuccess('Thank you for reaching out! A SwiftTrack representative will contact you shortly.');
    setContactName('');
    setContactEmail('');
    setContactMessage('');
    setTimeout(() => setContactSuccess(''), 5000);
  };

  const markNotificationRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, unread: false } : n)));

    if (user?.token) {
      fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${user.token}` }
      }).catch(() => {});
    }
  };

  const markAllNotificationsRead = () => {
    const unreadIds = notifications.filter((n) => n.unread).map((n) => n.id);
    setNotifications(notifications.map(n => ({ ...n, unread: false })));

    if (user?.token) {
      unreadIds.forEach((id) => {
        fetch(`${API_BASE}/api/notifications/${id}/read`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${user.token}` }
        }).catch(() => {});
      });
    }
  };

  // Compute stats counters
  const totalOrdersCount = orders.length;
  const terminalOrderStatuses = new Set(['DELIVERED', 'FAILED', 'CANCELLED', 'CANCELED']);
  const deliveredOrdersCount = orders.filter((order) => normalizeStatusKey(order.status) === 'DELIVERED').length;
  const failedOrdersCount = orders.filter((order) =>
    ['FAILED', 'CANCELLED', 'CANCELED'].includes(normalizeStatusKey(order.status))
  ).length;
  const pendingOrdersCount = orders.filter((order) =>
    !terminalOrderStatuses.has(normalizeStatusKey(order.status))
  ).length;

  // Filter and Sort orders
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'All') return matchesSearch;
    return matchesSearch && normalizeStatusKey(o.status) === normalizeStatusKey(statusFilter);
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'Newest') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'Oldest') return new Date(a.date) - new Date(b.date);
    if (sortBy === 'Weight') return b.weight - a.weight;
    return 0;
  });
  const isSeparatedMemberPortal = portalPathTab === 'warehouse' || portalPathTab === 'driver';
  const portalLoginTitle = portalPathTab === 'warehouse'
    ? 'SwiftTrack Warehouse'
    : portalPathTab === 'driver'
      ? 'SwiftTrack Driver'
      : 'Welcome Back';
  const portalLoginSubtitle = portalPathTab === 'warehouse'
    ? 'Warehouse Staff Access'
    : portalPathTab === 'driver'
      ? 'Continue to Driver Portal'
      : 'Sign in to your client portal';
  const portalLoginButtonLabel = portalPathTab === 'warehouse'
    ? 'Continue to Warehouse Portal'
    : portalPathTab === 'driver'
      ? 'Continue to Driver Portal'
      : 'Sign In';

  return (
    <div>
      {/* 1. PUBLIC LANDING SCREEN */}
      {currentScreen === 'landing' && (
        <div>
          {/* Landing Header */}
          <nav className="landing-nav">
            <a href="#" className="logo" onClick={() => setCurrentScreen('landing')}>
              <LogoIcon />
              <span>SwiftTrack</span>
            </a>
            <div className="nav-links">
              <a href="#about" className="nav-link">About</a>
              <a href="#features" className="nav-link">Features</a>
              <a href="#how-it-works" className="nav-link">How it Works</a>
              <a href="#testimonials" className="nav-link">Testimonials</a>
              <a href="#contact" className="nav-link">Contact</a>
            </div>
            <div className="nav-actions">
              <button className="btn btn-secondary" onClick={() => setCurrentScreen('login')}>Sign In</button>
              <button className="btn btn-primary" onClick={() => setCurrentScreen('register')}>Register</button>
            </div>
          </nav>

          {/* Hero Section */}
          <header className="hero-section">
            <div>
              <h1 className="hero-title">
                The Connected Middleware <span>Logistics Hub</span> for Enterprise
              </h1>
              <p className="hero-desc">
                SwiftTrack unifies your logistics network. Orchestrate your WMS, Client Management (CMS), Route Optimization (ROS), and tracking into one sleek, event-driven middleware platform.
              </p>
              <div className="hero-actions">
                <button className="btn btn-primary" style={{ padding: '14px 28px', fontSize: '15px' }} onClick={() => setCurrentScreen('login')}>
                  Launch Client Portal
                </button>
                <a href="#features" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '15px' }}>
                  Explore Features
                </a>
              </div>
            </div>
            <div className="hero-illustration">
              <svg viewBox="0 0 500 400" width="100%" height="320" style={{ maxWidth: '440px' }}>
                <defs>
                  <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
                {/* Visual Representation of Grid Network */}
                <circle cx="100" cy="150" r="45" fill="url(#blueGrad)" opacity="0.1" />
                <circle cx="400" cy="150" r="45" fill="url(#blueGrad)" opacity="0.1" />
                
                <line x1="140" y1="150" x2="360" y2="150" stroke="#2563eb" strokeWidth="3" strokeDasharray="6 4" opacity="0.4" />
                <path d="M 140 150 Q 250 80 360 150" fill="none" stroke="#2563eb" strokeWidth="2" opacity="0.2" />
                <path d="M 140 150 Q 250 220 360 150" fill="none" stroke="#2563eb" strokeWidth="2" opacity="0.2" />

                {/* Nodes */}
                <g transform="translate(100, 150)">
                  <circle cx="0" cy="0" r="28" fill="#2563eb" />
                  <rect x="-10" y="-10" width="20" height="20" fill="none" stroke="#ffffff" strokeWidth="2" rx="2" />
                  <line x1="-10" y1="-2" x2="10" y2="-2" stroke="#ffffff" strokeWidth="2" />
                </g>
                <g transform="translate(400, 150)">
                  <circle cx="0" cy="0" r="28" fill="#10b981" />
                  <path d="M-8 4 L0 -6 L8 4" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="0" cy="5" r="2" fill="#ffffff" />
                </g>
                <g transform="translate(250, 150)">
                  <circle cx="0" cy="0" r="20" fill="#f59e0b" />
                  <polygon points="230,144 235,150 230,156" fill="#f59e0b" transform="translate(-230,-150)" />
                  <path d="M-6 -6 L6 6 M6 -6 L-6 6" stroke="#ffffff" strokeWidth="2" />
                </g>
                <g transform="translate(250, 260)">
                  <rect x="-50" y="-18" width="100" height="36" fill="#ffffff" stroke="#e2e8f0" rx="6" />
                  <text x="0" y="4" fill="#64748b" fontSize="11" fontWeight="600" textAnchor="middle">Route Optimized</text>
                </g>
                <line x1="250" y1="170" x2="250" y2="242" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" />
              </svg>
            </div>
          </header>

          {/* About Section */}
          <section id="about" className="section-padding" style={{ backgroundColor: '#f8fafc' }}>
            <div className="about-grid">
              <div>
                <span className="section-label">Enterprise Middleware</span>
                <h2 className="section-title" style={{ marginTop: '8px' }}>Orchestrating Complex Logistics End-to-End</h2>
                <p className="about-text" style={{ marginTop: '24px' }}>
                  SwiftTrack is built to solve the fragmentation of logistics IT systems. By acting as a secure middleware layer, it connects the Client Portal directly to Warehouse Management Systems (WMS), Client Billing (CMS), Route Optimization (ROS), and Tracking Microservices.
                </p>
                <p className="about-text" style={{ marginTop: '16px' }}>
                  Our event-driven framework handles order creation, automatic route generation via advanced heuristics, automated driver dispatching, and live geofencing to give clients real-time updates.
                </p>
              </div>
              <div style={{ padding: '24px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                  <div className="contact-info-icon"><ShieldCheckIcon /></div>
                  <div style={{ textAlign: 'left' }}>
                    <h4 style={{ fontWeight: '600' }}>JWT-Based Security</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Secure client tokens and Gateway validation ensures strict role-based access control.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                  <div className="contact-info-icon"><TruckIcon /></div>
                  <div style={{ textAlign: 'left' }}>
                    <h4 style={{ fontWeight: '600' }}>Real-time Delivery Network</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>Automated route generation and dispatching gets vehicles moving within minutes of booking.</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div className="contact-info-icon"><RouteIcon /></div>
                  <div style={{ textAlign: 'left' }}>
                    <h4 style={{ fontWeight: '600' }}>Optimized Delivery Paths</h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>ROS algorithm calculates fuel efficiency and distance to minimize cost-per-mile.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="section-padding" style={{ backgroundColor: '#ffffff' }}>
            <div className="section-header">
              <span className="section-label">Core Capabilities</span>
              <h2 className="section-title">Everything you need for freight orchestration</h2>
              <p className="section-subtitle">A high-fidelity platform engineered to connect dispatch, warehouse, and tracking databases instantly.</p>
            </div>
            <div className="features-grid">
              <div className="card feature-card">
                <div className="feature-icon-wrapper">
                  <LogoIcon />
                </div>
                <h3>Unified Client Portal</h3>
                <p>Submit orders, manage bills, and search transaction histories in a centralized, intuitive interface.</p>
              </div>
              <div className="card feature-card">
                <div className="feature-icon-wrapper">
                  <TruckIcon />
                </div>
                <h3>Driver Dispatching</h3>
                <p>Broadcast optimized delivery details straight to regional drivers with automated vehicle mapping.</p>
              </div>
              <div className="card feature-card">
                <div className="feature-icon-wrapper">
                  <RouteIcon />
                </div>
                <h3>Route Heuristics</h3>
                <p>Calculate transit paths using live traffic and weather, minimizing delivery timelines automatically.</p>
              </div>
              <div className="card feature-card">
                <div className="feature-icon-wrapper">
                  <TrackingIcon />
                </div>
                <h3>Public Status Tracking</h3>
                <p>Provide public endpoints allowing consignees to check status updates without auth requirements.</p>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section id="how-it-works" className="section-padding" style={{ backgroundColor: '#f8fafc' }}>
            <div className="section-header">
              <span className="section-label">The Lifecycle</span>
              <h2 className="section-title">How SwiftTrack unifies logistics</h2>
            </div>
            <div className="steps-container">
              <div className="step-item">
                <div className="step-num">1</div>
                <h3>Client Submits Order</h3>
                <p>Orders are ingested via Gateway with secure JSON token parsing.</p>
              </div>
              <div className="step-item">
                <div className="step-num">2</div>
                <h3>WMS validation</h3>
                <p>Warehouse systems verify inventory levels and dispatch queues.</p>
              </div>
              <div className="step-item">
                <div className="step-num">3</div>
                <h3>ROS Optimization</h3>
                <p>Route Optimization engines design paths and assign regional drivers.</p>
              </div>
              <div className="step-item">
                <div className="step-num">4</div>
                <h3>Live Delivery</h3>
                <p>Real-time updates trigger notifications to the client portal instantly.</p>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section id="testimonials" className="section-padding" style={{ backgroundColor: '#ffffff' }}>
            <div className="section-header">
              <span className="section-label">Client Stories</span>
              <h2 className="section-title">Trusted by Leading Industries</h2>
            </div>
            <div className="testimonials-grid">
              <div className="card testimonial-card">
                <div className="testimonial-rating">★★★★★</div>
                <p className="testimonial-quote">
                  "SwiftTrack reduced our booking confirmation latency by 80%. Connecting WMS and routing systems into a single dashboard has changed how we manage our freight operations."
                </p>
                <div className="testimonial-user">
                  <div className="testimonial-avatar">JD</div>
                  <div className="testimonial-info">
                    <h4>Jonathan Davis</h4>
                    <p>Director of Operations, Apex Steel</p>
                  </div>
                </div>
              </div>
              <div className="card testimonial-card">
                <div className="testimonial-rating">★★★★★</div>
                <p className="testimonial-quote">
                  "Having instant access to public order tracking without requiring logins has significantly cut down our customer support call volume. Our customers love the transparency."
                </p>
                <div className="testimonial-user">
                  <div className="testimonial-avatar">MH</div>
                  <div className="testimonial-info">
                    <h4>Maria Hernandez</h4>
                    <p>Logistics Specialist, BioHealth Labs</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact" className="section-padding" style={{ backgroundColor: '#f8fafc' }}>
            <div className="contact-container">
              <div style={{ textAlign: 'left' }}>
                <span className="section-label">Get in Touch</span>
                <h2 className="section-title" style={{ marginTop: '8px' }}>Ready to optimize your supply chain?</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '16px', fontSize: '15px' }}>
                  Speak with an integration specialist today to learn how SwiftTrack's middleware can connect your databases and optimize routes.
                </p>
                <div className="contact-info-list">
                  <div className="contact-info-item">
                    <div className="contact-info-icon"><UserIcon /></div>
                    <div className="contact-info-text">
                      <h4>Headquarters</h4>
                      <p>100 Logistics Plaza, Boston MA 02110</p>
                    </div>
                  </div>
                  <div className="contact-info-item">
                    <div className="contact-info-icon"><BellIcon /></div>
                    <div className="contact-info-text">
                      <h4>Email Enquiries</h4>
                      <p>support@swifttrack.io</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <form className="contact-form" onSubmit={handleContactSubmit}>
                  {contactSuccess && <div className="success-message" style={{ margin: '0 0 20px 0' }}>✓ {contactSuccess}</div>}
                  <div className="auth-form-group">
                    <label htmlFor="contact-name">Name</label>
                    <input 
                      type="text" 
                      id="contact-name"
                      className="auth-input" 
                      placeholder="Your Name" 
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="auth-form-group">
                    <label htmlFor="contact-email">Email Address</label>
                    <input 
                      type="email" 
                      id="contact-email"
                      className="auth-input" 
                      placeholder="you@company.com" 
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="auth-form-group">
                    <label htmlFor="contact-msg">Message</label>
                    <textarea 
                      id="contact-msg" 
                      className="auth-input" 
                      style={{ minHeight: '100px', resize: 'vertical' }} 
                      placeholder="How can we help you?"
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Send Message</button>
                </form>
              </div>
            </div>
          </section>

          {/* Landing Footer */}
          <footer className="footer">
            <div className="footer-grid">
              <div style={{ textAlign: 'left' }}>
                <a href="#" className="logo">
                  <LogoIcon />
                  <span>SwiftTrack</span>
                </a>
                <p className="footer-desc">
                  Connecting and optimizing physical supply chains through reliable middleware system orchestration.
                </p>
              </div>
              <div className="footer-column" style={{ textAlign: 'left' }}>
                <h4>Product</h4>
                <ul className="footer-links">
                  <li><a href="#features">Features</a></li>
                  <li><a href="#how-it-works">How it Works</a></li>
                  <li><a href="#">APIs</a></li>
                </ul>
              </div>
              <div className="footer-column" style={{ textAlign: 'left' }}>
                <h4>Company</h4>
                <ul className="footer-links">
                  <li><a href="#about">About Us</a></li>
                  <li><a href="#">Press</a></li>
                  <li><a href="#">Careers</a></li>
                </ul>
              </div>
              <div className="footer-column" style={{ textAlign: 'left' }}>
                <h4>Legal</h4>
                <ul className="footer-links">
                  <li><a href="#">Privacy Policy</a></li>
                  <li><a href="#">Terms of Service</a></li>
                  <li><a href="#">Security</a></li>
                </ul>
              </div>
            </div>
            <div className="footer-bottom">
              <p>&copy; 2026 SwiftTrack Technologies Inc. All rights reserved.</p>
              <p>Platform status: Normal</p>
            </div>
          </footer>
        </div>
      )}

      {/* 2. AUTHENTICATION SCREENS */}
      {currentScreen === 'login' && (
        <div className="auth-page">
          <div className="auth-wrapper">
            <div className="auth-logo-center">
              <a href="#" className="logo" onClick={() => setCurrentScreen('landing')}>
                <LogoIcon />
                <span>SwiftTrack</span>
              </a>
            </div>
            <div className="auth-header">
              <h2>{portalLoginTitle}</h2>
              <p style={{ marginTop: '4px' }}>{portalLoginSubtitle}</p>
            </div>

            {loginError && <div className="error-message" style={{ margin: '0 0 20px 0' }}>⚠️ {loginError}</div>}

            <form onSubmit={handleLoginSubmit}>
              <div className="auth-form-group">
                <label htmlFor="login-email">Email Address</label>
                <input 
                  type="email" 
                  id="login-email" 
                  className="auth-input" 
                  placeholder="name@company.com" 
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="auth-form-group">
                <label htmlFor="login-pass">Password</label>
                <input 
                  type="password" 
                  id="login-pass" 
                  className="auth-input" 
                  placeholder="••••••••" 
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required 
                />
              </div>
              <div className="auth-options">
                <label className="auth-remember">
                  <input type="checkbox" defaultChecked />
                  <span>Remember me</span>
                </label>
                <a href="#" className="auth-forgot" onClick={() => alert('Password reset link sent to email.')}>Forgot password?</a>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loginSubmitting}>
                {loginSubmitting ? 'Signing In...' : portalLoginButtonLabel}
              </button>
            </form>

            {!portalPathTab ? (
              <div className="staff-access-panel">
                <div>
                  <h3>Driver Access</h3>
                  <p>Open the driver operations portal.</p>
                </div>
                <div className="staff-access-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => openPortalEntry('driver')}>
                    Driver Portal
                  </button>
                </div>
              </div>
            ) : (
              <button type="button" className="auth-back-button" onClick={returnToClientLogin}>
                Back to Client Login
              </button>
            )}

            <p className="auth-switch">
              Don't have an account?{' '}
              <span className="auth-switch-link" onClick={() => setCurrentScreen('register')}>Register here</span>
            </p>
          </div>
        </div>
      )}

      {currentScreen === 'register' && (
        <div className="auth-page">
          <div className="auth-wrapper">
            <div className="auth-logo-center">
              <a href="#" className="logo" onClick={() => setCurrentScreen('landing')}>
                <LogoIcon />
                <span>SwiftTrack</span>
              </a>
            </div>
            <div className="auth-header">
              <h2>Create Account</h2>
              <p style={{ marginTop: '4px' }}>Register for portal order dispatch</p>
            </div>

            {registerError && <div className="error-message" style={{ margin: '0 0 20px 0' }}>⚠️ {registerError}</div>}

            <form onSubmit={handleRegisterSubmit}>
              <div className="auth-form-group">
                <label htmlFor="reg-name">Full Name</label>
                <input 
                  type="text" 
                  id="reg-name" 
                  className="auth-input" 
                  placeholder="Sarah Jenkins" 
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required 
                />
              </div>
              <div className="auth-form-group">
                <label htmlFor="reg-email">Email Address</label>
                <input 
                  type="email" 
                  id="reg-email" 
                  className="auth-input" 
                  placeholder="sarah.jenkins@acmecorp.com" 
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="auth-form-group">
                <label htmlFor="reg-company">Company Name</label>
                <input 
                  type="text" 
                  id="reg-company" 
                  className="auth-input" 
                  placeholder="Acme Industries Ltd" 
                  value={regCompany}
                  onChange={(e) => setRegCompany(e.target.value)}
                  required 
                />
              </div>
              <div className="auth-form-group">
                <label htmlFor="reg-pass">Password</label>
                <input 
                  type="password" 
                  id="reg-pass" 
                  className="auth-input" 
                  placeholder="••••••••" 
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required 
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '8px' }} disabled={registerSubmitting}>
                {registerSubmitting ? 'Creating Account...' : 'Register Account'}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account?{' '}
              <span className="auth-switch-link" onClick={() => setCurrentScreen('login')}>Sign In here</span>
            </p>
          </div>
        </div>
      )}

      {/* 3. AUTHENTICATED PORTAL (CLIENT DASHBOARD) */}
      {currentScreen === 'dashboard' && (
        <div className={`dashboard-layout ${isSeparatedMemberPortal ? 'member-portal-layout' : ''}`}>
          {/* Sidebar */}
          {!isSeparatedMemberPortal && <aside className="sidebar">
            <div className="sidebar-logo">
              <a href="#" className="logo" onClick={() => setCurrentScreen('landing')}>
                <LogoIcon />
                <span>SwiftTrack</span>
              </a>
            </div>

            <ul className="sidebar-menu">
              {user?.role !== 'ADMIN' && (
                <>
                  <li>
                    <div
                      className={`sidebar-item ${dashboardTab === 'overview' ? 'active' : ''}`}
                      onClick={() => setDashboardTab('overview')}
                    >
                      <DashboardIcon />
                      <span>Dashboard</span>
                    </div>
                  </li>
                  <li>
                    <div
                      className={`sidebar-item ${dashboardTab === 'create' ? 'active' : ''}`}
                      onClick={() => setDashboardTab('create')}
                    >
                      <PlusCircleIcon />
                      <span>Create Order</span>
                    </div>
                  </li>
                  <li>
                    <div
                      className={`sidebar-item ${dashboardTab === 'history' ? 'active' : ''}`}
                      onClick={() => setDashboardTab('history')}
                    >
                      <HistoryIcon />
                      <span>Order History</span>
                    </div>
                  </li>
                  <li>
                    <div
                      className={`sidebar-item ${dashboardTab === 'tracking' ? 'active' : ''}`}
                      onClick={() => setDashboardTab('tracking')}
                    >
                      <TrackingIcon />
                      <span>Live Tracking</span>
                    </div>
                  </li>
                </>
              )}

              {user?.role === 'ADMIN' && (
                <>
                  <li>
                    <div
                      className={`sidebar-item ${dashboardTab === 'system-overview' ? 'active' : ''}`}
                      onClick={() => setDashboardTab('system-overview')}
                    >
                      <DashboardIcon />
                      <span>System Overview</span>
                    </div>
                  </li>
                  <li>
                    <div
                      className={`sidebar-item ${dashboardTab === 'admin-users' ? 'active' : ''}`}
                      onClick={() => setDashboardTab('admin-users')}
                    >
                      <UserIcon />
                      <span>Users</span>
                    </div>
                  </li>
                  <li>
                    <div
                      className={`sidebar-item ${dashboardTab === 'admin-orders' ? 'active' : ''}`}
                      onClick={() => setDashboardTab('admin-orders')}
                    >
                      <HistoryIcon />
                      <span>Orders</span>
                    </div>
                  </li>
                  <li>
                    <div
                      className={`sidebar-item ${dashboardTab === 'drivers' ? 'active' : ''}`}
                      onClick={() => setDashboardTab('drivers')}
                    >
                      <DriversIcon />
                      <span>Drivers</span>
                    </div>
                  </li>
                  <li>
                    <div
                      className={`sidebar-item ${dashboardTab === 'vehicles' ? 'active' : ''}`}
                      onClick={() => setDashboardTab('vehicles')}
                    >
                      <TruckIcon />
                      <span>Vehicles</span>
                    </div>
                  </li>
                  <li>
                    <div
                      className={`sidebar-item ${dashboardTab === 'routes' ? 'active' : ''}`}
                      onClick={() => setDashboardTab('routes')}
                    >
                      <RouteOptimizationIcon />
                      <span>Route Optimization</span>
                    </div>
                  </li>
                  <li>
                    <div
                      className={`sidebar-item ${dashboardTab === 'warehouse' ? 'active' : ''}`}
                      onClick={() => setDashboardTab('warehouse')}
                    >
                      <ShieldCheckIcon />
                      <span>Warehouse Operations</span>
                    </div>
                  </li>
                </>
              )}
              <li>
                <div
                  className={`sidebar-item ${dashboardTab === 'notifications' ? 'active' : ''}`}
                  onClick={() => setDashboardTab('notifications')}
                >
                  <BellIcon />
                  <span>Notifications</span>
                  {unreadCount > 0 && <span className="sidebar-item-badge">{unreadCount}</span>}
                </div>
              </li>
              <li>
                <div 
                  className={`sidebar-item ${dashboardTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setDashboardTab('profile')}
                >
                  <UserIcon />
                  <span>Profile</span>
                </div>
              </li>
            </ul>

            <div className="sidebar-footer">
              <div className="sidebar-profile-card">
                <div className="sidebar-avatar">
                  {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                </div>
                <div className="sidebar-profile-info">
                  <span className="sidebar-profile-name">{user.name || 'User Name'}</span>
                  <span className="sidebar-profile-role">{user.company}</span>
                </div>
              </div>
              <div 
                className="sidebar-item" 
                style={{ color: '#ef4444' }}
                onClick={() => {
                  setCurrentScreen('landing');
                  setDashboardTab('overview');
                  setUser(null);
                  setOrders([]);
                  setActiveTrackingOrder(null);
                  setLoginEmail('');
                  setLoginPassword('');
                }}
              >
                <LogOutIcon />
                <span>Logout</span>
              </div>
            </div>
          </aside>}

          {/* Main Area */}
          <main className="main-content">
            
            {/* TAB 1: OVERVIEW DASHBOARD */}
            {dashboardTab === 'overview' && (
              <div>
                <header className="screen-header">
                  <div>
                    <h1 className="screen-title">Operations Control</h1>
                    <p className="screen-subtitle">Overview of your current shipping pipeline and node integration</p>
                  </div>
                  <div>
                    <button className="btn btn-primary" onClick={() => setDashboardTab('create')}>
                      <PlusCircleIcon /> New Delivery Order
                    </button>
                  </div>
                </header>

                {/* Welcome Card */}
                <div className="card welcome-banner">
                  <h2>Welcome back, {user.name}!</h2>
                  <p>All middleware nodes (WMS, CMS, ROS, and tracking services) are communicating normally. Your dispatch pipeline is fully optimized.</p>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                  <div className="card stat-card">
                    <div className="stat-info">
                      <h4>Total Booked</h4>
                      <p className="stat-val">{totalOrdersCount}</p>
                    </div>
                    <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                      <LogoIcon />
                    </div>
                  </div>
                  <div className="card stat-card">
                    <div className="stat-info">
                      <h4>Active Pipeline</h4>
                      <p className="stat-val">{pendingOrdersCount}</p>
                    </div>
                    <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--status-pending-bg)', color: 'var(--status-pending)' }}>
                      <HistoryIcon />
                    </div>
                  </div>
                  <div className="card stat-card">
                    <div className="stat-info">
                      <h4>Delivered</h4>
                      <p className="stat-val">{deliveredOrdersCount}</p>
                    </div>
                    <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--status-completed-bg)', color: 'var(--status-completed)' }}>
                      <TrackingIcon />
                    </div>
                  </div>
                  <div className="card stat-card">
                    <div className="stat-info">
                      <h4>Failed/Cancelled</h4>
                      <p className="stat-val">{failedOrdersCount}</p>
                    </div>
                    <div className="stat-icon-wrapper" style={{ backgroundColor: 'var(--status-failed-bg)', color: 'var(--status-failed)' }}>
                      <BellIcon />
                    </div>
                  </div>
                </div>

                {/* Chart & Quick Actions row */}
                <div className="overview-grid">
                  <div className="card">
                    <div className="chart-header">
                      <h3 className="chart-title">Weekly Dispatch Performance</h3>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Orders Processed</span>
                    </div>
                    {/* SVG/CSS Bar Chart */}
                    <div className="custom-chart">
                      <div className="chart-bar-container">
                        <span className="chart-bar-val">12</span>
                        <div className="chart-bar" style={{ height: '35%' }}></div>
                        <span className="chart-label">Mon</span>
                      </div>
                      <div className="chart-bar-container">
                        <span className="chart-bar-val">18</span>
                        <div className="chart-bar" style={{ height: '55%' }}></div>
                        <span className="chart-label">Tue</span>
                      </div>
                      <div className="chart-bar-container">
                        <span className="chart-bar-val">24</span>
                        <div className="chart-bar" style={{ height: '70%' }}></div>
                        <span className="chart-label">Wed</span>
                      </div>
                      <div className="chart-bar-container">
                        <span className="chart-bar-val">32</span>
                        <div className="chart-bar" style={{ height: '90%' }}></div>
                        <span className="chart-label">Thu</span>
                      </div>
                      <div className="chart-bar-container">
                        <span className="chart-bar-val">15</span>
                        <div className="chart-bar" style={{ height: '45%' }}></div>
                        <span className="chart-label">Fri</span>
                      </div>
                      <div className="chart-bar-container">
                        <span className="chart-bar-val">8</span>
                        <div className="chart-bar" style={{ height: '22%' }}></div>
                        <span className="chart-label">Sat</span>
                      </div>
                      <div className="chart-bar-container">
                        <span className="chart-bar-val">5</span>
                        <div className="chart-bar" style={{ height: '15%' }}></div>
                        <span className="chart-label">Sun</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick actions & activity */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="card" style={{ padding: '20px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Quick Actions</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setDashboardTab('create')}>
                          Book New Shipment
                        </button>
                        <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => {
                          if (orders.length > 0) {
                            setActiveTrackingOrder(orders[0]);
                          }
                          setDashboardTab('tracking');
                        }}>
                          Track Active Package
                        </button>
                      </div>
                    </div>

                    <div className="card" style={{ padding: '20px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Recent Integration Events</h3>
                      <div className="activity-list">
                        <div className="activity-item">
                          <div className="activity-dot" style={{ backgroundColor: 'var(--status-completed)' }}></div>
                          <div>
                            <p><strong>Route Generated</strong> for order ST-902148 by Route Heuristics.</p>
                            <span className="activity-time">10m ago</span>
                          </div>
                        </div>
                        <div className="activity-item">
                          <div className="activity-dot" style={{ backgroundColor: 'var(--primary)' }}></div>
                          <div>
                            <p><strong>Driver assigned</strong> to truck Volvo VNL (TRK-982).</p>
                            <span className="activity-time">1h ago</span>
                          </div>
                        </div>
                        <div className="activity-item">
                          <div className="activity-dot" style={{ backgroundColor: 'var(--status-pending)' }}></div>
                          <div>
                            <p><strong>Database sync</strong>: WMS inventory validated for Seattle hub.</p>
                            <span className="activity-time">Yesterday</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: CREATE ORDER */}
            {dashboardTab === 'create' && (
              <div>
                <header className="screen-header">
                  <div>
                    <h1 className="screen-title">Dispatch New Order</h1>
                    <p className="screen-subtitle">Publish a cargo request payload to SwiftTrack's middleware queues</p>
                  </div>
                </header>

                <div className="card form-card">
                  {orderSubmitError && <div className="error-message" style={{ margin: '0 0 20px 0' }}>⚠️ {orderSubmitError}</div>}
                  <form onSubmit={handleCreateOrderSubmit}>
                    <div className="order-form-grid">
                      <div className="order-form-group">
                        <label htmlFor="ord-pickup">Pickup Address *</label>
                        <input 
                          type="text" 
                          id="ord-pickup" 
                          className="order-input" 
                          placeholder="e.g. 100 Tech Blvd, Boston MA" 
                          value={pickupAddress}
                          onChange={(e) => setPickupAddress(e.target.value)}
                          required 
                        />
                      </div>
                      
                      <div className="order-form-group">
                        <label htmlFor="ord-rec-name">Receiver Name *</label>
                        <input 
                          type="text" 
                          id="ord-rec-name" 
                          className="order-input" 
                          placeholder="Receiver Name / Company" 
                          value={receiverName}
                          onChange={(e) => setReceiverName(e.target.value)}
                          required 
                        />
                      </div>

                      <div className="order-form-group">
                        <label htmlFor="ord-rec-phone">Receiver Phone *</label>
                        <input 
                          type="tel" 
                          id="ord-rec-phone" 
                          className="order-input" 
                          placeholder="e.g. 617-555-0123" 
                          value={receiverPhone}
                          onChange={(e) => setReceiverPhone(e.target.value)}
                          required 
                        />
                      </div>

                      <div className="order-form-group">
                        <label htmlFor="ord-delivery">Delivery Address *</label>
                        <input 
                          type="text" 
                          id="ord-delivery" 
                          className="order-input" 
                          placeholder="e.g. 500 Commerce Rd, New York NY" 
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          required 
                        />
                      </div>

                      <div className="order-form-group">
                        <label htmlFor="ord-pkg-type">Package Type</label>
                        <select 
                          id="ord-pkg-type" 
                          className="order-select" 
                          value={packageType}
                          onChange={(e) => setPackageType(e.target.value)}
                        >
                          <option value="Document">Document</option>
                          <option value="Parcel">Parcel</option>
                          <option value="Pallet">Pallet</option>
                          <option value="Freight">Heavy Freight</option>
                        </select>
                      </div>

                      <div className="order-form-group">
                        <label htmlFor="ord-weight">Weight (kg) *</label>
                        <input 
                          type="number" 
                          step="0.1"
                          id="ord-weight" 
                          className="order-input" 
                          placeholder="0.0" 
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          required 
                        />
                      </div>

                      <div className="order-form-group">
                        <label htmlFor="ord-priority">Priority</label>
                        <select 
                          id="ord-priority" 
                          className="order-select" 
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                        >
                          <option value="Standard">Standard Delivery</option>
                          <option value="Express">Express Cargo</option>
                          <option value="Overnight">Next-Day Overnight</option>
                        </select>
                      </div>

                      <div className="order-form-group form-group-full">
                        <label htmlFor="ord-notes">Delivery Notes</label>
                        <textarea 
                          id="ord-notes" 
                          className="order-textarea" 
                          placeholder="Special instructions for loading, warehousing or delivery safety..."
                          value={deliveryNotes}
                          onChange={(e) => setDeliveryNotes(e.target.value)}
                        ></textarea>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                      <button type="button" className="btn btn-secondary" onClick={() => setDashboardTab('overview')}>
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary" disabled={orderSubmitting}>
                        {orderSubmitting ? 'Submitting...' : 'Submit Order Payload'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Success Modal */}
                {showSuccessModal && (
                  <div className="modal-overlay">
                    <div className="success-modal">
                      <div className="success-icon-container">
                        <svg viewBox="0 0 24 24" width="32" height="32" stroke="currentColor" strokeWidth="3" fill="none">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <h3>Order Successfully Submitted</h3>
                      <p>Order ID <strong>{latestSubmittedId}</strong> has been registered. The Route Optimization System (ROS) is generating delivery nodes.</p>
                      <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => {
                        setShowSuccessModal(false);
                        setDashboardTab('history');
                      }}>
                        View in Order History
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ORDER HISTORY */}
            {dashboardTab === 'history' && (
              <div>
                <header className="screen-header">
                  <div>
                    <h1 className="screen-title">Order History</h1>
                    <p className="screen-subtitle">Search, filter, and track payloads stored in database nodes</p>
                  </div>
                </header>

                {/* Controls */}
                <div className="history-controls">
                  <div className="search-wrapper">
                    <span className="search-icon"><SearchIcon /></span>
                    <input 
                      type="text" 
                      className="search-input" 
                      placeholder="Search by Order ID, receiver name, or destination..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  <select 
                    className="filter-select" 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Warehouse">In Warehouse</option>
                    <option value="Route Generated">Route Generated</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Failed">Failed</option>
                  </select>

                  <select 
                    className="filter-select" 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="Newest">Sort: Newest First</option>
                    <option value="Oldest">Sort: Oldest First</option>
                    <option value="Weight">Sort: Weight</option>
                  </select>
                </div>

                {/* Table */}
                <div className="card table-card">
                  <div className="order-table-container">
                    <table className="order-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Date</th>
                          <th>Destination</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Assigned Driver</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedOrders.length === 0 ? (
                          <tr>
                            <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                              No orders found matching filters.
                            </td>
                          </tr>
                        ) : (
                          sortedOrders.map((ord) => (
                            <tr key={ord.id}>
                              <td 
                                className="order-id-cell"
                                onClick={() => {
                                  setActiveTrackingOrder(ord);
                                  setTrackingSearchTerm(ord.id);
                                  setDashboardTab('tracking');
                                }}
                              >
                                {ord.id}
                              </td>
                              <td>{ord.date}</td>
                              <td>
                                <div style={{ fontWeight: '500', color: 'var(--text-main)' }}>{ord.receiverName}</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{ord.deliveryAddress}</div>
                              </td>
                              <td>{ord.priority}</td>
                              <td>
                                <span className={`badge badge-${
                                  normalizeStatusKey(ord.status) === 'DELIVERED' ? 'completed' :
                                  ['FAILED', 'CANCELLED', 'CANCELED'].includes(normalizeStatusKey(ord.status)) ? 'failed' :
                                  ['PENDING', 'WAREHOUSE'].includes(normalizeStatusKey(ord.status)) ? 'pending' : 'transit'
                                }`}>
                                  {ord.status}
                                </span>
                              </td>
                              <td>{ord.driver}</td>
                              <td>
                                <button 
                                  className="btn btn-secondary" 
                                  style={{ padding: '6px 12px', fontSize: '12px' }}
                                  onClick={() => {
                                    setActiveTrackingOrder(ord);
                                    setTrackingSearchTerm(ord.id);
                                    setDashboardTab('tracking');
                                  }}
                                >
                                  Track Details
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* WAREHOUSE DASHBOARD */}
            {dashboardTab === 'warehouse' && (
              <div>
                <header className="screen-header">
                  <div>
                    <h1 className="screen-title">Warehouse Dashboard</h1>
                    <p className="screen-subtitle">Monitor stored packages, capacity, lifecycle activity, and WMS TCP availability</p>
                  </div>
                  <span className={`badge ${wmsStatusBadge}`}>
                    WMS TCP {wmsStatusValue}
                  </span>
                </header>

                <div className="warehouse-dashboard">
                  {warehouseLoading && <div className="card" style={{ marginBottom: '4px' }}>Loading warehouse dashboard...</div>}
                  {warehouseError && <div className="card" style={{ marginBottom: '4px', color: 'var(--status-failed)' }}>{warehouseError}</div>}

                  <div className="stats-grid cms-stats-grid">
                    {[
                      { label: 'Packages Received', value: warehouseStats.received ?? 0, tone: 'primary' },
                      { label: 'Packages Stored', value: warehouseStats.stored ?? 0, tone: 'pending' },
                      { label: 'Packages Loaded', value: warehouseStats.loaded ?? 0, tone: 'primary' },
                      { label: 'Packages Delivered', value: warehouseStats.delivered ?? 0, tone: 'completed' }
                    ].map((metric) => (
                      <div className="card stat-card cms-stat-card" key={metric.label}>
                        <div className="stat-info">
                          <h4>{metric.label}</h4>
                          <p className="stat-val">{metric.value}</p>
                        </div>
                        <div className={`stat-icon-wrapper cms-stat-tone ${metric.tone}`}>
                          <TruckIcon />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="warehouse-layout">
                    <div className="warehouse-main-column">
                      <div className="card cms-panel warehouse-package-panel">
                        <div className="cms-panel-header">
                          <div>
                            <h3>Current Packages</h3>
                            <p>Newest package state updates first</p>
                          </div>
                          <span className="badge badge-transit">{warehousePackages.length} records</span>
                        </div>

                        <div className="cms-retry-table-wrap">
                          <table className="cms-retry-table warehouse-table">
                            <thead>
                              <tr>
                                <th>Order Number</th>
                                <th>Package ID</th>
                                <th>Status</th>
                                <th>Current Location</th>
                                <th>Updated</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {warehousePackages.length === 0 ? (
                                <tr>
                                  <td colSpan="6" className="warehouse-empty-cell">
                                    No packages are stored in tracking yet.
                                  </td>
                                </tr>
                              ) : (
                                warehousePackages.map((pkg) => (
                                  <tr
                                    key={pkg.orderNumber}
                                    className={selectedWarehousePackage?.orderNumber === pkg.orderNumber ? 'warehouse-row selected' : 'warehouse-row'}
                                    onClick={() => setSelectedWarehousePackage(pkg)}
                                  >
                                    <td className="order-id-cell">{pkg.orderNumber}</td>
                                    <td>{pkg.packageId}</td>
                                    <td>
                                      <span className={`badge ${getWarehouseStatusBadge(pkg.status)}`}>
                                        {toWarehouseStatusLabel(pkg.status)}
                                      </span>
                                    </td>
                                    <td>{pkg.currentLocation || 'Not assigned'}</td>
                                    <td>{formatDateTime(pkg.updatedAt)}</td>
                                    <td>
                                      {pkg.status === 'WAREHOUSE' ? (
                                        <button
                                          type="button"
                                          className="btn btn-secondary warehouse-load-button"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            openWarehouseLoadPanel(pkg);
                                          }}
                                        >
                                          Mark as Loaded
                                        </button>
                                      ) : (
                                        <span className="warehouse-no-action">No action</span>
                                      )}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>

                        {warehouseLoadPackage && (
                          <div className="modal-overlay warehouse-load-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="warehouse-load-title">
                            <div className="warehouse-load-panel">
                              <div className="cms-panel-header compact">
                                <div>
                                  <h3 id="warehouse-load-title">Mark as Loaded</h3>
                                  <p>Confirm this warehouse package has been loaded onto a delivery vehicle.</p>
                                </div>
                              </div>

                              <div className="warehouse-load-summary">
                                <div>
                                  <span>Order Number</span>
                                  <strong>{warehouseLoadPackage.orderNumber}</strong>
                                </div>
                                <div>
                                  <span>Package ID</span>
                                  <strong>{warehouseLoadPackage.packageId}</strong>
                                </div>
                                <div>
                                  <span>Current Location</span>
                                  <strong>{warehouseLoadPackage.currentLocation || 'Not assigned'}</strong>
                                </div>
                              </div>

                              <div className="order-form-group">
                                <label htmlFor="warehouse-load-location">Vehicle / Loading Location</label>
                                <input
                                  id="warehouse-load-location"
                                  type="text"
                                  className="order-input"
                                  placeholder="Enter vehicle, bay, or loading location"
                                  value={warehouseLoadLocation}
                                  onChange={(event) => {
                                    setWarehouseLoadLocation(event.target.value);
                                    setWarehouseLoadError('');
                                  }}
                                  disabled={warehouseLoadSubmitting}
                                />
                              </div>

                              {warehouseLoadError && <div className="error-message">{warehouseLoadError}</div>}

                              <div className="warehouse-load-actions">
                                <button
                                  type="button"
                                  className="btn btn-secondary"
                                  onClick={closeWarehouseLoadPanel}
                                  disabled={warehouseLoadSubmitting}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-primary"
                                  onClick={handleWarehouseMarkLoaded}
                                  disabled={warehouseLoadSubmitting || !warehouseLoadLocation.trim()}
                                >
                                  {warehouseLoadSubmitting ? 'Marking Loaded...' : 'Confirm Loaded'}
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="card cms-panel">
                        <div className="cms-panel-header compact">
                          <div>
                            <h3>Tracking Timeline</h3>
                            <p>{selectedWarehousePackage ? selectedWarehousePackage.orderNumber : 'Select a package to inspect its real tracking history'}</p>
                          </div>
                        </div>

                        {selectedWarehouseTrackingLoading ? (
                          <div className="warehouse-empty-state">Loading tracking history...</div>
                        ) : selectedWarehouseTrackingError ? (
                          <div className="error-message">{selectedWarehouseTrackingError}</div>
                        ) : selectedWarehouseTrackingForPackage?.history?.length ? (
                          <div className="warehouse-timeline">
                            {selectedWarehouseTrackingForPackage.history.map((item) => (
                              <div className="warehouse-timeline-item" key={`${item.status}-${item.eventTime}`}>
                                <span className={`warehouse-timeline-dot ${item.status === 'FAILED' ? 'failed' : ''}`}></span>
                                <div>
                                  <div className="warehouse-timeline-title">{toWarehouseStatusLabel(item.status)}</div>
                                  <div className="warehouse-timeline-meta">{item.location || 'No location'} - {formatDateTime(item.eventTime)}</div>
                                  <p>{item.description || 'No description provided'}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="warehouse-empty-state">Select a package to view its tracking timeline.</div>
                        )}
                      </div>
                    </div>

                    <div className="warehouse-side-column">
                      <div className="card cms-status-card">
                        <div className="cms-preview-label">Storage Capacity</div>
                        <div className="warehouse-capacity-value">
                          {warehouseCapacity.used ?? 0} / {warehouseCapacity.total ?? 0}
                        </div>
                        <div className="warehouse-capacity-bar">
                          <div
                            className="warehouse-capacity-fill"
                            style={{ width: `${Math.min(100, Math.max(0, warehouseCapacity.percentage ?? 0))}%` }}
                          ></div>
                        </div>
                        <p>{warehouseAvailableCapacity} slots available. Capacity is based on packages currently in Warehouse status.</p>
                      </div>

                      <div className="card cms-status-card">
                        <div className="cms-preview-label">WMS TCP Availability</div>
                        <div className="cms-status-indicator">
                          <span className={`cms-status-dot ${wmsStatusValue === 'ONLINE' ? 'connected' : 'disconnected'}`}></span>
                          <strong>{wmsStatusValue}</strong>
                        </div>
                        <p>This reflects the last on-demand TCP request/response with the WMS endpoint, not a permanently open socket.</p>
                        <div className="warehouse-status-details">
                          <span>Endpoint</span>
                          <strong>{wmsStatus?.host || 'unknown'}:{wmsStatus?.port || 'unknown'}</strong>
                          <span>Last success</span>
                          <strong>{formatDateTime(wmsStatus?.lastSuccessfulAt)}</strong>
                          <span>Last failure</span>
                          <strong>{formatDateTime(wmsStatus?.lastFailureAt)}</strong>
                          {wmsStatus?.lastError && (
                            <>
                              <span>Error</span>
                              <strong>{wmsStatus.lastError}</strong>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="card cms-events-card">
                        <div className="cms-preview-label">Recent Activity</div>
                        <div className="cms-event-log">
                          {warehouseRecentActivity.length === 0 ? (
                            <div className="warehouse-empty-state">No tracking activity yet.</div>
                          ) : (
                            warehouseRecentActivity.map((entry) => (
                              <div className="cms-event-row warehouse-activity-row" key={`${entry.orderNumber}-${entry.eventTime}`}>
                                <span className={`badge ${getWarehouseStatusBadge(entry.status)}`}>{toWarehouseStatusLabel(entry.status)}</span>
                                <span className="cms-event-name">
                                  <strong>{entry.packageId}</strong> for {entry.orderNumber}: {entry.description || 'Tracking updated'}
                                  <small>{formatDateTime(entry.eventTime)}</small>
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DRIVER PORTAL */}
            {dashboardTab === 'driver' && (
              <div>
                {!authenticatedDriver ? (
                  <div className="driver-login-shell">
                    <div className="card driver-login-card">
                      <div className="driver-login-icon">
                        <TruckIcon />
                      </div>
                      <h1>Driver Login</h1>
                      <p>This prototype verifies access inside the authenticated SwiftTrack session.</p>
                      {driverLoginError && <div className="error-message">{driverLoginError}</div>}
                      <form onSubmit={handleDriverLoginSubmit} className="driver-login-form">
                        <div className="order-form-group">
                          <label htmlFor="driver-id">Driver ID</label>
                          <input
                            id="driver-id"
                            type="text"
                            className="order-input"
                            placeholder="e.g. DRV-102"
                            value={driverLoginId}
                            onChange={(e) => setDriverLoginId(e.target.value)}
                          />
                        </div>
                        <div className="order-form-group">
                          <label htmlFor="driver-password">Password</label>
                          <input
                            id="driver-password"
                            type="password"
                            className="order-input"
                            placeholder="Password"
                            value={driverPassword}
                            onChange={(e) => setDriverPassword(e.target.value)}
                          />
                        </div>
                        <button type="submit" className="btn btn-primary driver-wide-button">
                          Sign In
                        </button>
                      </form>
                    </div>
                  </div>
                ) : selectedDelivery ? (
                  <div className="driver-app-shell">
                    <aside className="driver-app-sidebar" aria-label="Driver navigation">
                      <div className="driver-app-brand">
                        <LogoIcon />
                        <div>
                          <strong>SwiftTrack</strong>
                          <span>Driver App</span>
                        </div>
                      </div>
                      <nav className="driver-app-nav">
                        {[
                          ['dashboard', 'Dashboard', <DashboardIcon />],
                          ['deliveries', 'My Deliveries', <LogoIcon />],
                          ['route', 'My Route', <RouteIcon />],
                          ['history', 'Delivery History', <HistoryIcon />],
                          ['notifications', unreadCount > 0 ? `Notifications (${unreadCount})` : 'Notifications', <BellIcon />],
                          ['profile', 'Profile', <UserIcon />]
                        ].map(([view, label, icon]) => (
                          <button
                            type="button"
                            key={view}
                            className={`driver-app-nav-item ${driverView === view ? 'active' : ''}`}
                            onClick={() => {
                              clearPodState();
                              clearFailureState();
                              setSelectedDelivery(null);
                              setDriverView(view);
                            }}
                          >
                            {icon}
                            <span>{label}</span>
                          </button>
                        ))}
                      </nav>
                      <div className="driver-vehicle-card">
                        <TruckIcon />
                        <strong>{currentVehicle.vehiclePlate || currentVehicle.vehicleId || 'Vehicle not assigned'}</strong>
                        <span>{currentVehicle.vehicleId || 'Not available'}</span>
                        <div className="driver-online-pill"><span></span> Online</div>
                      </div>
                      <button type="button" className="driver-app-logout" onClick={handleDriverLogout}>
                        <LogOutIcon />
                        <span>Logout</span>
                      </button>
                    </aside>

                    <section className="driver-app-main driver-detail-main">
                  <div className="driver-portal">
                    <header className="driver-header">
                      <div>
                        <button className="btn btn-secondary driver-back-button" onClick={() => {
                          clearPodState();
                          clearFailureState();
                          setSelectedDelivery(null);
                        }}>
                          Back to Manifest
                        </button>
                        <h1>Delivery Details</h1>
                        <p>{selectedDelivery.packageId} for order {selectedDelivery.orderNumber}</p>
                      </div>
                      <button className="btn btn-secondary" onClick={handleDriverLogout}>
                        Driver Logout
                      </button>
                    </header>

                    {selectedDeliveryLoading && <div className="card">Loading delivery details...</div>}
                    {selectedDeliveryError && <div className="card" style={{ color: 'var(--status-failed)' }}>{selectedDeliveryError}</div>}

                    <div className="driver-detail-grid">
                      <div className="card driver-detail-card">
                        <div className="driver-detail-title-row">
                          <div>
                            <span className="cms-preview-label">Current Delivery</span>
                            <h2>{selectedDelivery.packageId}</h2>
                          </div>
                          <span className={`badge ${getWarehouseStatusBadge(selectedDeliveryTracking?.status || selectedDelivery.status)}`}>
                            {toWarehouseStatusLabel(selectedDeliveryTracking?.status || selectedDelivery.status)}
                          </span>
                        </div>

                        <div className={`driver-progress-bar ${(selectedDeliveryTracking?.status || selectedDelivery.status) === 'FAILED' ? 'failed' : ''}`}>
                          <div style={{ width: `${deliveryProgress}%` }}></div>
                        </div>
                        <div className="driver-progress-label">{deliveryProgress}% progress</div>

                        <div className="driver-info-grid">
                          <div>
                            <span>Order Number</span>
                            <strong>{selectedDelivery.orderNumber}</strong>
                          </div>
                          <div>
                            <span>Current Location</span>
                            <strong>{selectedDeliveryTracking?.currentLocation || selectedDelivery.currentLocation || 'Not available'}</strong>
                          </div>
                          <div>
                            <span>Customer</span>
                            <strong>{selectedOrderInfo.receiverName || 'Not available'}</strong>
                          </div>
                          <div>
                            <span>Phone</span>
                            <strong>{selectedOrderInfo.receiverPhone || 'Not available'}</strong>
                          </div>
                          <div>
                            <span>Delivery Address</span>
                            <strong>{selectedOrderInfo.recipientAddress || selectedOrderInfo.deliveryAddress || 'Not available'}</strong>
                          </div>
                          <div>
                            <span>Sender Address</span>
                            <strong>{selectedOrderInfo.senderAddress || selectedOrderInfo.pickupAddress || 'Not available'}</strong>
                          </div>
                          <div className="driver-info-wide">
                            <span>Delivery Notes</span>
                            <strong>{selectedOrderInfo.deliveryNotes || selectedOrderInfo.notes || selectedOrderInfo.description || 'Not available'}</strong>
                          </div>
                        </div>

                        <div className="driver-action-row">
                          {selectedOrderInfo.receiverPhone ? (
                            <a className="btn btn-primary" href={`tel:${selectedOrderInfo.receiverPhone}`}>Call Customer</a>
                          ) : (
                            <button className="btn btn-primary" disabled>Call Customer</button>
                          )}
                          {currentDeliveryStatus === 'LOADED' && (
                            <button className="btn btn-primary" onClick={handleStartDelivery} disabled={Boolean(deliveryActionLoading)}>
                              {deliveryActionLoading === 'start' ? 'Starting...' : 'Start Delivery'}
                            </button>
                          )}
                          {currentDeliveryStatus === 'OUT_FOR_DELIVERY' && (
                            <>
                              <button
                                className="btn btn-secondary"
                                onClick={() => {
                                  setPodOpen(true);
                                  setFailureOpen(false);
                                  setDeliveryActionError('');
                                }}
                                disabled={Boolean(deliveryActionLoading)}
                              >
                                Mark Delivered
                              </button>
                              <button
                                className="btn btn-secondary"
                                onClick={() => {
                                  setFailureOpen(true);
                                  setPodOpen(false);
                                  setDeliveryActionError('');
                                }}
                                disabled={Boolean(deliveryActionLoading)}
                              >
                                Mark Failed
                              </button>
                            </>
                          )}
                        </div>
                        {currentDeliveryStatus === 'LOADED' && (
                          <p className="driver-disabled-note">Delivery must be started before final delivery actions are available.</p>
                        )}
                        {currentDeliveryStatus === 'OUT_FOR_DELIVERY' && (
                          <p className="driver-disabled-note">Proof of Delivery required for successful delivery.</p>
                        )}
                        {currentDeliveryStatus === 'DELIVERED' && (
                          <div className="driver-terminal-state completed">Delivery completed successfully.</div>
                        )}
                        {currentDeliveryStatus === 'FAILED' && (
                          <div className="driver-terminal-state failed">Delivery marked as failed.</div>
                        )}
                        {deliveryActionError && <div className="error-message driver-action-error">{deliveryActionError}</div>}

                        {podOpen && (
                          <div className="driver-action-panel">
                            <div className="cms-panel-header compact">
                              <div>
                                <h3>Proof of Delivery</h3>
                                <p>{selectedDelivery.packageId} for {selectedDelivery.orderNumber}</p>
                              </div>
                            </div>
                            <div className="driver-pod-grid">
                              <div className="order-form-group">
                                <label htmlFor="pod-photo">Delivery Photo</label>
                                <input
                                  id="pod-photo"
                                  type="file"
                                  className="order-input"
                                  accept="image/*"
                                  capture="environment"
                                  onChange={handlePodPhotoChange}
                                  disabled={Boolean(deliveryActionLoading)}
                                />
                                {podPhotoPreviewUrl ? (
                                  <img className="driver-photo-preview" src={podPhotoPreviewUrl} alt="Selected delivery proof preview" />
                                ) : (
                                  <div className="driver-photo-empty">No delivery photo selected</div>
                                )}
                              </div>
                              <div className="order-form-group">
                                <label>Customer Signature</label>
                                {/* Frontend POD capture for the Member 4 prototype; persistent POD storage belongs to the POD/delivery backend owner. */}
                                <canvas
                                  ref={signatureCanvasRef}
                                  className="driver-signature-canvas"
                                  width="520"
                                  height="180"
                                  onPointerDown={handleSignaturePointerDown}
                                  onPointerMove={handleSignaturePointerMove}
                                  onPointerUp={handleSignaturePointerUp}
                                  onPointerLeave={handleSignaturePointerUp}
                                ></canvas>
                                <button type="button" className="btn btn-secondary driver-wide-button" onClick={clearSignature} disabled={Boolean(deliveryActionLoading)}>
                                  Clear Signature
                                </button>
                              </div>
                            </div>
                            <div className="order-form-group">
                              <label htmlFor="pod-note">Delivery Note</label>
                              <textarea
                                id="pod-note"
                                className="order-textarea"
                                placeholder="Optional recipient or handoff note"
                                value={podNote}
                                onChange={(e) => setPodNote(e.target.value)}
                                disabled={Boolean(deliveryActionLoading)}
                              ></textarea>
                            </div>
                            {podValidationError && <div className="error-message">{podValidationError}</div>}
                            <div className="driver-action-row">
                              <button type="button" className="btn btn-secondary" onClick={clearPodState} disabled={Boolean(deliveryActionLoading)}>
                                Cancel
                              </button>
                              <button type="button" className="btn btn-primary" onClick={handleConfirmDelivery} disabled={!canConfirmPod}>
                                {deliveryActionLoading === 'delivered' ? 'Confirming...' : 'Confirm Delivery'}
                              </button>
                            </div>
                          </div>
                        )}

                        {failureOpen && (
                          <div className="driver-action-panel">
                            <div className="cms-panel-header compact">
                              <div>
                                <h3>Failed Delivery</h3>
                                <p>Record the real reason for this delivery attempt</p>
                              </div>
                            </div>
                            <div className="order-form-group">
                              <label htmlFor="failure-reason">Failure Reason</label>
                              <select
                                id="failure-reason"
                                className="order-select"
                                value={failureReason}
                                onChange={(e) => {
                                  setFailureReason(e.target.value);
                                  setFailureValidationError('');
                                }}
                                disabled={Boolean(deliveryActionLoading)}
                              >
                                <option value="">Select reason</option>
                                <option value="Customer unavailable">Customer unavailable</option>
                                <option value="Incorrect address">Incorrect address</option>
                                <option value="Customer refused package">Customer refused package</option>
                                <option value="Unable to contact customer">Unable to contact customer</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            <div className="order-form-group">
                              <label htmlFor="failure-note">Additional Notes</label>
                              <textarea
                                id="failure-note"
                                className="order-textarea"
                                placeholder="Optional context for dispatch"
                                value={failureNote}
                                onChange={(e) => setFailureNote(e.target.value)}
                                disabled={Boolean(deliveryActionLoading)}
                              ></textarea>
                            </div>
                            {failureValidationError && <div className="error-message">{failureValidationError}</div>}
                            <div className="driver-action-row">
                              <button type="button" className="btn btn-secondary" onClick={clearFailureState} disabled={Boolean(deliveryActionLoading)}>
                                Cancel
                              </button>
                              <button type="button" className="btn btn-primary" onClick={handleConfirmFailure} disabled={!canConfirmFailure}>
                                {deliveryActionLoading === 'failed' ? 'Confirming...' : 'Confirm Failure'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="driver-side-stack">
                        <div className="card driver-map-card">
                          <div className="cms-preview-label">Route Preview</div>
                          {driverPreviewRoutes.length > 0 ? (
                            <RouteOptimizationMap routes={driverPreviewRoutes} />
                          ) : (
                            <RouteMapVisual
                              pickupAddress={driverPreviewPickup}
                              deliveryAddress={mapAddress}
                            />
                          )}

                          {selectedDeliveryRoute ? (
                            <div className="driver-route-summary">
                              <div className="driver-route-summary-row">
                                <span>Distance</span>
                                <strong>{selectedDeliveryRoute.distanceKm} km</strong>
                              </div>
                              <div className="driver-route-summary-row">
                                <span>Est. Duration</span>
                                <strong>{selectedDeliveryRoute.durationMinutes} min</strong>
                              </div>
                              <div className="driver-route-summary-row">
                                <span>Traffic</span>
                                <span className={`badge ${
                                  selectedDeliveryRoute.trafficLevel === 'LOW' ? 'badge-completed' :
                                  selectedDeliveryRoute.trafficLevel === 'HIGH' ? 'badge-failed' : 'badge-pending'
                                }`}>{selectedDeliveryRoute.trafficLevel}</span>
                              </div>
                              <div className="driver-route-summary-row">
                                <span>Vehicle</span>
                                <strong>{selectedDeliveryRoute.vehiclePlate || 'Not assigned'}{selectedDeliveryRoute.vehicleType ? ` (${selectedDeliveryRoute.vehicleType})` : ''}</strong>
                              </div>
                            </div>
                          ) : (
                            <p className="driver-disabled-note" style={{ margin: '4px 0 14px' }}>
                              Optimized route details aren't available for this order right now.
                            </p>
                          )}

                          {mapsHref ? (
                            <a href={mapsHref} target="_blank" rel="noreferrer" className="btn btn-secondary driver-wide-button">
                              Open in Maps
                            </a>
                          ) : (
                            <button className="btn btn-secondary driver-wide-button" disabled>Open in Maps</button>
                          )}
                        </div>

                        <div className="card driver-history-card">
                          <div className="cms-preview-label">Tracking History</div>
                          {selectedDeliveryTracking?.history?.length ? (
                            <div className="warehouse-timeline">
                              {selectedDeliveryTracking.history.map((item) => (
                                <div className="warehouse-timeline-item" key={`${item.status}-${item.eventTime}`}>
                                  <span className={`warehouse-timeline-dot ${item.status === 'FAILED' ? 'failed' : ''}`}></span>
                                  <div>
                                    <div className="warehouse-timeline-title">{toWarehouseStatusLabel(item.status)}</div>
                                    <div className="warehouse-timeline-meta">{item.location || 'No location'} - {formatDateTime(item.eventTime)}</div>
                                    <p>{item.description || 'No description provided'}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="warehouse-empty-state">No tracking history available.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                    </section>
                  </div>
                ) : (
                  <div className="driver-app-shell">
                    <aside className="driver-app-sidebar" aria-label="Driver navigation">
                      <div className="driver-app-brand">
                        <LogoIcon />
                        <div>
                          <strong>SwiftTrack</strong>
                          <span>Driver App</span>
                        </div>
                      </div>
                      <nav className="driver-app-nav">
                        {[
                          ['dashboard', 'Dashboard', <DashboardIcon />],
                          ['deliveries', 'My Deliveries', <LogoIcon />],
                          ['route', 'My Route', <RouteIcon />],
                          ['history', 'Delivery History', <HistoryIcon />],
                          ['notifications', unreadCount > 0 ? `Notifications (${unreadCount})` : 'Notifications', <BellIcon />],
                          ['profile', 'Profile', <UserIcon />]
                        ].map(([view, label, icon]) => (
                          <button
                            type="button"
                            key={view}
                            className={`driver-app-nav-item ${driverView === view ? 'active' : ''}`}
                            onClick={() => setDriverView(view)}
                          >
                            {icon}
                            <span>{label}</span>
                          </button>
                        ))}
                      </nav>
                      <div className="driver-vehicle-card">
                        <TruckIcon />
                        <strong>{currentVehicle.vehiclePlate || currentVehicle.vehicleId || 'Vehicle not assigned'}</strong>
                        <span>{currentVehicle.vehicleId || 'Not available'}</span>
                        <div className="driver-online-pill"><span></span> Online</div>
                      </div>
                      <button type="button" className="driver-app-logout" onClick={handleDriverLogout}>
                        <LogOutIcon />
                        <span>Logout</span>
                      </button>
                    </aside>

                    <section className="driver-app-main">
                      <header className="driver-app-header">
                        <div>
                          <h1>Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {activeDriverName || authenticatedDriverId}</h1>
                          <p>{authenticatedDriverId} · {new Date().toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                        </div>
                        <div className="driver-avatar-card">
                          <div className="driver-avatar">{(activeDriverName || authenticatedDriverId || 'D').slice(0, 2).toUpperCase()}</div>
                          <div>
                            <strong>{activeDriverName || authenticatedDriverId}</strong>
                            <span>Driver ID: {authenticatedDriverId}</span>
                          </div>
                        </div>
                      </header>

                      {driverLoading && <div className="card">Loading driver manifest...</div>}
                      {driverError && <div className="card" style={{ color: 'var(--status-failed)' }}>{driverError}</div>}

                      {driverView === 'dashboard' && (
                        <>
                          <div className="driver-kpi-grid">
                            {[
                              ['Total Deliveries', driverStats.todaysDeliveries, 'blue', <LogoIcon />],
                              ['Completed', driverStats.completed, 'green', <TrackingIcon />],
                              ['Remaining', driverStats.remaining, 'amber', <HistoryIcon />],
                              ['Failed', driverStats.failed, 'red', <BellIcon />]
                            ].map(([label, value, tone, icon]) => (
                              <div className={`driver-kpi-card ${tone}`} key={label}>
                                <div>{icon}</div>
                                <span>{label}</span>
                                <strong>{value}</strong>
                                <small>Today</small>
                              </div>
                            ))}
                          </div>

                          <div className="driver-dashboard-grid">
                            <div className="card driver-route-card">
                              <div className="driver-card-title">
                                <div>
                                  <h3>Today's Route ({routeId})</h3>
                                  <span className={`badge ${driverStats.remaining ? 'badge-transit' : 'badge-completed'}`}>{driverStats.remaining ? 'Active' : 'Completed'}</span>
                                </div>
                                <button type="button" className="btn btn-secondary" onClick={() => setDriverView('route')}>View Full Route</button>
                              </div>
                              {sortedDriverPackages.length > 0 ? (
                                <RouteOptimizationMap routes={[{
                                  routeId,
                                  driverName: activeDriverName || authenticatedDriverId,
                                  hubAddress: 'SwiftLogistics Hub',
                                  stops: sortedDriverPackages.map((pkg, index) => ({
                                    sequence: pkg.stopSequence || index + 1,
                                    orderNumber: pkg.orderNumber,
                                    receiverName: driverOrderDetails[pkg.orderNumber]?.receiverName,
                                    deliveryAddress: driverOrderDetails[pkg.orderNumber]?.recipientAddress || driverOrderDetails[pkg.orderNumber]?.deliveryAddress || pkg.currentLocation || 'Address not available'
                                  }))
                                }]} />
                              ) : (
                                <div className="driver-empty-state">No loaded deliveries for today. Assigned packages may still be waiting in the warehouse.</div>
                              )}
                              <div className="driver-route-progress">
                                <span>Delivery Progress</span>
                                <div><i style={{ width: `${routeProgress}%` }}></i></div>
                                <strong>{deliveredTodayCount} of {driverPackages.length} completed</strong>
                              </div>
                            </div>

                            <div className="card driver-next-card">
                              <div className="driver-card-title">
                                <h3>Next Delivery</h3>
                                {nextDelivery && <span className="badge badge-transit">Stop {nextDelivery.stopSequence || sortedDriverPackages.indexOf(nextDelivery) + 1} of {driverPackages.length}</span>}
                              </div>
                              {nextDelivery ? (
                                <>
                                  <span className="driver-label">Order ID</span>
                                  <strong>{nextDelivery.orderNumber}</strong>
                                  <span className="driver-label">Customer</span>
                                  <strong>{nextDeliveryInfo.receiverName || 'Not available'}</strong>
                                  <span className="driver-label">Address</span>
                                  <p>{nextDeliveryInfo.recipientAddress || nextDeliveryInfo.deliveryAddress || 'Not available'}</p>
                                  <span className="driver-label">Phone</span>
                                  <p>{nextDeliveryInfo.receiverPhone || 'Not available'}</p>
                                  <span className="driver-label">Est. arrival</span>
                                  <p>{nextDelivery.durationMinutes ? `${nextDelivery.durationMinutes} min` : 'Not available'}</p>
                                  <div className="driver-next-actions">
                                    <a className="btn btn-primary" href={nextDeliveryInfo.recipientAddress ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nextDeliveryInfo.recipientAddress)}` : '#'} target="_blank" rel="noreferrer">Navigate</a>
                                    {nextDeliveryInfo.receiverPhone ? <a className="btn btn-secondary" href={`tel:${nextDeliveryInfo.receiverPhone}`}>Call Customer</a> : <button className="btn btn-secondary" disabled>Call Customer</button>}
                                    <button type="button" className="btn btn-secondary" onClick={() => { clearPodState(); clearFailureState(); setSelectedDelivery(nextDelivery); }}>Open Actions</button>
                                  </div>
                                </>
                              ) : (
                                <div className="driver-empty-state">No actionable delivery. Warehouse-loaded packages will appear here.</div>
                              )}
                            </div>
                          </div>

                          <div className="driver-dashboard-grid bottom">
                            <div className="card driver-table-card">
                              <div className="driver-card-title">
                                <h3>Today's Deliveries</h3>
                                <button type="button" className="btn btn-secondary" onClick={() => setDriverView('deliveries')}>View All</button>
                              </div>
                              <div className="driver-table-wrap">
                                <table className="driver-table">
                                  <thead><tr><th>Stop</th><th>Order ID</th><th>Customer</th><th>Address</th><th>Status</th><th>ETA</th><th></th></tr></thead>
                                  <tbody>
                                    {sortedDriverPackages.map((pkg, index) => {
                                      const info = driverOrderDetails[pkg.orderNumber] || {};
                                      return (
                                        <tr key={pkg.orderNumber}>
                                          <td>{pkg.stopSequence || index + 1}</td>
                                          <td>{pkg.orderNumber}</td>
                                          <td>{info.receiverName || 'Not available'}</td>
                                          <td>{info.recipientAddress || info.deliveryAddress || 'Not available'}</td>
                                          <td><span className={`badge ${getWarehouseStatusBadge(pkg.status)}`}>{pkg.status === 'LOADED' ? 'Pending' : pkg.status === 'OUT_FOR_DELIVERY' ? 'In Progress' : pkg.status === 'DELIVERED' ? 'Completed' : 'Failed'}</span></td>
                                          <td>{pkg.durationMinutes ? `${pkg.durationMinutes} min` : 'N/A'}</td>
                                          <td><button type="button" className="btn btn-secondary" onClick={() => { clearPodState(); clearFailureState(); setSelectedDelivery(pkg); }}>Open</button></td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                                {sortedDriverPackages.length === 0 && <div className="driver-empty-state">No deliveries are loaded for you today.</div>}
                              </div>
                            </div>

                            <div className="card driver-activity-card">
                              <div className="driver-card-title"><h3>Recent Activity</h3></div>
                              {recentDriverActivity.length ? recentDriverActivity.map((pkg) => (
                                <div className="driver-activity-row" key={`${pkg.orderNumber}-${pkg.status}`}>
                                  <span className={`badge ${getWarehouseStatusBadge(pkg.status)}`}>{toWarehouseStatusLabel(pkg.status)}</span>
                                  <div>
                                    <strong>{pkg.orderNumber}</strong>
                                    <p>{pkg.currentLocation || 'Location not available'} · {formatDateTime(pkg.updatedAt)}</p>
                                  </div>
                                </div>
                              )) : <div className="driver-empty-state">No activity yet.</div>}
                            </div>
                          </div>
                        </>
                      )}

                      {driverView === 'deliveries' && (
                        <div className="card driver-table-card">
                          <div className="driver-card-title"><h3>My Deliveries</h3></div>
                          <div className="driver-manifest-list">
                            {sortedDriverPackages.map((pkg) => (
                              <div className="driver-package-card" key={pkg.orderNumber}>
                                <div>
                                  <div className="driver-package-id">{pkg.packageId}</div>
                                  <div className="driver-package-meta">{pkg.orderNumber}</div>
                                  <div className="driver-package-meta">{driverOrderDetails[pkg.orderNumber]?.recipientAddress || pkg.currentLocation || 'Current location not available'}</div>
                                </div>
                                <div className="driver-package-actions">
                                  <span className={`badge ${getWarehouseStatusBadge(pkg.status)}`}>{toWarehouseStatusLabel(pkg.status)}</span>
                                  <button className="btn btn-primary" onClick={() => setSelectedDelivery(pkg)}>View Delivery</button>
                                </div>
                              </div>
                            ))}
                            {sortedDriverPackages.length === 0 && <div className="driver-empty-state">Assigned packages will appear after Warehouse marks them loaded.</div>}
                          </div>
                        </div>
                      )}

                      {driverView === 'route' && (
                        <div className="card driver-route-card expanded">
                          <div className="driver-card-title"><h3>My Route ({routeId})</h3></div>
                          {sortedDriverPackages.length > 0 ? <RouteOptimizationMap routes={[{ routeId, driverName: activeDriverName || authenticatedDriverId, hubAddress: 'SwiftLogistics Hub', stops: sortedDriverPackages.map((pkg, index) => ({ sequence: pkg.stopSequence || index + 1, orderNumber: pkg.orderNumber, receiverName: driverOrderDetails[pkg.orderNumber]?.receiverName, deliveryAddress: driverOrderDetails[pkg.orderNumber]?.recipientAddress || pkg.currentLocation || 'Address not available' })) }]} /> : <div className="driver-empty-state">No route is available yet.</div>}
                        </div>
                      )}

                      {driverView === 'notifications' && (
                        <div className="card driver-table-card">
                          <div className="driver-card-title">
                            <h3>Notifications</h3>
                            {notifications.some((n) => n.unread) && (
                              <button type="button" className="btn btn-secondary" onClick={markAllNotificationsRead}>
                                Mark all as read
                              </button>
                            )}
                          </div>
                          {notifications.length === 0 ? (
                            <div className="driver-empty-state">No notifications yet.</div>
                          ) : (
                            notifications.map((notif) => (
                              <div
                                className="driver-activity-row"
                                key={notif.id}
                                onClick={() => markNotificationRead(notif.id)}
                                style={{ cursor: notif.unread ? 'pointer' : 'default', opacity: notif.unread ? 1 : 0.6 }}
                              >
                                <span className={`badge ${notif.unread ? 'badge-transit' : 'badge-completed'}`}>
                                  {notif.unread ? 'New' : 'Read'}
                                </span>
                                <div>
                                  <strong>{notif.title}</strong>
                                  <p>{notif.desc}</p>
                                  <p>{notif.time}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}

                      {driverView === 'history' && (
                        <div className="card driver-table-card">
                          <div className="driver-card-title"><h3>Delivery History</h3></div>
                          {driverHistoryLoading && <div className="driver-empty-state">Loading history...</div>}
                          {driverHistoryError && <div className="error-message">{driverHistoryError}</div>}
                          {driverHistory.map((pkg) => (
                            <div className="driver-activity-row" key={pkg.orderNumber}>
                              <span className={`badge ${getWarehouseStatusBadge(pkg.status)}`}>{toWarehouseStatusLabel(pkg.status)}</span>
                              <div><strong>{pkg.orderNumber}</strong><p>{formatDateTime(pkg.updatedAt)}</p></div>
                            </div>
                          ))}
                          {!driverHistoryLoading && driverHistory.length === 0 && <div className="driver-empty-state">No completed or failed deliveries yet.</div>}
                        </div>
                      )}

                      {driverView === 'profile' && (
                        <div className="card driver-profile-panel">
                          <div className="driver-card-title"><h3>Profile</h3></div>
                          <div className="driver-info-grid">
                            <div><span>Driver ID</span><strong>{authenticatedDriverId}</strong></div>
                            <div><span>Name</span><strong>{activeDriverName || 'Not available'}</strong></div>
                            <div><span>Role</span><strong>{user.role}</strong></div>
                            <div><span>Vehicle</span><strong>{currentVehicle.vehiclePlate || currentVehicle.vehicleId || 'Not available'}</strong></div>
                          </div>
                        </div>
                      )}
                    </section>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: LIVE ORDER TRACKING */}
            {dashboardTab === 'tracking' && (
              <div>
                <header className="screen-header">
                  <div>
                    <h1 className="screen-title">Shipment Tracking</h1>
                    <p className="screen-subtitle">Search by order number and follow real package status from the Tracking Service</p>
                  </div>
                  {clientTracking && (
                    <button className="btn btn-secondary" onClick={resetClientTracking}>
                      Track Another Shipment
                    </button>
                  )}
                </header>

                <div className="card client-tracking-search-card">
                  <form onSubmit={handleTrackSubmit} className="client-tracking-search-form">
                    <input
                      type="text"
                      className="order-input"
                      placeholder="Enter order number, e.g. SL-12345678"
                      value={trackingSearchTerm}
                      onChange={(e) => setTrackingSearchTerm(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary" disabled={clientTrackingLoading}>
                      {clientTrackingLoading ? 'Searching...' : 'Track Shipment'}
                    </button>
                  </form>
                </div>

                {clientTrackingLoading && (
                  <div className="card client-tracking-state">Loading tracking information...</div>
                )}
                {clientTrackingError && (
                  <div className="card client-tracking-state error">{clientTrackingError}</div>
                )}

                {!clientTracking && !clientTrackingLoading && !clientTrackingError && (
                  <div className="card client-tracking-empty">
                    <TrackingIcon />
                    <h3>Track a shipment</h3>
                    <p>Enter an order number to load its current package status and real tracking history.</p>
                  </div>
                )}

                {clientTracking && (
                  <div className="client-tracking-dashboard">
                    <div className={`card client-tracking-hero ${clientTrackingStatus === 'FAILED' ? 'failed' : ''}`}>
                      <div className="client-tracking-hero-main">
                        <div>
                          <span className="cms-preview-label">Current Package</span>
                          <h2>{clientTracking.packageId}</h2>
                          <p>{clientTracking.orderNumber}</p>
                        </div>
                        <span className={`badge ${getWarehouseStatusBadge(clientTrackingStatus)}`}>
                          {toWarehouseStatusLabel(clientTrackingStatus)}
                        </span>
                      </div>
                      <div className={`client-progress-bar ${clientTrackingStatus === 'FAILED' ? 'failed' : ''}`}>
                        <div style={{ width: `${clientTrackingProgress}%` }}></div>
                      </div>
                      <div className="client-progress-meta">
                        <span>{clientTrackingProgress}% progress</span>
                        <span>{getClientStatusMessage(clientTrackingStatus)}</span>
                      </div>
                      <div className="client-refresh-row">
                        <span>{['DELIVERED', 'FAILED'].includes(clientTrackingStatus) ? 'Tracking complete' : 'Tracking active'}</span>
                        <span>Last refreshed: {formatDateTime(clientTrackingLastRefreshedAt)}</span>
                      </div>
                      {clientTrackingRefreshError && (
                        <div className="client-refresh-error">{clientTrackingRefreshError}</div>
                      )}
                    </div>

                    {clientTrackingStatus === 'DELIVERED' && (
                      <div className="card client-terminal-card completed">
                        <h3>Delivered</h3>
                        <p>{latestTerminalEvent?.description || 'Package delivered successfully'}</p>
                        <span>{formatDateTime(latestTerminalEvent?.eventTime || clientTracking.updatedAt)}</span>
                      </div>
                    )}

                    {clientTrackingStatus === 'FAILED' && (
                      <div className="card client-terminal-card failed">
                        <h3>Delivery Attempt Failed</h3>
                        <p>{latestTerminalEvent?.description || 'Delivery attempt unsuccessful'}</p>
                        <span>{formatDateTime(latestTerminalEvent?.eventTime || clientTracking.updatedAt)}</span>
                      </div>
                    )}

                    <div className="client-tracking-grid">
                      <div className="client-tracking-main-column">
                        <div className="card client-progress-steps-card">
                          <div className="cms-panel-header compact">
                            <div>
                              <h3>Delivery Progress</h3>
                              <p>Completed steps reflect real tracking history; upcoming steps are expected future states.</p>
                            </div>
                          </div>
                          <div className="client-progress-steps">
                            {[
                              { status: 'PENDING', label: 'Order Received / Pending' },
                              { status: 'WAREHOUSE', label: 'Warehouse' },
                              { status: 'LOADED', label: 'Loaded' },
                              { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
                              { status: 'DELIVERED', label: 'Delivered' }
                            ].map((step) => {
                              const historyEntry = clientTrackingHistory.find((entry) => entry.status === step.status);
                              const isCurrent = clientTrackingStatus === step.status;
                              const isCompleted = Boolean(historyEntry) || (step.status === 'DELIVERED' && clientTrackingStatus === 'DELIVERED');
                              return (
                                <div className={`client-progress-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`} key={step.status}>
                                  <span className="client-progress-step-dot"></span>
                                  <div>
                                    <strong>{step.label}</strong>
                                    {historyEntry ? (
                                      <p>{historyEntry.description || toWarehouseStatusLabel(historyEntry.status)} - {formatDateTime(historyEntry.eventTime)}</p>
                                    ) : (
                                      <p>Expected step</p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="card client-timeline-card">
                          <div className="cms-panel-header compact">
                            <div>
                              <h3>Tracking Timeline</h3>
                              <p>Real tracking history from the Tracking Service</p>
                            </div>
                          </div>
                          {clientTrackingHistory.length ? (
                            <div className="warehouse-timeline">
                              {clientTrackingHistory.map((item) => (
                                <div className="warehouse-timeline-item" key={`${item.status}-${item.eventTime}`}>
                                  <span className={`warehouse-timeline-dot ${item.status === 'FAILED' ? 'failed' : ''}`}></span>
                                  <div>
                                    <div className="warehouse-timeline-title">{toWarehouseStatusLabel(item.status)}</div>
                                    <div className="warehouse-timeline-meta">{item.location || 'No location'} - {formatDateTime(item.eventTime)}</div>
                                    <p>{item.description || 'No description provided'}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="warehouse-empty-state">No tracking history has been recorded yet.</div>
                          )}
                        </div>
                      </div>

                      <div className="client-tracking-side-column">
                        <div className="card client-location-card">
                          <div className="cms-preview-label">Last Known Location</div>
                          <h3>{clientTracking.currentLocation || 'Not available'}</h3>
                          <p>Exact GPS coordinates are not available from the current tracking backend.</p>
                          <RouteMapVisual
                            pickupAddress={clientTracking.currentLocation || 'Latest location unavailable'}
                            deliveryAddress={clientTrackingDestination}
                          />
                          {clientTrackingMapsHref ? (
                            <a href={clientTrackingMapsHref} target="_blank" rel="noreferrer" className="btn btn-secondary driver-wide-button">
                              Open Destination in Maps
                            </a>
                          ) : (
                            <button className="btn btn-secondary driver-wide-button" disabled>Open Destination in Maps</button>
                          )}
                        </div>

                        <div className="card client-eta-card">
                          <div className="cms-preview-label">Delivery Status</div>
                          <h3>{getClientStatusMessage(clientTrackingStatus)}</h3>
                          <p>Live ETA unavailable</p>
                          <span>Updated: {formatDateTime(clientTracking.updatedAt)}</span>
                        </div>

                        <div className="card client-updates-card">
                          <div className="cms-preview-label">Tracking Updates</div>
                          {clientTrackingUpdates.length ? (
                            <div className="client-updates-list">
                              {clientTrackingUpdates.map((entry) => (
                                <div className="client-update-row" key={`${entry.status}-${entry.eventTime}`}>
                                  <span className={`badge ${getWarehouseStatusBadge(entry.status)}`}>{toWarehouseStatusLabel(entry.status)}</span>
                                  <div>
                                    <strong>{entry.description || toWarehouseStatusLabel(entry.status)}</strong>
                                    <p>{formatDateTime(entry.eventTime)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="warehouse-empty-state">No updates yet.</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Legacy static tracking view kept disabled after Phase 11 real tracking integration. */}
            {dashboardTab === 'tracking-legacy' && (
              <div>
                <header className="screen-header">
                  <div>
                    <h1 className="screen-title">Live Order Status</h1>
                    <p className="screen-subtitle">Track dispatch details and route coordinates in real-time</p>
                  </div>
                </header>

                {/* Track ID Form Search */}
                <div className="card" style={{ marginBottom: '28px' }}>
                  <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: '16px' }}>
                    <input 
                      type="text" 
                      className="order-input" 
                      placeholder="Enter Order ID to locate (e.g. ST-902148)" 
                      value={trackingSearchTerm}
                      onChange={(e) => setTrackingSearchTerm(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', flexShrink: 0 }}>
                      Locate Shipment
                    </button>
                  </form>
                </div>

                {activeTrackingOrder ? (
                  <div className="tracking-container">
                    
                    {/* Left Column - Route & Timeline */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
                      <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
                          <div>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600' }}>ACTIVE SHIPMENT</span>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', marginTop: '2px' }}>{activeTrackingOrder.id}</h2>
                          </div>
                          <span className={`badge badge-${
                            activeTrackingOrder.status === 'Delivered' ? 'completed' :
                            activeTrackingOrder.status === 'Failed' ? 'failed' :
                            activeTrackingOrder.status === 'Pending' ? 'pending' : 'transit'
                          }`}>
                            {activeTrackingOrder.status}
                          </span>
                        </div>

                        {/* Package details */}
                        <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13.5px', textAlign: 'left' }}>
                          <div>
                            <div style={{ color: 'var(--text-muted)' }}>Sender Pickup</div>
                            <div style={{ fontWeight: '600', marginTop: '4px' }}>{activeTrackingOrder.pickupAddress}</div>
                          </div>
                          <div>
                            <div style={{ color: 'var(--text-muted)' }}>Destination Address</div>
                            <div style={{ fontWeight: '600', marginTop: '4px' }}>{activeTrackingOrder.deliveryAddress}</div>
                          </div>
                          <div>
                            <div style={{ color: 'var(--text-muted)' }}>Cargo Weight</div>
                            <div style={{ fontWeight: '600', marginTop: '4px' }}>{activeTrackingOrder.weight} kg ({activeTrackingOrder.packageType})</div>
                          </div>
                          <div>
                            <div style={{ color: 'var(--text-muted)' }}>Priority Level</div>
                            <div style={{ fontWeight: '600', marginTop: '4px' }}>{activeTrackingOrder.priority}</div>
                          </div>
                          <div>
                            <div style={{ color: 'var(--text-muted)' }}>Driver assigned</div>
                            <div style={{ fontWeight: '600', marginTop: '4px' }}>{activeTrackingOrder.driver}</div>
                          </div>
                          <div>
                            <div style={{ color: 'var(--text-muted)' }}>Truck details</div>
                            <div style={{ fontWeight: '600', marginTop: '4px' }}>{activeTrackingOrder.vehicle}</div>
                          </div>
                        </div>

                        {/* Interactive Timeline */}
                        <div className="timeline-wrapper">
                          <div className="timeline-line"></div>
                          
                          <div className={`timeline-item ${
                            ['pending', 'warehouse', 'route generated', 'loaded', 'out for delivery', 'delivered', 'failed'].includes(activeTrackingOrder.status.toLowerCase()) ? 'completed' : ''
                          }`}>
                            <div className="timeline-dot">✓</div>
                            <div className="timeline-content">
                              <h4>Order Pending Verification</h4>
                              <p className="timeline-time">Ingested, waiting for dispatch.</p>
                            </div>
                          </div>

                          <div className={`timeline-item ${
                            ['warehouse', 'route generated', 'loaded', 'out for delivery', 'delivered', 'failed'].includes(activeTrackingOrder.status.toLowerCase()) ? 'completed' : 
                            activeTrackingOrder.status.toLowerCase() === 'pending' ? 'active' : ''
                          }`}>
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                              <h4>Received at Warehousing Hub</h4>
                              <p className="timeline-time">Stored, ready for Route optimization.</p>
                            </div>
                          </div>

                          <div className={`timeline-item ${
                            ['route generated', 'loaded', 'out for delivery', 'delivered', 'failed'].includes(activeTrackingOrder.status.toLowerCase()) ? 'completed' : 
                            activeTrackingOrder.status.toLowerCase() === 'warehouse' ? 'active' : ''
                          }`}>
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                              <h4>Optimal Route Calculation</h4>
                              <p className="timeline-time">Calculated via ROS heuristic engines.</p>
                            </div>
                          </div>

                          <div className={`timeline-item ${
                            ['loaded', 'out for delivery', 'delivered', 'failed'].includes(activeTrackingOrder.status.toLowerCase()) ? 'completed' : 
                            activeTrackingOrder.status.toLowerCase() === 'route generated' ? 'active' : ''
                          }`}>
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                              <h4>Cargo Loaded to Truck</h4>
                              <p className="timeline-time">Assigned to delivery vehicle.</p>
                            </div>
                          </div>

                          <div className={`timeline-item ${
                            ['out for delivery', 'delivered'].includes(activeTrackingOrder.status.toLowerCase()) ? 'completed' : 
                            activeTrackingOrder.status.toLowerCase() === 'failed' ? 'failed' : 
                            activeTrackingOrder.status.toLowerCase() === 'loaded' ? 'active' : ''
                          }`}>
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                              <h4>{activeTrackingOrder.status === 'Failed' ? 'Delivery Unsuccessful' : 'Out for Delivery'}</h4>
                              <p className="timeline-time">{activeTrackingOrder.status === 'Failed' ? 'Delivery attempt failed at coordinates.' : 'Transit to destination hub.'}</p>
                            </div>
                          </div>

                          <div className={`timeline-item ${
                            activeTrackingOrder.status.toLowerCase() === 'delivered' ? 'completed' : 
                            activeTrackingOrder.status.toLowerCase() === 'out for delivery' ? 'active' : ''
                          }`}>
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                              <h4>Cargo Delivered</h4>
                              <p className="timeline-time">Package signed and validated.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Map Visual Representation */}
                    <div>
                      <div className="card map-card">
                        <div className="map-viz">
                          {/* Svg route map */}
                          <div className="map-route-line"></div>
                          
                          {/* Pickup Pin */}
                          <div className="map-pin" style={{ top: '55%', left: '16%' }}>
                            <div className="map-pin-label">Boston Hub</div>
                            <div className="map-pin-dot"></div>
                          </div>

                          {/* Delivery Pin */}
                          <div className="map-pin" style={{ top: '35%', left: '72%' }}>
                            <div className="map-pin-label">{activeTrackingOrder.receiverName}</div>
                            <div className="map-pin-dot" style={{ backgroundColor: 'var(--status-completed)' }}></div>
                          </div>

                          {/* Active vehicle truck */}
                          {activeTrackingOrder.status === 'Out for Delivery' && (
                            <div className="map-truck">
                              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none">
                                <rect x="1" y="3" width="15" height="13" />
                                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                              </svg>
                            </div>
                          )}

                          {/* Map Details Overlay */}
                          <div className="map-overlay-info">
                            <div style={{ textAlign: 'left' }}>
                              <div className="map-overlay-title">Estimated Transit</div>
                              <div className="map-overlay-subtitle" style={{ marginTop: '2px' }}>
                                {activeTrackingOrder.status === 'Delivered' ? 'Completed' :
                                 activeTrackingOrder.status === 'Failed' ? 'Failed' : '4 hours remaining'}
                              </div>
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primary)' }}>
                              {activeTrackingOrder.status === 'Delivered' ? '100% Arrived' : 'On Schedule'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No active tracking data available. Book an order or search using order history list.
                  </div>
                )}
              </div>
            )}

            {/* TAB: SYSTEM OVERVIEW (staff/admin only) */}
            {user?.role === 'ADMIN' && dashboardTab === 'system-overview' && (
              <div>
                <header className="screen-header">
                  <div>
                    <h1 className="screen-title">System Overview</h1>
                    <p className="screen-subtitle">Live counts, integration health, and delivery trends across the whole middleware</p>
                  </div>
                </header>

                <div className="cms-dashboard">
                  {systemOverviewLoading && <div className="card" style={{ marginBottom: '4px' }}>Loading system overview...</div>}
                  {systemOverviewError && <div className="card" style={{ marginBottom: '4px', color: 'var(--status-failed)' }}>{systemOverviewError}</div>}

                  <div className="stats-grid cms-stats-grid">
                    {systemStatusCards.map((metric) => (
                      <div className="card stat-card cms-stat-card" key={metric.label}>
                        <div className="stat-info">
                          <h4>{metric.label}</h4>
                          <p className="stat-val">{metric.value}</p>
                        </div>
                        <div className={`stat-icon-wrapper cms-stat-tone ${metric.tone}`}>
                          <DashboardIcon />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="cms-layout">
                    <div className="cms-main-column">
                      <div className="card cms-panel">
                        <div className="cms-panel-header">
                          <div>
                            <h3>Daily Orders</h3>
                            <p>Orders placed per day, last 7 days</p>
                          </div>
                        </div>

                        <div className="system-bar-chart">
                          {dailyOrdersChart.map((day) => (
                            <div className="system-bar-chart-col" key={day.date}>
                              <span className="system-bar-chart-value">{day.count}</span>
                              <div
                                className="system-bar-chart-bar"
                                style={{ height: `${Math.max(4, (day.count / dailyOrdersMax) * 100)}%` }}
                              ></div>
                              <span className="system-bar-chart-label">{day.date.slice(5)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="card cms-panel" style={{ marginTop: '20px' }}>
                        <div className="cms-panel-header">
                          <div>
                            <h3>Completed vs Failed Deliveries</h3>
                            <p>Totals from the Tracking Service</p>
                          </div>
                        </div>

                        <div className="system-compare-chart">
                          <div className="system-compare-row">
                            <span className="system-compare-label">Completed</span>
                            <div className="system-compare-track">
                              <div
                                className="system-compare-fill completed"
                                style={{ width: `${(deliveredCount / deliveryOutcomeMax) * 100}%` }}
                              ></div>
                            </div>
                            <span className="system-compare-value">{deliveredCount}</span>
                          </div>
                          <div className="system-compare-row">
                            <span className="system-compare-label">Failed</span>
                            <div className="system-compare-track">
                              <div
                                className="system-compare-fill failed"
                                style={{ width: `${(failedCount / deliveryOutcomeMax) * 100}%` }}
                              ></div>
                            </div>
                            <span className="system-compare-value">{failedCount}</span>
                          </div>
                        </div>
                      </div>

                      <div className="card cms-panel" style={{ marginTop: '20px' }}>
                        <div className="cms-panel-header">
                          <div>
                            <h3>Active Drivers</h3>
                            <p>Drivers currently on a route vs. total fleet</p>
                          </div>
                        </div>

                        <div className="system-compare-chart">
                          <div className="system-compare-row">
                            <span className="system-compare-label">On Route</span>
                            <div className="system-compare-track">
                              <div
                                className="system-compare-fill completed"
                                style={{ width: `${(activeDriversCount / totalDriversForChart) * 100}%` }}
                              ></div>
                            </div>
                            <span className="system-compare-value">{activeDriversCount} / {systemRosDrivers.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="cms-side-column">
                      <div className="card cms-status-card">
                        <div className="cms-preview-label">Integration Health</div>
                        <div className="system-health-list">
                          {integrationHealthItems.map((item) => (
                            <div className="system-health-row" key={item.label}>
                              <span className={`cms-status-dot ${item.status === 'UP' ? 'connected' : 'disconnected'}`}></span>
                              <span>{item.label}</span>
                              <span className={`badge ${item.status === 'UP' ? 'badge-completed' : 'badge-failed'}`}>
                                {item.status || 'UNKNOWN'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: CMS INTEGRATION (staff/admin only) */}
            {user?.role === 'ADMIN' && dashboardTab === 'cms' && (
              <div>
                <header className="screen-header">
                  <div>
                    <h1 className="screen-title">CMS Integration</h1>
                    <p className="screen-subtitle">Monitor SOAP traffic, conversion previews, retries, and completion events for the legacy CMS bridge</p>
                  </div>
                </header>

                <div className="cms-dashboard">
                  {cmsLoading && <div className="card" style={{ marginBottom: '4px' }}>Loading CMS data...</div>}
                  {cmsError && <div className="card" style={{ marginBottom: '4px', color: 'var(--status-failed)' }}>{cmsError}</div>}

                  <div className="stats-grid cms-stats-grid">
                    {cmsSummaryMetrics.map((metric) => (
                      <div className="card stat-card cms-stat-card" key={metric.label}>
                        <div className="stat-info">
                          <h4>{metric.label}</h4>
                          <p className="stat-val">{metric.value}</p>
                        </div>
                        <div className={`stat-icon-wrapper cms-stat-tone ${metric.tone}`}>
                          <CmsIcon />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="cms-layout">
                    <div className="cms-main-column">
                      <div className="card cms-panel">
                        <div className="cms-panel-header">
                          <div>
                            <h3>SOAP Request Viewer</h3>
                            <p>Recent SOAP messages, XML request preview, JSON conversion preview, and response panel</p>
                          </div>
                          <span className={`badge ${cmsConnected ? 'badge-completed' : 'badge-failed'}`}>{cmsConnected ? 'Connected' : 'Disconnected'}</span>
                        </div>

                        <div className="cms-requests-list">
                          {cmsRecentMessages.map((item) => (
                            <div className="cms-request-row" key={item.title}>
                              <div className="cms-request-bullet"></div>
                              <div>
                                <h4>{item.title}</h4>
                                <p>{item.detail}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="cms-preview-grid">
                          <div className="cms-preview-card">
                            <div className="cms-preview-label">XML Request Preview</div>
                            <pre>{cmsSoapPreview}</pre>
                          </div>
                          <div className="cms-preview-card">
                            <div className="cms-preview-label">JSON Conversion Preview</div>
                            <pre>{cmsJsonPreview}</pre>
                          </div>
                        </div>

                        <div className="cms-response-panel">
                          <div className="cms-preview-label">CMS Response Panel</div>
                          <div className="cms-response-message">
                            <strong>CMS Response</strong>
                            <span>{cmsLatestResult?.message || 'CMS response will appear here after the first processed order.'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="cms-side-column">
                      <div className="card cms-status-card">
                        <div className="cms-preview-label">Connection Status</div>
                        <div className="cms-status-indicator">
                          <span className={`cms-status-dot ${cmsConnected ? 'connected' : 'disconnected'}`}></span>
                          <strong>{cmsConnected ? 'Connected' : 'Disconnected'}</strong>
                        </div>
                        <p>{cmsConnected ? 'SOAP endpoint is reachable and ready to process OrderCreated events.' : 'CMS backend is still starting or unreachable.'}</p>
                      </div>

                      <div className="card cms-events-card">
                        <div className="cms-preview-label">Recent Event Log</div>
                        <div className="cms-event-log">
                          {cmsEventLog.map((entry) => (
                            <div className="cms-event-row" key={`${entry.time}-${entry.event}`}>
                              <span className="cms-event-time">{entry.time}</span>
                              <span className="cms-event-name">{entry.event}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="card cms-retry-card">
                        <div className="cms-panel-header compact">
                          <div>
                            <h3>Retry Queue</h3>
                            <p>Failed SOAP calls awaiting retry</p>
                          </div>
                        </div>

                        {cmsRetryError && <div className="error-message" style={{ margin: '0 0 12px 0' }}>⚠️ {cmsRetryError}</div>}

                        <div className="cms-retry-table-wrap">
                          <table className="cms-retry-table">
                            <thead>
                              <tr>
                                <th>Order ID</th>
                                <th>Error</th>
                                <th>Attempts</th>
                                <th>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {cmsRetryQueue.length === 0 ? (
                                <tr>
                                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No failed SOAP calls awaiting retry.</td>
                                </tr>
                              ) : (
                                cmsRetryQueue.map((row) => (
                                  <tr key={row.orderNumber}>
                                    <td>{row.orderNumber}</td>
                                    <td>{row.errorMessage}</td>
                                    <td>{row.attempts}</td>
                                    <td>
                                      <button
                                        className="btn btn-secondary cms-retry-button"
                                        onClick={() => handleRetryOrder(row.orderNumber)}
                                        disabled={retryingOrderNumber === row.orderNumber}
                                      >
                                        {retryingOrderNumber === row.orderNumber ? 'Retrying...' : 'Retry'}
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ROUTE OPTIMIZATION */}
            {/* TAB: ROUTE OPTIMIZATION (staff/admin only) */}
            {user?.role === 'ADMIN' && dashboardTab === 'routes' && (
              <div>
                <header className="screen-header">
                  <div>
                    <h1 className="screen-title">Route Optimization</h1>
                    <p className="screen-subtitle">Live route generation, driver assignment, and vehicle status from the ROS bridge</p>
                  </div>
                </header>

                <div className="cms-dashboard">
                  {rosLoading && <div className="card" style={{ marginBottom: '4px' }}>Loading Route Optimization data...</div>}
                  {rosError && <div className="card" style={{ marginBottom: '4px', color: 'var(--status-failed)' }}>{rosError}</div>}

                  <div className="stats-grid cms-stats-grid">
                    {rosSummaryMetrics.map((metric) => (
                      <div className="card stat-card cms-stat-card" key={metric.label}>
                        <div className="stat-info">
                          <h4>{metric.label}</h4>
                          <p className="stat-val">{metric.value}</p>
                        </div>
                        <div className={`stat-icon-wrapper cms-stat-tone ${metric.tone}`}>
                          <RouteOptimizationIcon />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="cms-layout">
                    <div className="cms-main-column">
                      <div className="card cms-panel">
                        <div className="cms-panel-header">
                          <div>
                            <h3>Route Map Overview</h3>
                            <p>Multi-stop routes for every order currently marked Loaded and awaiting dispatch, grouped by driver and delivery region</p>
                          </div>
                          <span className={`badge ${rosConnected ? 'badge-completed' : 'badge-failed'}`}>{rosConnected ? 'Connected' : 'Disconnected'}</span>
                        </div>

                        {visibleGroupedRoutes.length > 0 ? (
                          <RouteOptimizationMap
                            routes={visibleGroupedRoutes}
                            selectedRouteId={selectedRosRoute?.routeId}
                            onSelectRoute={setSelectedRosRouteId}
                          />
                        ) : (
                          <div className="cms-response-panel">
                            <div className="cms-preview-label">Route Map Overview</div>
                            <div className="cms-response-message">
                              <span>No loaded orders awaiting dispatch right now.</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {selectedRosRoute && (
                        <div className="card route-details-card">
                          <div className="route-details-header">
                            <div className="route-details-header-title">
                              <span className="cms-preview-label">Route Details</span>
                              <select
                                className="order-select route-details-select"
                                value={selectedRosRoute.routeId}
                                onChange={(e) => setSelectedRosRouteId(e.target.value)}
                              >
                                {visibleGroupedRoutes.map((route) => (
                                  <option key={route.routeId} value={route.routeId}>{route.routeId}</option>
                                ))}
                              </select>
                            </div>
                            <span className={`badge ${selectedRosRoute.active ? 'badge-completed' : 'badge-pending'}`}>
                              {selectedRosRoute.active ? 'Active' : 'Complete'}
                            </span>
                          </div>

                          <div className="route-details-grid">
                            <div className="route-details-column">
                              <div className="route-details-label">Driver</div>
                              <div className="route-details-person">
                                <div className="route-details-avatar">
                                  {(selectedRosRoute.driverName || 'D').split(' ').map((n) => n[0]).join('').toUpperCase()}
                                </div>
                                <div>
                                  <strong>{selectedRosRoute.driverName}</strong>
                                  <div className="route-details-muted">{selectedRosRoute.driverId}</div>
                                </div>
                              </div>

                              <div className="route-details-label" style={{ marginTop: '18px' }}>Vehicle</div>
                              <div className="route-details-person">
                                <div className="route-details-vehicle-icon"><TruckIcon /></div>
                                <div>
                                  <strong>{selectedRosRoute.vehicleType}</strong>
                                  <div className="route-details-muted">{selectedRosRoute.vehiclePlate} · {selectedRosRoute.vehicleId}</div>
                                </div>
                              </div>
                            </div>

                            <div className="route-details-column">
                              <div className="route-details-stat-row"><span>Total Stops</span><strong>{selectedRosRoute.stops.length}</strong></div>
                              <div className="route-details-stat-row"><span>Total Distance</span><strong>{selectedRosRoute.totalDistanceKm} km</strong></div>
                              <div className="route-details-stat-row"><span>Total Time</span><strong>{selectedRosRoute.totalDurationMinutes} min</strong></div>
                              <div className="route-details-stat-row">
                                <span>Traffic</span>
                                <span className={`badge ${
                                  selectedRosRoute.trafficLevel === 'LOW' ? 'badge-completed' :
                                  selectedRosRoute.trafficLevel === 'HIGH' ? 'badge-failed' : 'badge-pending'
                                }`}>{selectedRosRoute.trafficLevel}</span>
                              </div>
                              <div className="route-details-stat-row"><span>Hub / Pickup</span><strong style={{ textAlign: 'right', fontWeight: 600, fontSize: '12px' }}>{selectedRosRoute.hubAddress}</strong></div>
                            </div>
                          </div>

                          <div className="cms-preview-label" style={{ marginTop: '20px', marginBottom: '10px' }}>Delivery Sequence</div>
                          <div>
                            {selectedRosRoute.stops.map((stop) => (
                              <div className="route-map-order-badge-row" key={stop.orderNumber} style={{ cursor: 'default' }}>
                                <span
                                  className="route-map-order-badge"
                                  style={{ background: ROUTE_MAP_COLORS[visibleGroupedRoutes.indexOf(selectedRosRoute) % ROUTE_MAP_COLORS.length] }}
                                >
                                  {stop.sequence}
                                </span>
                                <span style={{ flex: 1 }}>
                                  <strong>{stop.receiverName || stop.orderNumber}</strong>
                                  <div className="route-details-muted">{stop.orderNumber} · {stop.deliveryAddress}</div>
                                </span>
                                <span className="route-details-muted">{stop.cumulativeDistanceKm} km · {stop.cumulativeDurationMinutes} min</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="card cms-retry-card">
                        <div className="cms-panel-header compact">
                          <div>
                            <h3>Today's Routes</h3>
                            <p>Routes covering orders currently Loaded and awaiting dispatch</p>
                          </div>
                        </div>

                        <div className="cms-retry-table-wrap">
                          <table className="cms-retry-table">
                            <thead>
                              <tr>
                                <th>Route ID</th>
                                <th>Driver</th>
                                <th>Vehicle</th>
                                <th>Stops</th>
                                <th>Distance</th>
                                <th>Time</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {visibleGroupedRoutes.length === 0 ? (
                                <tr>
                                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No loaded orders awaiting dispatch right now.</td>
                                </tr>
                              ) : (
                                visibleGroupedRoutes.map((route) => (
                                  <tr
                                    key={route.routeId}
                                    onClick={() => setSelectedRosRouteId(route.routeId)}
                                    style={{ cursor: 'pointer', backgroundColor: route.routeId === selectedRosRoute?.routeId ? 'rgba(37, 99, 235, 0.06)' : undefined }}
                                  >
                                    <td>{route.routeId}</td>
                                    <td>{route.driverName}</td>
                                    <td>{route.vehiclePlate}</td>
                                    <td>{route.stops.length}</td>
                                    <td>{route.totalDistanceKm} km</td>
                                    <td>{route.totalDurationMinutes} min</td>
                                    <td>
                                      <span className={`badge ${route.active ? 'badge-transit' : 'badge-completed'}`}>
                                        {route.active ? 'Active' : 'Complete'}
                                      </span>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    <div className="cms-side-column">
                      <div className="card cms-status-card">
                        <div className="cms-preview-label">Connection Status</div>
                        <div className="cms-status-indicator">
                          <span className={`cms-status-dot ${rosConnected ? 'connected' : 'disconnected'}`}></span>
                          <strong>{rosConnected ? 'Connected' : 'Disconnected'}</strong>
                        </div>
                        <p>{rosConnected ? 'ROS endpoint is reachable and ready to optimize OrderCreated events.' : 'ROS backend is still starting or unreachable.'}</p>
                      </div>

                      <div className="card cms-events-card">
                        <div className="cms-preview-label">Recent Route Generation Events</div>
                        <div className="cms-event-log">
                          {rosEventLog.map((entry) => (
                            <div className="cms-event-row" key={`${entry.time}-${entry.event}`}>
                              <span className="cms-event-time">{entry.time}</span>
                              <span className="cms-event-name">{entry.event}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="card cms-retry-card">
                        <div className="cms-panel-header compact">
                          <div>
                            <h3>Vehicle Status</h3>
                            <p>Current fleet availability</p>
                          </div>
                        </div>

                        <div className="cms-retry-table-wrap">
                          <table className="cms-retry-table">
                            <thead>
                              <tr>
                                <th>Vehicle</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rosVehicleStatus.length === 0 ? (
                                <tr>
                                  <td colSpan={2} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No vehicle data yet.</td>
                                </tr>
                              ) : (
                                rosVehicleStatus.map((vehicle) => (
                                  <tr key={vehicle.vehicleId}>
                                    <td>{vehicle.vehiclePlate}</td>
                                    <td>
                                      <span className={`badge ${
                                        vehicle.status === 'IDLE' ? 'badge-pending' :
                                        vehicle.status === 'MAINTENANCE' ? 'badge-failed' : 'badge-transit'
                                      }`}>{vehicle.status}</span>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="card cms-retry-card">
                        <div className="cms-panel-header compact">
                          <div>
                            <h3>RouteGenerated Queue</h3>
                            <p>Most recently generated routes</p>
                          </div>
                        </div>

                        <div className="cms-retry-table-wrap">
                          <table className="cms-retry-table">
                            <thead>
                              <tr>
                                <th>Order ID</th>
                                <th>Driver</th>
                                <th>Distance</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rosRouteQueue.length === 0 ? (
                                <tr>
                                  <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No routes generated yet.</td>
                                </tr>
                              ) : (
                                rosRouteQueue.map((route) => (
                                  <tr key={route.orderNumber}>
                                    <td>{route.orderNumber}</td>
                                    <td>{route.driverName}</td>
                                    <td>{route.distanceKm} km</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: DRIVERS (staff/admin only) */}
            {user?.role === 'ADMIN' && dashboardTab === 'drivers' && (
              <div>
                <header className="screen-header">
                  <div>
                    <h1 className="screen-title">Drivers</h1>
                    <p className="screen-subtitle">Fleet driver roster and current availability from the ROS bridge</p>
                  </div>
                </header>

                <div className="cms-dashboard">
                  {rosLoading && <div className="card" style={{ marginBottom: '4px' }}>Loading driver data...</div>}
                  {rosError && <div className="card" style={{ marginBottom: '4px', color: 'var(--status-failed)' }}>{rosError}</div>}

                  <div className="cms-layout">
                    <div className="cms-main-column">
                      <div className="card cms-retry-card">
                        <div className="cms-panel-header compact">
                          <div>
                            <h3>Driver Roster</h3>
                            <p>{rosDashboard?.drivers?.length ?? 0} drivers registered</p>
                          </div>
                        </div>

                        <div className="cms-retry-table-wrap">
                          <table className="cms-retry-table">
                            <thead>
                              <tr>
                                <th>Driver ID</th>
                                <th>Name</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(rosDashboard?.drivers ?? []).length === 0 ? (
                                <tr>
                                  <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No driver data yet.</td>
                                </tr>
                              ) : (
                                rosDashboard.drivers.map((driver) => (
                                  <tr key={driver.driverId}>
                                    <td>{driver.driverId}</td>
                                    <td>{driver.name}</td>
                                    <td>
                                      <span className={`badge ${driver.status === 'AVAILABLE' ? 'badge-completed' : 'badge-transit'}`}>
                                        {driver.status === 'AVAILABLE' ? 'Available' : 'On Route'}
                                      </span>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    <div className="cms-side-column">
                      <div className="card cms-status-card">
                        <div className="cms-preview-label">Add Driver</div>
                        <p style={{ marginBottom: '16px' }}>Creates a fleet entry (for route assignment) and a login account.</p>

                        {addDriverError && <div className="error-message" style={{ marginBottom: '12px' }}>⚠️ {addDriverError}</div>}
                        {addDriverSuccess && <div className="card" style={{ marginBottom: '12px', color: 'var(--status-completed)' }}>{addDriverSuccess}</div>}

                        <form onSubmit={handleAddDriver} autoComplete="off">
                          <div className="order-form-group" style={{ marginBottom: '12px' }}>
                            <label>Driver ID</label>
                            <div className="order-input" style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-inner)' }}>
                              {nextDriverId} <span style={{ fontSize: '12px' }}>(auto-generated)</span>
                            </div>
                          </div>
                          <div className="order-form-group" style={{ marginBottom: '12px' }}>
                            <label htmlFor="new-driver-name">Full Name</label>
                            <input
                              type="text"
                              id="new-driver-name"
                              className="order-input"
                              placeholder="e.g. Dilan Jayawardena"
                              value={newDriverName}
                              onChange={(e) => setNewDriverName(e.target.value)}
                              required
                            />
                          </div>
                          <div className="order-form-group" style={{ marginBottom: '12px' }}>
                            <label htmlFor="new-driver-email">Email</label>
                            <input
                              type="email"
                              id="new-driver-email"
                              className="order-input"
                              placeholder="driver6@swiftlogistics.com"
                              value={newDriverEmail}
                              onChange={(e) => setNewDriverEmail(e.target.value)}
                              required
                            />
                          </div>
                          <div className="order-form-group" style={{ marginBottom: '16px' }}>
                            <label htmlFor="new-driver-password">Password</label>
                            <input
                              type="password"
                              id="new-driver-password"
                              className="order-input"
                              placeholder="••••••••"
                              value={newDriverPassword}
                              onChange={(e) => setNewDriverPassword(e.target.value)}
                              required
                            />
                          </div>
                          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={addDriverSubmitting}>
                            {addDriverSubmitting ? 'Adding Driver...' : 'Add Driver'}
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: VEHICLES (staff/admin only) */}
            {user?.role === 'ADMIN' && dashboardTab === 'vehicles' && (
              <div>
                <header className="screen-header">
                  <div>
                    <h1 className="screen-title">Vehicles</h1>
                    <p className="screen-subtitle">Fleet vehicle roster and current availability from the ROS bridge</p>
                  </div>
                </header>

                <div className="cms-dashboard">
                  {rosLoading && <div className="card" style={{ marginBottom: '4px' }}>Loading vehicle data...</div>}
                  {rosError && <div className="card" style={{ marginBottom: '4px', color: 'var(--status-failed)' }}>{rosError}</div>}

                  <div className="cms-layout">
                    <div className="cms-main-column">
                      <div className="card cms-retry-card">
                        <div className="cms-panel-header compact">
                          <div>
                            <h3>Vehicle Roster</h3>
                            <p>{rosDashboard?.vehicleStatus?.length ?? 0} vehicles registered</p>
                          </div>
                        </div>

                        <div className="cms-retry-table-wrap">
                          <table className="cms-retry-table">
                            <thead>
                              <tr>
                                <th>Vehicle ID</th>
                                <th>Plate</th>
                                <th>Type</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rosVehicleStatus.length === 0 ? (
                                <tr>
                                  <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No vehicle data yet.</td>
                                </tr>
                              ) : (
                                rosVehicleStatus.map((vehicle) => (
                                  <tr key={vehicle.vehicleId}>
                                    <td>{vehicle.vehicleId}</td>
                                    <td>{vehicle.vehiclePlate}</td>
                                    <td>{vehicle.vehicleType}</td>
                                    <td>
                                      <span className={`badge ${
                                        vehicle.status === 'IDLE' ? 'badge-pending' :
                                        vehicle.status === 'MAINTENANCE' ? 'badge-failed' : 'badge-transit'
                                      }`}>{vehicle.status}</span>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    <div className="cms-side-column">
                      <div className="card cms-status-card">
                        <div className="cms-preview-label">Add Vehicle</div>
                        <p style={{ marginBottom: '16px' }}>Adds a new vehicle to the fleet pool for route assignment.</p>

                        {addVehicleError && <div className="error-message" style={{ marginBottom: '12px' }}>⚠️ {addVehicleError}</div>}
                        {addVehicleSuccess && <div className="card" style={{ marginBottom: '12px', color: 'var(--status-completed)' }}>{addVehicleSuccess}</div>}

                        <form onSubmit={handleAddVehicle} autoComplete="off">
                          <div className="order-form-group" style={{ marginBottom: '12px' }}>
                            <label>Vehicle ID</label>
                            <div className="order-input" style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-inner)' }}>
                              {nextVehicleId} <span style={{ fontSize: '12px' }}>(auto-generated)</span>
                            </div>
                          </div>
                          <div className="order-form-group" style={{ marginBottom: '12px' }}>
                            <label htmlFor="new-vehicle-plate">Plate Number</label>
                            <input
                              type="text"
                              id="new-vehicle-plate"
                              className="order-input"
                              placeholder="e.g. TRK-670"
                              value={newVehiclePlate}
                              onChange={(e) => setNewVehiclePlate(e.target.value)}
                              required
                            />
                          </div>
                          <div className="order-form-group" style={{ marginBottom: '16px' }}>
                            <label htmlFor="new-vehicle-type">Vehicle Type</label>
                            <input
                              type="text"
                              id="new-vehicle-type"
                              className="order-input"
                              placeholder="e.g. Isuzu NPR Truck"
                              value={newVehicleType}
                              onChange={(e) => setNewVehicleType(e.target.value)}
                              required
                            />
                          </div>
                          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={addVehicleSubmitting}>
                            {addVehicleSubmitting ? 'Adding Vehicle...' : 'Add Vehicle'}
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ADMIN USERS */}
            {user?.role === 'ADMIN' && dashboardTab === 'admin-users' && (
              <div>
                <header className="screen-header">
                  <div>
                    <h1 className="screen-title">Users</h1>
                    <p className="screen-subtitle">All registered accounts across the platform</p>
                  </div>
                </header>

                <div className="cms-dashboard">
                  {adminUsersLoading && <div className="card" style={{ marginBottom: '4px' }}>Loading users...</div>}
                  {adminUsersError && <div className="card" style={{ marginBottom: '4px', color: 'var(--status-failed)' }}>{adminUsersError}</div>}

                  <div className="card cms-retry-card">
                    <div className="cms-panel-header compact">
                      <div>
                        <h3>All Users</h3>
                        <p>{adminUsers.length} accounts registered</p>
                      </div>
                    </div>

                    <div className="cms-retry-table-wrap">
                      <table className="cms-retry-table">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Username / Email</th>
                            <th>Email</th>
                            <th>Role</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminUsers.length === 0 ? (
                            <tr>
                              <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No users found.</td>
                            </tr>
                          ) : (
                            adminUsers.map((accountRow) => (
                              <tr key={accountRow.id}>
                                <td>{accountRow.id}</td>
                                <td>{accountRow.username}</td>
                                <td>{accountRow.email}</td>
                                <td>
                                  <span className={`badge ${
                                    accountRow.role === 'ADMIN' ? 'badge-completed' :
                                    accountRow.role === 'DRIVER' ? 'badge-transit' : 'badge-pending'
                                  }`}>{accountRow.role}</span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ADMIN ORDERS */}
            {user?.role === 'ADMIN' && dashboardTab === 'admin-orders' && (
              <div>
                <header className="screen-header">
                  <div>
                    <h1 className="screen-title">Orders</h1>
                    <p className="screen-subtitle">All orders placed across the platform, newest first</p>
                  </div>
                </header>

                <div className="cms-dashboard">
                  {adminOrdersLoading && <div className="card" style={{ marginBottom: '4px' }}>Loading orders...</div>}
                  {adminOrdersError && <div className="card" style={{ marginBottom: '4px', color: 'var(--status-failed)' }}>{adminOrdersError}</div>}

                  <div className="card cms-retry-card">
                    <div className="cms-panel-header compact">
                      <div>
                        <h3>All Orders</h3>
                        <p>{adminOrders.length} orders placed</p>
                      </div>
                    </div>

                    <div className="cms-retry-table-wrap">
                      <table className="cms-retry-table">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Client</th>
                            <th>Destination</th>
                            <th>Weight</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {adminOrders.length === 0 ? (
                            <tr>
                              <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No orders found.</td>
                            </tr>
                          ) : (
                            adminOrders.map((orderRow) => (
                              <tr key={orderRow.id}>
                                <td>{orderRow.orderNumber}</td>
                                <td>{orderRow.clientUsername}</td>
                                <td>{orderRow.recipientAddress}</td>
                                <td>{orderRow.weight} kg</td>
                                <td>
                                  <span className={`badge ${
                                    orderRow.status === 'DELIVERED' ? 'badge-completed' :
                                    orderRow.status === 'FAILED' ? 'badge-failed' : 'badge-pending'
                                  }`}>{toDisplayStatus(orderRow.status)}</span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: NOTIFICATIONS */}
            {dashboardTab === 'notifications' && (
              <div>
                <header className="screen-header">
                  <div>
                    <h1 className="screen-title">Notifications</h1>
                    <p className="screen-subtitle">Integration events logged from ROS, WMS and Dispatch systems</p>
                  </div>
                  <div>
                    <button className="btn btn-secondary" onClick={markAllNotificationsRead}>
                      Mark all as read
                    </button>
                  </div>
                </header>

                <div className="notification-timeline">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`card notification-card ${notif.unread ? 'unread' : ''}`}
                      onClick={() => markNotificationRead(notif.id)}
                      style={{ cursor: notif.unread ? 'pointer' : 'default' }}
                    >
                      {notif.unread && <div className="notification-unread-dot"></div>}
                      <div className="notification-icon-wrapper" style={{
                        backgroundColor: notif.type === 'route' ? 'var(--status-transit-bg)' :
                                        notif.type === 'driver' ? 'var(--status-purple-bg)' :
                                        notif.type === 'order' ? 'var(--status-pending-bg)' : 'var(--status-completed-bg)',
                        color: notif.type === 'route' ? 'var(--status-transit)' :
                               notif.type === 'driver' ? 'var(--status-purple)' :
                               notif.type === 'order' ? 'var(--status-pending)' : 'var(--status-completed)'
                      }}>
                        {notif.type === 'route' ? <RouteIcon /> :
                         notif.type === 'driver' ? <TruckIcon /> :
                         notif.type === 'order' ? <PlusCircleIcon /> : <ShieldCheckIcon />}
                      </div>
                      <div className="notification-info">
                        <h4>{notif.title}</h4>
                        <p>{notif.desc}</p>
                        <div className="notification-time">{notif.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 7: PROFILE */}
            {dashboardTab === 'profile' && (
              <div>
                <header className="screen-header">
                  <div>
                    <h1 className="screen-title">Account Profile</h1>
                    <p className="screen-subtitle">Your organizational settings and credentials</p>
                  </div>
                </header>

                <div className="card profile-card">
                  <div className="profile-avatar-large">
                    {user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>{user.name}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>{user.role}</p>
                  
                  <div className="profile-row">
                    <span className="profile-label">Email Address</span>
                    <span className="profile-value">{user.email}</span>
                  </div>
                  <div className="profile-row">
                    <span className="profile-label">Company / Client</span>
                    <span className="profile-value">{user.company}</span>
                  </div>
                  <div className="profile-row">
                    <span className="profile-label">Role Privilege</span>
                    <span className="profile-value">{user.role}</span>
                  </div>
                  <div className="profile-row">
                    <span className="profile-label">Gateway Access</span>
                    <span className="profile-value" style={{ color: 'var(--status-completed)' }}>Granted (JWT)</span>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>
      )}

    </div>
  );
}

export default App;
