import { useState } from 'react';
import './App.css';

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

const INITIAL_ORDERS = [
  {
    id: 'ST-902148',
    date: '2026-07-26',
    pickupAddress: '142 Tech Parkway, Boston MA',
    receiverName: 'Apex Distributors',
    receiverPhone: '617-555-0182',
    deliveryAddress: '890 Commerce Way, New York NY',
    packageType: 'Pallet',
    weight: 480.0,
    priority: 'Express',
    status: 'Out for Delivery',
    driver: 'Marcus Vance',
    vehicle: 'Volvo VNL Truck (TRK-982)',
    notes: 'Fragile industrial components.',
    history: [
      { status: 'Pending', time: '08:30 AM' },
      { status: 'Warehouse', time: '10:15 AM' },
      { status: 'Route Generated', time: '11:00 AM' },
      { status: 'Loaded', time: '01:45 PM' },
      { status: 'Out for Delivery', time: '03:10 PM' }
    ]
  },
  {
    id: 'ST-881290',
    date: '2026-07-25',
    pickupAddress: '72 Logistics Blvd, Chicago IL',
    receiverName: 'BioHealth Labs',
    receiverPhone: '312-555-0144',
    deliveryAddress: '55 Medical Plaza, Miami FL',
    packageType: 'Parcel',
    weight: 12.5,
    priority: 'Overnight',
    status: 'Delivered',
    driver: 'Elena Rostova',
    vehicle: 'Freightliner M2 (TRK-441)',
    notes: 'Temperature-controlled medical supplies.',
    history: [
      { status: 'Pending', time: 'Jul 25, 09:00 AM' },
      { status: 'Warehouse', time: 'Jul 25, 11:20 AM' },
      { status: 'Route Generated', time: 'Jul 25, 12:40 PM' },
      { status: 'Loaded', time: 'Jul 25, 03:00 PM' },
      { status: 'Out for Delivery', time: 'Jul 25, 05:15 PM' },
      { status: 'Delivered', time: 'Jul 25, 07:30 PM' }
    ]
  },
  {
    id: 'ST-719402',
    date: '2026-07-24',
    pickupAddress: '88 Ocean Port Dr, Seattle WA',
    receiverName: 'Pacific Retailers',
    receiverPhone: '206-555-0199',
    deliveryAddress: '1205 Retail Row, Los Angeles CA',
    packageType: 'Freight',
    weight: 1250.0,
    priority: 'Standard',
    status: 'Warehouse',
    driver: 'John Miller',
    vehicle: 'Peterbilt 579 (TRK-208)',
    notes: 'Bulk retail inventory.',
    history: [
      { status: 'Pending', time: 'Jul 24, 02:30 PM' },
      { status: 'Warehouse', time: 'Jul 24, 05:15 PM' }
    ]
  },
  {
    id: 'ST-651029',
    date: '2026-07-23',
    pickupAddress: '411 Industrial Way, Dallas TX',
    receiverName: 'Dynamic Machining',
    receiverPhone: '214-555-0177',
    deliveryAddress: '900 Factory Rd, Houston TX',
    packageType: 'Document',
    weight: 1.2,
    priority: 'Standard',
    status: 'Failed',
    driver: 'David Kim',
    vehicle: 'Ford Transit Van (VAN-115)',
    notes: 'Legal contracts for signature.',
    history: [
      { status: 'Pending', time: 'Jul 23, 10:00 AM' },
      { status: 'Warehouse', time: 'Jul 23, 11:30 AM' },
      { status: 'Route Generated', time: 'Jul 23, 01:00 PM' },
      { status: 'Loaded', time: 'Jul 23, 02:30 PM' },
      { status: 'Out for Delivery', time: 'Jul 23, 04:00 PM' },
      { status: 'Failed', time: 'Jul 23, 06:30 PM' }
    ]
  }
];

function App() {
  // Navigation Screens: 'landing', 'login', 'register', 'dashboard'
  const [currentScreen, setCurrentScreen] = useState('landing');
  
  // Dashboard Sub-tabs: 'overview', 'create', 'history', 'tracking', 'notifications', 'profile'
  const [dashboardTab, setDashboardTab] = useState('overview');

  // Authenticated user state
  const [user, setUser] = useState({
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@acmecorp.com',
    company: 'Acme Industries Ltd',
    role: 'Client Portal Manager'
  });

  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regCompany, setRegCompany] = useState('');

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

  // Mock Database of Orders
  const [orders, setOrders] = useState(INITIAL_ORDERS);

  // Tracking details active order state
  const [activeTrackingOrder, setActiveTrackingOrder] = useState(INITIAL_ORDERS[0]);

  // Notifications state
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Route Optimized', desc: 'ROS successfully computed optimal route for ST-902148.', time: '10 mins ago', type: 'route', unread: true },
    { id: 2, title: 'Driver Assigned', desc: 'Marcus Vance was assigned to order ST-902148.', time: '1 hour ago', type: 'driver', unread: true },
    { id: 3, title: 'Package Received', desc: 'Warehouse Hub A received package for ST-719402.', time: 'Yesterday', type: 'wms', unread: false },
    { id: 4, title: 'Delivery Completed', desc: 'Order ST-881290 has been successfully delivered to Miami.', time: '2 days ago', type: 'delivery', unread: false }
  ]);

  // Count unread notifications
  const unreadCount = notifications.filter(n => n.unread).length;

  // Handle Login submission
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Please fill in all fields.');
      return;
    }
    // Simulate auth
    setUser({
      name: loginEmail.split('@')[0].replace('.', ' '),
      email: loginEmail,
      company: 'Logistics Partner Corp',
      role: 'Client Manager'
    });
    setLoginError('');
    setCurrentScreen('dashboard');
    setDashboardTab('overview');
  };

  // Handle Register submission
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim() || !regCompany.trim()) {
      return;
    }
    setUser({
      name: regName,
      email: regEmail,
      company: regCompany,
      role: 'Client Manager'
    });
    setCurrentScreen('dashboard');
    setDashboardTab('overview');
  };

  // Handle new order submission
  const handleCreateOrderSubmit = (e) => {
    e.preventDefault();
    if (!pickupAddress.trim() || !receiverName.trim() || !receiverPhone.trim() || !deliveryAddress.trim() || !weight) {
      alert('Please fill out all required fields.');
      return;
    }

    const newOrderId = `ST-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder = {
      id: newOrderId,
      date: new Date().toISOString().split('T')[0],
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
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                Sign In
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
              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '8px' }}>
                Register Account
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
                      <button type="submit" className="btn btn-primary">
                        Submit Order Payload
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

            {/* TAB 5: NOTIFICATIONS */}
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

            {/* TAB 6: PROFILE */}
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
