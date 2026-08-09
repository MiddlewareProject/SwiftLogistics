import { useEffect, useRef, useState } from 'react';
import './App.css';

const API_BASE = 'http://localhost:8080';
const AUTH_USER_STORAGE_KEY = 'swifttrack-auth-user';
const REGISTERED_ACCOUNTS_STORAGE_KEY = 'swifttrack-registered-accounts';
const DASHBOARD_SCREEN_STORAGE_KEY = 'swifttrack-current-screen';
const DASHBOARD_TAB_STORAGE_KEY = 'swifttrack-dashboard-tab';
const DRIVER_VERIFIED_SESSION_KEY = 'swifttrack_driver_verified';
const DRIVER_ID_SESSION_KEY = 'swifttrack_driver_id';

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
  if (status === 'WAREHOUSE') return 'badge-pending';
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

const formatDateTime = (value) => {
  if (!value) return 'Not available';
  return new Date(value).toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStoredUser = () => {
  const storedUser = readStoredValue(AUTH_USER_STORAGE_KEY, null);
  return storedUser && storedUser.token ? storedUser : null;
};

const mapBackendOrder = (order) => {
  const displayStatus = toDisplayStatus(order.status);
  const time = order.createdAt
    ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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

function App() {
  // Navigation Screens: 'landing', 'login', 'register', 'dashboard'
  const [currentScreen, setCurrentScreen] = useState(() => {
    const storedUser = getStoredUser();
    const storedScreen = readStoredValue(DASHBOARD_SCREEN_STORAGE_KEY, 'landing');
    if (!storedUser && storedScreen === 'dashboard') {
      return 'landing';
    }

    return storedScreen;
  });

  // Dashboard Sub-tabs: 'overview', 'create', 'history', 'tracking', 'cms', 'notifications', 'profile'
  const [dashboardTab, setDashboardTab] = useState(() => {
    const storedTab = readStoredValue(DASHBOARD_TAB_STORAGE_KEY, 'overview');
    const storedUser = getStoredUser();
    if ((storedTab === 'cms' || storedTab === 'routes') && storedUser?.role !== 'ADMIN') {
      return 'overview';
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
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Route Optimized', desc: 'ROS successfully computed optimal route for ST-902148.', time: '10 mins ago', type: 'route', unread: true },
    { id: 2, title: 'Driver Assigned', desc: 'Marcus Vance was assigned to order ST-902148.', time: '1 hour ago', type: 'driver', unread: true },
    { id: 3, title: 'Package Received', desc: 'Warehouse Hub A received package for ST-719402.', time: 'Yesterday', type: 'wms', unread: false },
    { id: 4, title: 'Delivery Completed', desc: 'Order ST-881290 has been successfully delivered to Miami.', time: '2 days ago', type: 'delivery', unread: false }
  ]);
  const [cmsDashboard, setCmsDashboard] = useState(null);
  const [cmsLatestResult, setCmsLatestResult] = useState(null);
  const [cmsLoading, setCmsLoading] = useState(false);
  const [cmsError, setCmsError] = useState('');
  const [retryingOrderNumber, setRetryingOrderNumber] = useState(null);
  const [cmsRetryError, setCmsRetryError] = useState('');
  const [rosDashboard, setRosDashboard] = useState(null);
  const [rosLatestRoute, setRosLatestRoute] = useState(null);
  const [rosLoading, setRosLoading] = useState(false);
  const [rosError, setRosError] = useState('');
  const [warehouseDashboard, setWarehouseDashboard] = useState(null);
  const [warehouseLoading, setWarehouseLoading] = useState(false);
  const [warehouseError, setWarehouseError] = useState('');
  const [wmsStatus, setWmsStatus] = useState(null);
  const [selectedWarehousePackage, setSelectedWarehousePackage] = useState(null);
  const [selectedWarehouseTracking, setSelectedWarehouseTracking] = useState(null);
  const [selectedWarehouseTrackingLoading, setSelectedWarehouseTrackingLoading] = useState(false);
  const [selectedWarehouseTrackingError, setSelectedWarehouseTrackingError] = useState('');
  const [driverVerified, setDriverVerified] = useState(() => readSessionValue(DRIVER_VERIFIED_SESSION_KEY) === 'true');
  const [driverId, setDriverId] = useState(() => readSessionValue(DRIVER_ID_SESSION_KEY));
  const [driverLoginId, setDriverLoginId] = useState('');
  const [driverPassword, setDriverPassword] = useState('');
  const [driverLoginError, setDriverLoginError] = useState('');
  const [driverDashboard, setDriverDashboard] = useState(null);
  const [driverLoading, setDriverLoading] = useState(false);
  const [driverError, setDriverError] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [selectedDeliveryTracking, setSelectedDeliveryTracking] = useState(null);
  const [selectedDeliveryOrder, setSelectedDeliveryOrder] = useState(null);
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

  // Load the signed-in client's real orders from order-service whenever the session changes
  useEffect(() => {
    if (!user?.token) {
      return;
    }

    let cancelled = false;

    fetch(`${API_BASE}/api/orders/history`, {
      headers: { Authorization: `Bearer ${user.token}` }
    })
      .then((response) => (response.ok ? response.json() : []))
      .then((data) => {
        if (cancelled) return;
        const mapped = data.map(mapBackendOrder);
        setOrders(mapped);
        setActiveTrackingOrder(mapped[0] || null);
      })
      .catch(() => {});

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
    if (dashboardTab !== 'routes') {
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

        const latestResponse = await fetch(`${API_BASE}/api/ros/latest`, { headers: authHeaders });
        if (latestResponse.ok) {
          const latestData = await latestResponse.json();
          if (!cancelled) {
            setRosLatestRoute(latestData);
          }
        } else if (!cancelled) {
          setRosLatestRoute(null);
        }
      } catch (error) {
        if (!cancelled) {
          setRosError(error.message || 'Unable to load Route Optimization dashboard');
          setRosDashboard(null);
          setRosLatestRoute(null);
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
      setSelectedWarehouseTracking(null);
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
    if (dashboardTab !== 'driver' || !driverVerified || !user?.token) {
      return;
    }

    let cancelled = false;

    const loadDriverDashboard = async () => {
      setDriverLoading(true);
      setDriverError('');

      try {
        const response = await fetch(`${API_BASE}/api/tracking/dashboard`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });

        if (!response.ok) {
          throw new Error(`Driver manifest request failed with ${response.status}`);
        }

        const data = await response.json();
        if (!cancelled) {
          setDriverDashboard(data);
        }
      } catch (error) {
        if (!cancelled) {
          setDriverDashboard(null);
          setDriverError(error.message || 'Unable to load driver manifest');
        }
      } finally {
        if (!cancelled) {
          setDriverLoading(false);
        }
      }
    };

    loadDriverDashboard();

    return () => {
      cancelled = true;
    };
  }, [dashboardTab, driverVerified, user]);

  useEffect(() => {
    if (dashboardTab !== 'driver' || !user?.token || !selectedDelivery?.orderNumber) {
      return;
    }

    let cancelled = false;

    const loadDeliveryDetails = async () => {
      setSelectedDeliveryLoading(true);
      setSelectedDeliveryError('');
      setSelectedDeliveryTracking(null);
      setSelectedDeliveryOrder(null);

      try {
        const authHeaders = { Authorization: `Bearer ${user.token}` };
        const [trackingResponse, orderResponse] = await Promise.all([
          fetch(`${API_BASE}/api/tracking/${selectedDelivery.orderNumber}`, { headers: authHeaders }),
          fetch(`${API_BASE}/api/orders/status/${selectedDelivery.orderNumber}`, { headers: authHeaders })
        ]);

        if (!trackingResponse.ok) {
          throw new Error(`Tracking detail request failed with ${trackingResponse.status}`);
        }

        const trackingData = await trackingResponse.json();
        const orderData = orderResponse.ok ? await orderResponse.json() : null;

        if (!cancelled) {
          setSelectedDeliveryTracking(trackingData);
          setSelectedDeliveryOrder(orderData);
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
  }, [dashboardTab, selectedDelivery, user]);

  useEffect(() => {
    return () => {
      if (podPhotoPreviewUrl) {
        URL.revokeObjectURL(podPhotoPreviewUrl);
      }
    };
  }, [podPhotoPreviewUrl]);

  const rosSummaryMetrics = rosDashboard
    ? [
        { label: 'Routes Generated', value: String(rosDashboard.routesGenerated), tone: 'primary' },
        { label: 'Vehicles', value: String(rosDashboard.vehicleCount), tone: 'completed' },
        { label: 'Drivers', value: String(rosDashboard.driverCount), tone: 'completed' },
        { label: 'Optimization Time', value: `${((rosDashboard.avgOptimizationTimeMs ?? 0) / 1000).toFixed(2)}s`, tone: 'pending' }
      ]
    : [];

  const rosEventLog = rosDashboard?.recentEvents ?? [];
  const rosRouteQueue = rosDashboard?.recentRoutes ?? [];
  const rosVehicleStatus = rosDashboard?.vehicleStatus ?? [];
  const rosConnected = rosDashboard?.connected ?? false;

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
  const wmsStatusValue = wmsStatus?.status || 'UNKNOWN';
  const wmsStatusBadge = wmsStatusValue === 'ONLINE'
    ? 'badge-completed'
    : wmsStatusValue === 'OFFLINE'
      ? 'badge-failed'
      : 'badge-pending';
  const driverPackages = (driverDashboard?.packages || []).filter((pkg) =>
    ['LOADED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'].includes(pkg.status)
  );
  const driverStats = {
    todaysDeliveries: driverPackages.length,
    remaining: driverPackages.filter((pkg) => pkg.status === 'LOADED' || pkg.status === 'OUT_FOR_DELIVERY').length,
    inProgress: driverPackages.filter((pkg) => pkg.status === 'OUT_FOR_DELIVERY').length,
    completed: driverPackages.filter((pkg) => pkg.status === 'DELIVERED' || pkg.status === 'FAILED').length
  };
  const selectedOrderInfo = selectedDeliveryOrder || orders.find((order) => order.id === selectedDelivery?.orderNumber) || {};
  const currentDeliveryStatus = selectedDeliveryTracking?.status || selectedDelivery?.status;
  const deliveryProgress = getDeliveryProgress(currentDeliveryStatus);
  const mapAddress = selectedOrderInfo.recipientAddress || selectedOrderInfo.deliveryAddress;
  const mapsHref = mapAddress ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapAddress)}` : '';
  const bestDeliveryLocation = mapAddress
    || selectedDeliveryTracking?.currentLocation
    || selectedDelivery?.currentLocation
    || '';
  const canConfirmPod = Boolean(podPhotoFile && podSignatureDrawn && !deliveryActionLoading);
  const canConfirmFailure = Boolean(failureReason && !deliveryActionLoading);

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
      setDashboardTab('overview');
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
      setDashboardTab('overview');
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

      // Add notification
      const newNotification = {
        id: Date.now(),
        title: 'Order Submitted',
        desc: `New order ${newOrderId} has been created and is pending validation.`,
        time: 'Just now',
        type: 'order',
        unread: true
      };
      setNotifications([newNotification, ...notifications]);

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
  const handleTrackSubmit = (e) => {
    e.preventDefault();
    const found = orders.find(o => o.id.toLowerCase() === trackingSearchTerm.trim().toLowerCase());
    if (found) {
      setActiveTrackingOrder(found);
    } else {
      alert(`Order number ${trackingSearchTerm} not found. Try one from the order history list (e.g. ST-902148).`);
    }
  };

  const handleDriverLoginSubmit = (e) => {
    e.preventDefault();
    if (!driverLoginId.trim() || !driverPassword.trim()) {
      setDriverLoginError('Driver ID and password are required for this prototype access screen.');
      return;
    }

    // Prototype-only frontend gate: real driver authentication belongs to the Driver backend owner.
    writeSessionValue(DRIVER_VERIFIED_SESSION_KEY, 'true');
    writeSessionValue(DRIVER_ID_SESSION_KEY, driverLoginId.trim());
    setDriverId(driverLoginId.trim());
    setDriverVerified(true);
    setDriverLoginError('');
    setDriverLoginId('');
    setDriverPassword('');
  };

  const handleDriverLogout = () => {
    removeSessionValue(DRIVER_VERIFIED_SESSION_KEY);
    removeSessionValue(DRIVER_ID_SESSION_KEY);
    setDriverVerified(false);
    setDriverId('');
    setDriverLoginId('');
    setDriverPassword('');
    setDriverLoginError('');
    setSelectedDelivery(null);
    setSelectedDeliveryTracking(null);
    setSelectedDeliveryOrder(null);
    setPodOpen(false);
    setFailureOpen(false);
  };

  const refreshDriverDashboard = async () => {
    if (!user?.token) {
      return null;
    }

    const response = await fetch(`${API_BASE}/api/tracking/dashboard`, {
      headers: { Authorization: `Bearer ${user.token}` }
    });

    if (!response.ok) {
      throw new Error(`Driver manifest request failed with ${response.status}`);
    }

    const data = await response.json();
    setDriverDashboard(data);
    setSelectedDelivery((current) => {
      if (!current) {
        return current;
      }
      return (data.packages || []).find((pkg) => pkg.orderNumber === current.orderNumber) || current;
    });
    return data;
  };

  const refreshSelectedDeliveryDetails = async () => {
    if (!user?.token || !selectedDelivery?.orderNumber) {
      return;
    }

    const authHeaders = { Authorization: `Bearer ${user.token}` };
    const [trackingResponse, orderResponse] = await Promise.all([
      fetch(`${API_BASE}/api/tracking/${selectedDelivery.orderNumber}`, { headers: authHeaders }),
      fetch(`${API_BASE}/api/orders/status/${selectedDelivery.orderNumber}`, { headers: authHeaders })
    ]);

    if (!trackingResponse.ok) {
      throw new Error(`Tracking detail request failed with ${trackingResponse.status}`);
    }

    setSelectedDeliveryTracking(await trackingResponse.json());
    setSelectedDeliveryOrder(orderResponse.ok ? await orderResponse.json() : null);
  };

  const updateDeliveryStatus = async ({ status, location, description, loadingKey }) => {
    if (!user?.token || !selectedDelivery?.orderNumber) {
      return;
    }

    setDeliveryActionLoading(loadingKey);
    setDeliveryActionError('');

    try {
      const response = await fetch(`${API_BASE}/api/tracking/${selectedDelivery.orderNumber}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify({ status, location, description })
      });

      const bodyText = await response.text();
      if (!response.ok) {
        throw new Error(bodyText || `Tracking update failed with ${response.status}`);
      }

      await refreshSelectedDeliveryDetails();
      await refreshDriverDashboard();
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

  const handleConfirmDelivery = async () => {
    if (!podPhotoFile || !podSignatureDrawn) {
      setPodValidationError('Delivery photo and customer signature are required.');
      return;
    }

    const note = podNote.trim();
    const description = note
      ? `Package delivered successfully with proof of delivery - ${note}`
      : 'Package delivered successfully with proof of delivery';

    try {
      await updateDeliveryStatus({
        status: 'DELIVERED',
        location: bestDeliveryLocation,
        description,
        loadingKey: 'delivered'
      });
      clearPodState();
    } catch {
      // Error state is shown in the delivery details panel.
    }
  };

  const handleConfirmFailure = async () => {
    if (!failureReason) {
      setFailureValidationError('Failure reason is required.');
      return;
    }

    const note = failureNote.trim();
    const description = note
      ? `Delivery failed: ${failureReason} - ${note}`
      : `Delivery failed: ${failureReason}`;

    try {
      await updateDeliveryStatus({
        status: 'FAILED',
        location: bestDeliveryLocation,
        description,
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

  const markAllNotificationsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  // Compute stats counters
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending' || o.status === 'Warehouse' || o.status === 'Route Generated').length;
  const deliveredOrdersCount = orders.filter(o => o.status === 'Delivered').length;
  const failedOrdersCount = orders.filter(o => o.status === 'Failed').length;

  // Filter and Sort orders
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'All') return matchesSearch;
    return matchesSearch && o.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'Newest') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'Oldest') return new Date(a.date) - new Date(b.date);
    if (sortBy === 'Weight') return b.weight - a.weight;
    return 0;
  });

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
              <h2>Welcome Back</h2>
              <p style={{ marginTop: '4px' }}>Sign in to your client portal</p>
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
                {loginSubmitting ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

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
        <div className="dashboard-layout">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="sidebar-logo">
              <a href="#" className="logo" onClick={() => setCurrentScreen('landing')}>
                <LogoIcon />
                <span>SwiftTrack</span>
              </a>
            </div>

            <ul className="sidebar-menu">
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
              <li>
                <div
                  className={`sidebar-item ${dashboardTab === 'warehouse' ? 'active' : ''}`}
                  onClick={() => setDashboardTab('warehouse')}
                >
                  <ShieldCheckIcon />
                  <span>Warehouse</span>
                </div>
              </li>
              <li>
                <div
                  className={`sidebar-item ${dashboardTab === 'driver' ? 'active' : ''}`}
                  onClick={() => setDashboardTab('driver')}
                >
                  <TruckIcon />
                  <span>Driver Portal</span>
                </div>
              </li>
              {user.role === 'ADMIN' && (
                <>
                  <li>
                    <div
                      className={`sidebar-item ${dashboardTab === 'cms' ? 'active' : ''}`}
                      onClick={() => setDashboardTab('cms')}
                    >
                      <CmsIcon />
                      <span>CMS Integration</span>
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
          </aside>

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
                                  ord.status === 'Delivered' ? 'completed' :
                                  ord.status === 'Failed' ? 'failed' :
                                  ord.status === 'Pending' ? 'pending' : 'transit'
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
                              </tr>
                            </thead>
                            <tbody>
                              {warehousePackages.length === 0 ? (
                                <tr>
                                  <td colSpan="5" className="warehouse-empty-cell">
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
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
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
                        ) : selectedWarehouseTracking?.history?.length ? (
                          <div className="warehouse-timeline">
                            {selectedWarehouseTracking.history.map((item) => (
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
                {!driverVerified ? (
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
                          <div className="driver-map-placeholder">
                            <div className="driver-map-node">Warehouse</div>
                            <div className="driver-map-path"></div>
                            <div className="driver-map-node destination">{mapAddress || 'Recipient address unavailable'}</div>
                          </div>
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
                ) : (
                  <div className="driver-portal">
                    <header className="driver-header">
                      <div>
                        <h1>Driver Dashboard</h1>
                        <p>Driver {driverId || 'Portal'} delivery manifest</p>
                      </div>
                      <button className="btn btn-secondary" onClick={handleDriverLogout}>
                        Driver Logout
                      </button>
                    </header>

                    {driverLoading && <div className="card">Loading driver manifest...</div>}
                    {driverError && <div className="card" style={{ color: 'var(--status-failed)' }}>{driverError}</div>}

                    <div className="driver-stats-grid">
                      {[
                        { label: "Today's Deliveries", value: driverStats.todaysDeliveries },
                        { label: 'Remaining', value: driverStats.remaining },
                        { label: 'In Progress', value: driverStats.inProgress },
                        { label: 'Completed', value: driverStats.completed }
                      ].map((metric) => (
                        <div className="card driver-stat-card" key={metric.label}>
                          <span>{metric.label}</span>
                          <strong>{metric.value}</strong>
                        </div>
                      ))}
                    </div>

                    <div className="card driver-manifest-card">
                      <div className="cms-panel-header compact">
                        <div>
                          <h3>Today's Deliveries</h3>
                          <p>Loaded, out-for-delivery, delivered, and failed packages from tracking</p>
                        </div>
                      </div>

                      <div className="driver-manifest-list">
                        {driverPackages.length === 0 ? (
                          <div className="driver-empty-state">No deliveries assigned for today</div>
                        ) : (
                          driverPackages.map((pkg) => (
                            <div className="driver-package-card" key={pkg.orderNumber}>
                              <div>
                                <div className="driver-package-id">{pkg.packageId}</div>
                                <div className="driver-package-meta">{pkg.orderNumber}</div>
                                <div className="driver-package-meta">{pkg.currentLocation || 'Current location not available'}</div>
                              </div>
                              <div className="driver-package-actions">
                                <span className={`badge ${getWarehouseStatusBadge(pkg.status)}`}>
                                  {toWarehouseStatusLabel(pkg.status)}
                                </span>
                                <button className="btn btn-primary" onClick={() => {
                                  clearPodState();
                                  clearFailureState();
                                  setDeliveryActionError('');
                                  setSelectedDelivery(pkg);
                                }}>
                                  View Delivery
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: LIVE ORDER TRACKING */}
            {dashboardTab === 'tracking' && (
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

            {/* TAB 5: CMS INTEGRATION (staff/admin only) */}
            {user.role === 'ADMIN' && dashboardTab === 'cms' && (
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
            {user.role === 'ADMIN' && dashboardTab === 'routes' && (
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
                            <h3>Optimized Route</h3>
                            <p>Map visualization, delivery sequence, and driver assignment for the latest generated route</p>
                          </div>
                          <span className={`badge ${rosConnected ? 'badge-completed' : 'badge-failed'}`}>{rosConnected ? 'Connected' : 'Disconnected'}</span>
                        </div>

                        {rosLatestRoute ? (
                          <>
                            <div className="ros-route-path">
                              <div className="ros-route-stop">
                                <span className="ros-route-stop-label">{rosLatestRoute.pickupAddress}</span>
                                <span className="ros-route-stop-dot"></span>
                              </div>
                              <div className="ros-route-line"></div>
                              <div className="ros-route-stop">
                                <span className="ros-route-stop-label">{rosLatestRoute.deliveryAddress}</span>
                                <span className="ros-route-stop-dot"></span>
                              </div>
                            </div>

                            <div className="cms-preview-grid">
                              <div className="cms-preview-card">
                                <div className="cms-preview-label">Delivery Sequence</div>
                                <pre>{`1. Pickup — ${rosLatestRoute.pickupAddress}\n2. Deliver — ${rosLatestRoute.deliveryAddress}`}</pre>
                              </div>
                              <div className="cms-preview-card">
                                <div className="cms-preview-label">Driver Assignment</div>
                                <pre>{`Driver: ${rosLatestRoute.driverName}\nVehicle: ${rosLatestRoute.vehiclePlate} (${rosLatestRoute.vehicleType})`}</pre>
                              </div>
                            </div>

                            <div className="cms-response-panel">
                              <div className="cms-preview-label">Route Summary</div>
                              <div className="cms-response-message">
                                <strong>
                                  Traffic:{' '}
                                  <span className={`badge ${
                                    rosLatestRoute.trafficLevel === 'LOW' ? 'badge-completed' :
                                    rosLatestRoute.trafficLevel === 'HIGH' ? 'badge-failed' : 'badge-pending'
                                  }`}>{rosLatestRoute.trafficLevel}</span>
                                </strong>
                                <span>
                                  {rosLatestRoute.distanceKm} km · {rosLatestRoute.durationMinutes} min estimated ·
                                  optimized in {rosLatestRoute.optimizationTimeMs} ms for order {rosLatestRoute.orderNumber}
                                </span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="cms-response-panel">
                            <div className="cms-preview-label">Route Summary</div>
                            <div className="cms-response-message">
                              <span>No route generated yet.</span>
                            </div>
                          </div>
                        )}
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
