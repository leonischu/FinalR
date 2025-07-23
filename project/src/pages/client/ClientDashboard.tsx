"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Camera,
  Calendar,
  MapPin,
  Palette,
  User,
  Search,
  Bell,
  Menu,
  X,
  Heart,
  Star,
  Filter,
  Grid,
  List,
  Plus,
  ChevronRight,
  Award,
  Clock,
  MessageSquare,
  Settings,
  LogOut,
  TrendingUp,
  Shield,
  Bookmark,
  Phone,
  ChevronDown,
  ArrowRight,
  Package,
  CreditCard,
  Activity,
  Eye,
  Download,
  Share2,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { useNavigate, Link, useLocation, Outlet } from "react-router-dom"
import { photographerService } from "../../services/photographerService"
// @ts-ignore
import { venueService } from "../../services/venueService"
// @ts-ignore
import { makeupArtistService } from "../../services/makeupArtistService"
// @ts-ignore
import { catererService } from "../../services/catererService"
// @ts-ignore
import { decoratorService } from "../../services/decoratorService"
import type { Photographer } from "../../services/photographerService"
// @ts-ignore
import * as bookingService from "../../services/bookingService"
import api from "../../services/api"
import { FileUpload } from "../../components/FileUpload"
import { paymentService } from "../../services/paymentService"

const getFirstAndLastName = (name: string | undefined) => {
  if (!name) return { firstName: "", lastName: "" }
  const parts = name.split(" ")
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
  }
}

const ClientDashboard = () => {

  const { user, logout, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [verifyingPayment, setVerifyingPayment] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"success" | "failed" | null>(null)
  const [paymentMessage, setPaymentMessage] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [viewMode, setViewMode] = useState("grid")
  const location = useLocation()
  const [activeTab, setActiveTab] = useState("dashboard")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [logoutModal, setLogoutModal] = useState(false)
  const [logoutError, setLogoutError] = useState("")
  const [loading, setLoading] = useState(false)
  const [photographers, setPhotographers] = useState<Photographer[]>([])
  const [venues, setVenues] = useState<any[]>([])
  const [makeupArtists, setMakeupArtists] = useState<any[]>([])
  const [caterers, setCaterers] = useState<any[]>([])
  const [decorators, setDecorators] = useState<any[]>([])
  const [photographersLoading, setPhotographersLoading] = useState(false)
  const [venuesLoading, setVenuesLoading] = useState(false)
  const [makeupArtistsLoading, setMakeupArtistsLoading] = useState(false)
  const [caterersLoading, setCaterersLoading] = useState(false)
  const [decoratorsLoading, setDecoratorsLoading] = useState(false)
  const [photographersError, setPhotographersError] = useState("")
  const [venuesError, setVenuesError] = useState("")
  const [makeupArtistsError, setMakeupArtistsError] = useState("")
  const [caterersError, setCaterersError] = useState("")
  const [decoratorsError, setDecoratorsError] = useState("")
  const [bookings, setBookings] = useState<any[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [bookingsError, setBookingsError] = useState("")
  const [bookingStatusFilter, setBookingStatusFilter] = useState("All")
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null)
  const [rescheduleForm, setRescheduleForm] = useState<{ date: string; time: string }>({ date: "", time: "" })
  const [rescheduleLoading, setRescheduleLoading] = useState(false)
  const [rescheduleError, setRescheduleError] = useState("")
  const [cancelLoadingId, setCancelLoadingId] = useState<string | null>(null)
  const [cancelError, setCancelError] = useState("")
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profileUpdating, setProfileUpdating] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [paymentLoadingId, setPaymentLoadingId] = useState<string | null>(null)

  // Add state for profile fields
  const [profileFields, setProfileFields] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
  })

  useEffect(() => {
    const currentPath = location.pathname.split("/").pop() || "dashboard"
    setActiveTab(currentPath)
  }, [location])

  // Enhanced payment verification useEffect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const pidx = params.get("pidx")
    const paymentParam = params.get("payment")
    const tabParam = params.get("tab")

    // Handle Khalti return with pidx
    if (pidx) {
      setVerifyingPayment(true)
      setPaymentStatus(null)
      setPaymentMessage("Verifying payment...")

      paymentService
        .verifyKhaltiPayment(pidx)
        .then((res) => {
          if (res?.success) {

            setPaymentStatus("success")
            setPaymentMessage("Payment successful! Your booking has been confirmed.")
            navigate('/dashboard')
            // Update booking status in local state
            if (res.data?.booking) {
              setBookings((prev) =>
                prev.map((booking) =>
                  booking.id === res.data?.booking?.id
                    ? { ...booking, status: "confirmed_paid", paymentStatus: "paid" }
                    : booking,
                ),
              )
            }

navigate('/dashboard')
            // Switch to bookings tab
            setActiveTab("bookings")
          } else {
            setPaymentStatus("failed")
            setPaymentMessage(res.message || "Payment verification failed. Please contact support.")
          }
        })
        .catch((err) => {
          setPaymentStatus("failed")
          setPaymentMessage("Payment verification failed. Please try again or contact support.")
          console.error("Payment verification error:", err)
        })
        .finally(() => {
          setVerifyingPayment(false)
          // Clean up URL parameters
          const url = new URL(window.location.href)
          url.searchParams.delete("pidx")
          url.searchParams.delete("payment")
          url.searchParams.delete("tab")
          window.history.replaceState({}, document.title, url.pathname)
        })
    }
    // Handle direct payment status parameters
    else if (paymentParam) {
      if (paymentParam === "success") {
        setPaymentStatus("success")
        setPaymentMessage("Payment completed successfully!")
      } else if (paymentParam === "failed") {
        setPaymentStatus("failed")
        setPaymentMessage("Payment was cancelled or failed. Please try again.")
      }

      // Switch to bookings tab if specified
      if (tabParam === "bookings") {
        setActiveTab("bookings")
      }

      // Clean up URL parameters
      const url = new URL(window.location.href)
      url.searchParams.delete("payment")
      url.searchParams.delete("tab")
      window.history.replaceState({}, document.title, url.pathname)
    }
  }, [])

  // Auto-hide payment status after 5 seconds
  useEffect(() => {
    if (paymentStatus) {
      const timer = setTimeout(() => {
        setPaymentStatus(null)
        setPaymentMessage("")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [paymentStatus])

  useEffect(() => {
    if (selectedCategory === "photographer") {
      setPhotographersLoading(true)
      setPhotographersError("")
      photographerService
        .searchPhotographers({ search: searchQuery })
        .then((data: any) => {
          setPhotographers(data.photographers || [])
        })
        .catch((err: any) => {
          setPhotographersError("Failed to load photographers.")
        })
        .finally(() => setPhotographersLoading(false))
    } else if (selectedCategory === "venue") {
      setVenuesLoading(true)
      venueService.searchVenues
        ? venueService
            .searchVenues({ search: searchQuery })
            .then((data: any) => {
              setVenues(data.venues || [])
            })
            .catch((err: any) => {
              setVenuesError("Failed to load venues.")
            })
            .finally(() => setVenuesLoading(false))
        : setVenuesLoading(false)
    } else if (selectedCategory === "makeup") {
      setMakeupArtistsLoading(true)
      makeupArtistService.searchMakeupArtists
        ? makeupArtistService
            .searchMakeupArtists({ search: searchQuery })
            .then((data: any) => {
              setMakeupArtists(data.makeupArtists || [])
            })
            .catch((err: any) => {
              setMakeupArtistsError("Failed to load makeup artists.")
            })
            .finally(() => setMakeupArtistsLoading(false))
        : setMakeupArtistsLoading(false)
    } else if (selectedCategory === "catering") {
      setCaterersLoading(true)
      catererService.searchCaterers
        ? catererService
            .searchCaterers({ search: searchQuery })
            .then((data: any) => {
              setCaterers(data.caterers || [])
            })
            .catch((err: any) => {
              setCaterersError("Failed to load caterers.")
            })
            .finally(() => setCaterersLoading(false))
        : setCaterersLoading(false)
    } else if (selectedCategory === "decorator") {
      setDecoratorsLoading(true)
      decoratorService
        .searchDecorators({ search: searchQuery })
        .then((data: any) => {
          setDecorators(data.decorators || [])
        })
        .catch((err: any) => {
          setDecoratorsError("Failed to load decorators.")
        })
        .finally(() => setDecoratorsLoading(false))
    }
  }, [selectedCategory, searchQuery])

  useEffect(() => {
    setBookingsLoading(true)
    setBookingsError("")
    bookingService
      .getBookings()
      .then((data: any) => {
        setBookings(Array.isArray(data) ? data : data.bookings || [])
      })
      .catch((err: any) => {
        setBookingsError("Failed to load bookings.")
      })
      .finally(() => setBookingsLoading(false))
  }, [])

  useEffect(() => {
    if (
      profileFields.firstName === "" &&
      profileFields.lastName === "" &&
      profileFields.phone === ""
    ) {
      setProfileFields({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        phone: user?.phone || "",
      })
    }
  }, [user])

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center text-lg text-slate-500">Loading...</div>
  }

  const { firstName, lastName } = getFirstAndLastName(user?.name)
  const profileImage = user?.profileImage || "/default-avatar.png"

  const categories = [
    { id: "all", name: "All Services", icon: <Grid className="w-5 h-5" />, count: 362 },
    { id: "photographer", name: "Photography", icon: <Camera className="w-5 h-5" />, count: 156 },
    { id: "venue", name: "Venues", icon: <MapPin className="w-5 h-5" />, count: 89 },
    { id: "makeup", name: "Makeup & Beauty", icon: <Palette className="w-5 h-5" />, count: 72 },
    { id: "catering", name: "Catering", icon: <Package className="w-5 h-5" />, count: 45 },
    { id: "decorator", name: "Decorators", icon: <Award className="w-5 h-5" />, count: 30 },
  ]

  const featuredServices = [
    {
      id: 1,
      name: "Royal Photography Studio",
      category: "Wedding Photography",
      rating: 4.9,
      reviews: 127,
      price: "Rs. 50,000",
      originalPrice: "Rs. 65,000",
      image: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=300&fit=crop",
      verified: true,
      featured: true,
      discount: 23,
      tags: ["Premium", "Same Day Delivery"],
      photographer: "Rajesh Kumar",
      experience: "8+ years",
    },
    {
      id: 2,
      name: "Himalayan Grand Venue",
      category: "Wedding Venue",
      rating: 4.8,
      reviews: 89,
      price: "Rs. 200,000",
      originalPrice: "Rs. 250,000",
      image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&h=300&fit=crop",
      verified: true,
      featured: false,
      discount: 20,
      tags: ["Luxury", "Garden View"],
      capacity: "500 guests",
      location: "Kathmandu",
    },
    {
      id: 3,
      name: "Glam Beauty Studio",
      category: "Bridal Makeup",
      rating: 4.7,
      reviews: 156,
      price: "Rs. 15,000",
      originalPrice: "Rs. 20,000",
      image: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=300&fit=crop",
      verified: true,
      featured: true,
      discount: 25,
      tags: ["Trending", "Home Service"],
      artist: "Sunita Thapa",
      speciality: "Bridal Makeup",
    },
    {
      id: 4,
      name: "Everest Catering Services",
      category: "Premium Catering",
      rating: 4.6,
      reviews: 78,
      price: "Rs. 800/plate",
      originalPrice: "Rs. 1,000/plate",
      image: "https://images.unsplash.com/photo-1555244162-803834f70033?w=400&h=300&fit=crop",
      verified: true,
      featured: false,
      discount: 20,
      tags: ["Authentic", "Multi-cuisine"],
      minOrder: "50 plates",
      chef: "Ram Bahadur",
    },
  ]

  const upcomingBookings = [
    {
      id: 1,
      service: "Royal Photography Studio",
      date: "2024-01-15",
      time: "10:00 AM",
      status: "confirmed",
      amount: "Rs. 50,000",
      location: "Kathmandu",
      contact: "+977-9801234567",
    },
    {
      id: 2,
      service: "Himalayan Grand Venue",
      date: "2024-01-20",
      time: "6:00 PM",
      status: "pending",
      amount: "Rs. 200,000",
      location: "Bhaktapur",
      contact: "+977-9801234568",
    },
    {
      id: 3,
      service: "Glam Beauty Studio",
      date: "2024-01-25",
      time: "2:00 PM",
      status: "confirmed",
      amount: "Rs. 15,000",
      location: "Home Service",
      contact: "+977-9801234569",
    },
  ]

  const dashboardStats = [
    { label: "Total Bookings", value: "12", change: "+2", trend: "up", icon: Calendar },
    { label: "Total Spent", value: "Rs. 485K", change: "+15%", trend: "up", icon: CreditCard },
    { label: "Saved Services", value: "8", change: "+3", trend: "up", icon: Heart },
    { label: "Active Chats", value: "4", change: "-1", trend: "down", icon: MessageSquare },
  ]

  const recentActivity = [
    { type: "booking", message: "Booking confirmed with Royal Photography Studio", time: "2 hours ago" },
    { type: "message", message: "New message from Himalayan Grand Venue", time: "4 hours ago" },
    { type: "favorite", message: 'Added "Everest Catering" to favorites', time: "1 day ago" },
    { type: "review", message: "Review posted for Glam Beauty Studio", time: "2 days ago" },
  ]

  const navigationItems = [
    { id: "dashboard", name: "Dashboard", icon: <Activity className="w-5 h-5" />, path: "/client-dashboard" },
    { id: "browse", name: "Browse Services", icon: <Search className="w-5 h-5" />, path: "/client-dashboard/browse" },
    { id: "bookings", name: "My Bookings", icon: <Calendar className="w-5 h-5" />, path: "/client-dashboard/bookings" },
    { id: "favorites", name: "Favorites", icon: <Heart className="w-5 h-5" />, path: "/client-dashboard/favorites" },
    { id: "messages", name: "Messages", icon: <MessageSquare className="w-5 h-5" />, path: "/client-dashboard/messages" },
    { id: "profile", name: "Profile", icon: <User className="w-5 h-5" />, path: "/client-dashboard/profile" },
  ]

  const favoriteServices = [
    { id: 1, name: "Royal Photography Studio", category: "Photography", rating: 4.9, price: "Rs. 50,000" },
    { id: 2, name: "Himalayan Grand Venue", category: "Venue", rating: 4.8, price: "Rs. 200,000" },
    { id: 3, name: "Glam Beauty Studio", category: "Makeup", rating: 4.7, price: "Rs. 15,000" },
    { id: 4, name: "Everest Catering Services", category: "Catering", rating: 4.6, price: "Rs. 800/plate" },
  ]

  const messages = [
    {
      id: 1,
      sender: "Royal Photography Studio",
      message: "Your booking is confirmed for Jan 15th",
      time: "2 hours ago",
      unread: true,
    },
    {
      id: 2,
      sender: "Himalayan Grand Venue",
      message: "Thank you for your interest. We'd love to discuss...",
      time: "4 hours ago",
      unread: true,
    },
    {
      id: 3,
      sender: "Glam Beauty Studio",
      message: "Your makeup trial is scheduled for tomorrow",
      time: "1 day ago",
      unread: false,
    },
    {
      id: 4,
      sender: "Support Team",
      message: "How was your experience with our service?",
      time: "2 days ago",
      unread: false,
    },
  ]

  const statusMap: Record<string, string[]> = {
    Pending: ["pending_provider_confirmation", "pending_modification", "modification_requested"],
    Confirmed: ["confirmed_awaiting_payment"],
    Paid: ["confirmed_paid"],
    "In Progress": ["in_progress"],
    Completed: ["completed"],
    Cancelled: ["cancelled_by_client", "cancelled_by_provider", "rejected", "refunded"],
  }

  // Enhanced payment handler
  const handlePayment = async (bookingId: string) => {
    setPaymentLoadingId(bookingId)
    try {
      const res = await paymentService.initializeKhaltiPayment(bookingId)
      const paymentUrl = res?.data?.paymentUrl
      if (paymentUrl) {
        // Store booking ID for later reference
        sessionStorage.setItem("pendingPaymentBookingId", bookingId)
        window.location.href = paymentUrl
      } else {
        setPaymentStatus("failed")
        setPaymentMessage("Failed to initialize payment. Please try again.")
      }
    } catch (err: any) {
      setPaymentStatus("failed")
      setPaymentMessage(err.message || "Failed to initialize payment. Please try again.")
    } finally {
      setPaymentLoadingId(null)
    }
  }

  const DashboardTab = () => (
    <div className="space-y-8">
      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-3">Welcome back, {firstName}!</h2>
            <p className="text-blue-100 text-lg">Ready to plan your perfect event?</p>
            <div className="mt-6 flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-sm font-medium">Premium Member</span>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                <span className="text-sm font-medium">Level 3</span>
              </div>
            </div>
          </div>
          <div className="hidden md:block relative">
            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Calendar className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-2">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl group-hover:from-blue-100 group-hover:to-purple-100 transition-colors">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex items-center">
                <TrendingUp className={`w-4 h-4 mr-2 ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`} />
                <span className={`text-sm font-semibold ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                  {stat.change}
                </span>
                <span className="text-slate-500 text-sm ml-2">from last month</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Enhanced Action Cards */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-bold mb-6 text-slate-800 flex items-center">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></div>
            Quick Actions
          </h3>
          <div className="space-y-4">
            <button className="w-full group flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-slate-800">New Booking</span>
              </div>
              <ArrowRight className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full group flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-600 rounded-lg group-hover:scale-110 transition-transform">
                  <Search className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-slate-800">Browse Services</span>
              </div>
              <ArrowRight className="w-5 h-5 text-purple-600 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full group flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all duration-300 hover:shadow-md">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-600 rounded-lg group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-slate-800">Contact Support</span>
              </div>
              <ArrowRight className="w-5 h-5 text-green-600 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-bold mb-6 text-slate-800 flex items-center">
            <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-teal-500 rounded-full mr-3"></div>
            Recent Activity
          </h3>
          <div className="space-y-5">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-4 group">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2 flex-shrink-0 group-hover:scale-125 transition-transform"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-700 mb-1">{activity.message}</p>
                  <p className="text-xs text-slate-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Upcoming Bookings */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-slate-800 flex items-center">
            <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-red-500 rounded-full mr-3"></div>
            Upcoming Bookings
          </h3>
          <button className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">View All</button>
        </div>
        <div className="space-y-6">
          {upcomingBookings.slice(0, 2).map((booking) => (
            <div
              key={booking.id}
              className="group flex items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl hover:from-blue-50 hover:to-purple-50 transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-center space-x-6">
                <div
                  className={`w-4 h-4 rounded-full ${booking.status === "confirmed" ? "bg-green-500" : "bg-yellow-500"} group-hover:scale-125 transition-transform`}
                />
                <div>
                  <div className="font-bold text-slate-800 mb-1">{booking.service}</div>
                  <div className="text-sm text-slate-600 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {booking.date} at {booking.time}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg text-slate-800 mb-1">{booking.amount}</div>
                <span
                  className={`px-4 py-2 rounded-full text-xs font-semibold ${booking.status === "confirmed" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                >
                  {booking.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const BrowseTab = () => (
    <div className="space-y-8">
      {/* Enhanced Search Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search photographers, venues, makeup artists..."
              className="pl-12 pr-4 py-4 border border-slate-300 rounded-xl w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-3 px-6 py-4 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span className="font-medium">Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
            <div className="flex items-center space-x-2 bg-slate-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 rounded-lg transition-all ${viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:bg-slate-200"}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 rounded-lg transition-all ${viewMode === "list" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:bg-slate-200"}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {showFilters && (
          <div className="mt-8 p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Price Range</label>
                <select className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>All Prices</option>
                  <option>Under Rs. 25,000</option>
                  <option>Rs. 25,000 - Rs. 50,000</option>
                  <option>Rs. 50,000 - Rs. 100,000</option>
                  <option>Above Rs. 100,000</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Rating</label>
                <select className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>All Ratings</option>
                  <option>4.5+ Stars</option>
                  <option>4.0+ Stars</option>
                  <option>3.5+ Stars</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Location</label>
                <select className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option>All Locations</option>
                  <option>Kathmandu</option>
                  <option>Lalitpur</option>
                  <option>Bhaktapur</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Category Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`group bg-white rounded-2xl shadow-sm border p-6 text-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
              selectedCategory === category.id
                ? "ring-2 ring-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg"
                : "border-slate-200 hover:border-blue-200"
            }`}
          >
            <div
              className={`flex justify-center mb-4 ${
                selectedCategory === category.id ? "text-blue-600" : "text-slate-600 group-hover:text-blue-600"
              } transition-colors`}
            >
              {category.icon}
            </div>
            <div className="font-semibold text-slate-800 mb-2">{category.name}</div>
            <div className="text-sm text-slate-500">{category.count} available</div>
          </button>
        ))}
      </div>

      {/* Enhanced Services Section */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-4"></div>
            {selectedCategory === "photographer"
              ? "Photographers"
              : selectedCategory === "venue"
                ? "Venues"
                : selectedCategory === "makeup"
                  ? "Makeup Artists"
                  : selectedCategory === "catering"
                    ? "Caterers"
                    : selectedCategory === "decorator"
                      ? "Decorators"
                      : "Featured Services"}
          </h2>
          <button className="text-blue-600 font-semibold hover:text-blue-700 flex items-center space-x-2 transition-colors">
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Service Loading/Error States - Dynamic for all categories */}
        {selectedCategory === "photographer" ? (
          photographersLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : photographersError ? (
            <div className="text-center text-red-500 py-12 bg-red-50 rounded-2xl">{photographersError}</div>
          ) : photographers.length === 0 ? (
            <div className="text-center text-slate-500 py-12 bg-slate-50 rounded-2xl">No photographers found.</div>
          ) : (
            <div className={`grid gap-8 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
              {photographers.map((photographer: any) => (
                <ServiceCard
                  key={photographer.id}
                  service={{
                    id: photographer.id,
                    name: photographer.businessName || photographer.user?.name,
                    category: "Photography",
                    rating: photographer.rating,
                    reviews: photographer.totalReviews,
                    price: photographer.hourlyRate ? `Rs. ${photographer.hourlyRate}` : undefined,
                    image: photographer.profileImage || photographer.user?.profileImage || "/default-avatar.png",
                    verified: photographer.user?.userType === "photographer",
                    tags: photographer.specializations,
                    photographer: photographer.user?.name,
                    experience: photographer.experience,
                  }}
                />
              ))}
            </div>
          )
        ) : selectedCategory === "venue" ? (
          venuesLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : venuesError ? (
            <div className="text-center text-red-500 py-12 bg-red-50 rounded-2xl">{venuesError}</div>
          ) : venues.length === 0 ? (
            <div className="text-center text-slate-500 py-12 bg-slate-50 rounded-2xl">No venues found.</div>
          ) : (
            <div className={`grid gap-8 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
              {venues.map((venue: any) => (
                <ServiceCard
                  key={venue.id}
                  service={{
                    id: venue.id,
                    name: venue.businessName || venue.user?.name,
                    category: "Venue",
                    rating: venue.rating,
                    reviews: venue.totalReviews,
                    price:
                      venue.pricePerHour && Number(venue.pricePerHour) > 0
                        ? `Rs. ${venue.pricePerHour}/hr`
                        : "Contact for pricing",
                    image: venue.image || venue.profileImage || venue.user?.profileImage || "/default-avatar.png",
                    verified: venue.user?.userType === "venue",
                    tags: venue.specializations,
                    location: venue.location?.name,
                    capacity: venue.capacity,
                  }}
                />
              ))}
            </div>
          )
        ) : selectedCategory === "makeup" ? (
          makeupArtistsLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : makeupArtistsError ? (
            <div className="text-center text-red-500 py-12 bg-red-50 rounded-2xl">{makeupArtistsError}</div>
          ) : makeupArtists.length === 0 ? (
            <div className="text-center text-slate-500 py-12 bg-slate-50 rounded-2xl">No makeup artists found.</div>
          ) : (
            <div className={`grid gap-8 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
              {makeupArtists.map((artist: any) => (
                <ServiceCard
                  key={artist.id}
                  service={{
                    id: artist.id,
                    name: artist.businessName || artist.user?.name,
                    category: "Makeup",
                    rating: artist.rating,
                    reviews: artist.totalReviews,
                    price:
                      artist.session_rate && Number(artist.session_rate) > 0
                        ? `Rs. ${artist.session_rate}/session`
                        : artist.bridal_package_rate && Number(artist.bridal_package_rate) > 0
                          ? `Rs. ${artist.bridal_package_rate} (Bridal)`
                          : "Contact for pricing",
                    image: artist.image || artist.profileImage || artist.user?.profileImage || "/default-avatar.png",
                    verified: artist.user?.userType === "makeupArtist",
                    tags: artist.specializations,
                    artist: artist.user?.name,
                    experience: artist.experience,
                  }}
                />
              ))}
            </div>
          )
        ) : selectedCategory === "catering" ? (
          caterersLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : caterersError ? (
            <div className="text-center text-red-500 py-12 bg-red-50 rounded-2xl">{caterersError}</div>
          ) : caterers.length === 0 ? (
            <div className="text-center text-slate-500 py-12 bg-slate-50 rounded-2xl">No caterers found.</div>
          ) : (
            <div className={`grid gap-8 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
              {caterers.map((caterer: any) => (
                <ServiceCard
                  key={caterer.id}
                  service={{
                    id: caterer.id,
                    name: caterer.businessName || caterer.user?.name,
                    category: "Catering",
                    rating: caterer.rating,
                    reviews: caterer.totalReviews,
                    price:
                      caterer.pricePerPerson && Number(caterer.pricePerPerson) > 0
                        ? `Rs. ${caterer.pricePerPerson}/plate`
                        : "Contact for pricing",
                    image: caterer.image || caterer.profileImage || caterer.user?.profileImage || "/default-avatar.png",
                    verified: caterer.user?.userType === "caterer",
                    tags: caterer.specializations,
                    chef: caterer.user?.name,
                    experience: caterer.experience,
                  }}
                />
              ))}
            </div>
          )
        ) : selectedCategory === "decorator" ? (
          decoratorsLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : decoratorsError ? (
            <div className="text-center text-red-500 py-12 bg-red-50 rounded-2xl">{decoratorsError}</div>
          ) : decorators.length === 0 ? (
            <div className="text-center text-slate-500 py-12 bg-slate-50 rounded-2xl">No decorators found.</div>
          ) : (
            <div className={`grid gap-8 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
              {decorators.map((decorator: any) => (
                <ServiceCard
                  key={decorator.id}
                  service={{
                    id: decorator.id,
                    name: decorator.businessName || decorator.user?.name,
                    category: "Decorator",
                    rating: decorator.rating,
                    reviews: decorator.totalReviews,
                    price: decorator.hourlyRate ? `Rs. ${decorator.hourlyRate}` : undefined,
                    image: decorator.image || decorator.profileImage || decorator.user?.profileImage || "/default-avatar.png",
                    verified: decorator.user?.userType === "decorator",
                    tags: decorator.specializations,
                    experience: decorator.experience,
                  }}
                />
              ))}
            </div>
          )
        ) : (
          // For 'all' or any other category, keep using featuredServices
          <div className={`grid gap-8 ${viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"}`}>
            {featuredServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  )

  const BookingsTab = () => {
    // Filter bookings by status using the statusMap
    const filteredBookings =
      bookingStatusFilter === "All"
        ? bookings
        : bookings.filter((b) => statusMap[bookingStatusFilter]?.includes(b.status))

    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-slate-800 flex items-center">
            <div className="w-1 h-10 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-4"></div>
            My Bookings
          </h2>
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl flex items-center space-x-3 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5">
            <Plus className="w-5 h-5" />
            <span className="font-semibold">New Booking</span>
          </button>
        </div>

        {/* Enhanced Status Filter */}
        <div className="flex flex-wrap gap-3">
          {["All", "Confirmed", "Pending", "Paid", "In Progress", "Completed", "Cancelled"].map((status) => (
            <button
              key={status}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                status === bookingStatusFilter
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300"
              }`}
              onClick={() => setBookingStatusFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Enhanced Booking Cards */}
        {bookingsLoading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        ) : bookingsError ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <X className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-red-800 font-medium">{bookingsError}</div>
            </div>
          </div>
        ) : (
          <div className="grid gap-8">
            {filteredBookings.map((booking) => {
              const canCancel = ["pending_provider_confirmation", "confirmed_awaiting_payment"].includes(booking.status)
              const canPay = booking.status === "confirmed_awaiting_payment" && booking.paymentStatus !== "paid"
              const canReschedule = [
                "pending_provider_confirmation",
                "modification_requested",
                "confirmed_awaiting_payment",
                "confirmed_paid",
              ].includes(booking.status)
              const canAcceptModification = booking.status === "modification_requested"
              const canRaiseDispute = booking.status === "in_progress"

              return (
                <div
                  key={booking.id}
                  className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start space-x-6">
                      <div
                        className={`w-5 h-5 rounded-full mt-1 ${
                          booking.status === "confirmed"
                            ? "bg-green-500"
                            : booking.status === "confirmed_paid"
                              ? "bg-blue-500"
                              : booking.status === "completed"
                                ? "bg-blue-500"
                                : booking.status === "cancelled"
                                  ? "bg-red-500"
                                  : "bg-yellow-500"
                        } group-hover:scale-125 transition-transform`}
                      />
                      <div>
                        <div className="text-xl font-bold text-slate-800 mb-3">
                          {booking.service || booking.serviceName || booking.packageName}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                              <Clock className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-slate-600 font-medium">
                              {booking.date || booking.eventDate} at {booking.time || booking.eventTime}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-purple-50 rounded-lg">
                              <MapPin className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="text-slate-600 font-medium">
                              {booking.location || booking.eventLocation}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-green-50 rounded-lg">
                              <Phone className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-slate-600 font-medium">
                              {booking.contact || booking.providerContact || "-"}
                            </span>
                          </div>
                        </div>
                        {booking.eventType && (
                          <div className="flex items-center space-x-3 mt-3">
                            <div className="p-2 bg-orange-50 rounded-lg">
                              <Award className="w-4 h-4 text-orange-600" />
                            </div>
                            <span className="text-slate-600 font-medium">{booking.eventType}</span>
                          </div>
                        )}
                        {booking.specialRequests && (
                          <div className="flex items-center space-x-3 mt-3">
                            <div className="p-2 bg-pink-50 rounded-lg">
                              <MessageSquare className="w-4 h-4 text-pink-600" />
                            </div>
                            <span className="text-slate-600 font-medium">{booking.specialRequests}</span>
                          </div>
                        )}
                        {booking.packageName && (
                          <div className="flex items-center space-x-3 mt-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                              <Package className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="text-slate-600 font-medium">{booking.packageName}</span>
                          </div>
                        )}
                        {booking.paymentStatus && (
                          <div className="flex items-center space-x-3 mt-3">
                            <div className="p-2 bg-green-50 rounded-lg">
                              <CreditCard className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-slate-600 font-medium">Payment: {booking.paymentStatus}</span>
                          </div>
                        )}
                        {booking.id && (
                          <div className="flex items-center space-x-3 mt-3">
                            <div className="p-2 bg-slate-100 rounded-lg">
                              <Bookmark className="w-4 h-4 text-slate-500" />
                            </div>
                            <span className="text-slate-600 font-medium">Booking ID: {booking.id}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-slate-800 mb-2">
                        {booking.amount || booking.totalAmount}
                      </div>
                      <span
                        className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "confirmed_paid"
                              ? "bg-blue-100 text-blue-800"
                              : booking.status === "completed"
                                ? "bg-blue-100 text-blue-800"
                                : booking.status === "cancelled"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {booking.status === "confirmed_paid" ? "Paid" : booking.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                    <div className="flex items-center space-x-6">
                      <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
                        <MessageSquare className="w-5 h-5" />
                        <span>Message</span>
                      </button>
                      <button className="flex items-center space-x-2 text-slate-600 hover:text-slate-700 font-medium transition-colors">
                        <Download className="w-5 h-5" />
                        <span>Download</span>
                      </button>
                    </div>
                    <div className="flex items-center space-x-3">
                      {canReschedule && (
                        <button
                          className="px-6 py-2 text-sm font-medium border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                          onClick={() => {
                            setEditingBookingId(booking.id)
                            setRescheduleForm({
                              date: booking.date || booking.eventDate || "",
                              time: booking.time || booking.eventTime || "",
                            })
                            setRescheduleError("")
                          }}
                          disabled={rescheduleLoading && editingBookingId === booking.id}
                        >
                          Reschedule
                        </button>
                      )}
                      {canCancel && (
                        <button
                          className="px-6 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          onClick={async () => {
                            const reason = window.prompt("Please provide a reason for cancellation:")
                            if (!reason) return
                            setCancelLoadingId(booking.id)
                            setCancelError("")
                            try {
                              await bookingService.cancelBooking(booking.id, reason)
                              setBookings((prev) =>
                                prev.map((b) => (b.id === booking.id ? { ...b, status: "cancelled_by_client" } : b)),
                              )
                            } catch (err: any) {
                              setCancelError(err.message || "Failed to cancel booking")
                            } finally {
                              setCancelLoadingId(null)
                            }
                          }}
                          disabled={cancelLoadingId === booking.id}
                        >
                          {cancelLoadingId === booking.id ? "Cancelling..." : "Cancel"}
                        </button>
                      )}
                      {canPay && (
                        <button
                          className="px-6 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                          onClick={() => handlePayment(booking.id)}
                          disabled={paymentLoadingId === booking.id}
                        >
                          {paymentLoadingId === booking.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              <span>Processing...</span>
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-4 h-4" />
                              <span>Pay Now</span>
                            </>
                          )}
                        </button>
                      )}
                      {canAcceptModification && (
                        <>
                          <button
                            className="px-6 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            onClick={() => {
                              // Implement accept modification logic
                            }}
                            disabled={rescheduleLoading}
                          >
                            Accept Modification
                          </button>
                          <button
                            className="px-6 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            onClick={() => {
                              // Implement reject modification logic
                            }}
                            disabled={rescheduleLoading}
                          >
                            Reject Modification
                          </button>
                        </>
                      )}
                      {canRaiseDispute && (
                        <button
                          className="px-6 py-2 text-sm font-medium bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                          onClick={() => {
                            // Implement raise dispute logic
                          }}
                          disabled={rescheduleLoading}
                        >
                          Raise Dispute
                        </button>
                      )}
                    </div>
                  </div>
                  {editingBookingId === booking.id && (
                    <form
                      className="flex flex-col md:flex-row gap-3 mt-4"
                      onSubmit={async (e) => {
                        e.preventDefault()
                        setRescheduleLoading(true)
                        setRescheduleError("")
                        try {
                          await bookingService.updateBooking(booking.id, {
                            eventDate: rescheduleForm.date,
                            eventTime: rescheduleForm.time,
                          })
                          // Update local state
                          setBookings((prev) =>
                            prev.map((b) =>
                              b.id === booking.id
                                ? {
                                    ...b,
                                    eventDate: rescheduleForm.date,
                                    eventTime: rescheduleForm.time,
                                    date: rescheduleForm.date,
                                    time: rescheduleForm.time,
                                  }
                                : b,
                            ),
                          )
                          setEditingBookingId(null)
                        } catch (err: any) {
                          setRescheduleError(err.message || "Failed to reschedule booking")
                        } finally {
                          setRescheduleLoading(false)
                        }
                      }}
                    >
                      <input
                        type="date"
                        className="p-2 border rounded-lg"
                        value={rescheduleForm.date}
                        onChange={(e) => setRescheduleForm((f) => ({ ...f, date: e.target.value }))}
                        required
                      />
                      <input
                        type="time"
                        className="p-2 border rounded-lg"
                        value={rescheduleForm.time}
                        onChange={(e) => setRescheduleForm((f) => ({ ...f, time: e.target.value }))}
                        required
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        disabled={rescheduleLoading}
                      >
                        {rescheduleLoading ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                        onClick={() => setEditingBookingId(null)}
                        disabled={rescheduleLoading}
                      >
                        Cancel
                      </button>
                      {rescheduleError && <div className="text-red-600 text-sm mt-2">{rescheduleError}</div>}
                    </form>
                  )}
                </div>
              )
            })}
            {!filteredBookings.length && (
              <div className="text-center py-16 text-slate-400">No bookings found for this status.</div>
            )}
          </div>
        )}
      </div>
    )
  }

  const FavoritesTab = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center">
          <div className="w-1 h-10 bg-gradient-to-b from-red-500 to-pink-500 rounded-full mr-4"></div>
          My Favorites
        </h2>
        <span className="text-slate-500 bg-slate-100 px-4 py-2 rounded-xl font-medium">
          {favoriteServices.length} saved services
        </span>
      </div>
      <div className="grid gap-6">
        {favoriteServices.map((service) => (
          <div
            key={service.id}
            className="group bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="p-3 bg-red-50 rounded-xl">
                  <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-800 mb-1">{service.name}</div>
                  <div className="text-sm text-slate-600 font-medium">{service.category}</div>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <div className="flex items-center space-x-2 mb-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-semibold">{service.rating}</span>
                  </div>
                  <div className="text-xl font-bold text-blue-600">{service.price}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="px-6 py-3 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5">
                    Book Now
                  </button>
                  <button className="p-3 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const MessagesTab = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center">
          <div className="w-1 h-10 bg-gradient-to-b from-green-500 to-teal-500 rounded-full mr-4"></div>
          Messages
        </h2>
        <div className="flex items-center space-x-3 bg-blue-50 px-4 py-2 rounded-xl">
          <Bell className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-semibold text-blue-600">2 unread messages</span>
        </div>
      </div>
      <div className="grid gap-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`group bg-white rounded-2xl shadow-sm border p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
              message.unread
                ? "border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-white"
                : "border-slate-200"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-6">
                <div
                  className={`w-4 h-4 rounded-full mt-2 ${message.unread ? "bg-blue-500" : "bg-slate-300"} group-hover:scale-125 transition-transform`}
                />
                <div>
                  <div className="text-xl font-bold text-slate-800 mb-2">{message.sender}</div>
                  <div className="text-slate-600 mb-3 leading-relaxed">{message.message}</div>
                  <div className="text-sm text-slate-500 font-medium">{message.time}</div>
                </div>
              </div>
              <button className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-xl transition-colors">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const ProfileTab = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center">
          <div className="w-1 h-10 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full mr-4"></div>
          Profile Settings
        </h2>
        <button
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5"
          onClick={handleProfileUpdate}
          disabled={profileUpdating}
        >
          {profileUpdating ? "Saving..." : "Save Changes"}
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></div>
            Personal Information
          </h3>
          <div className="space-y-6">
            {/* Profile image upload */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Profile Image</label>
              <FileUpload
                onFilesSelected={(files) => setProfileImageFile(files[0] || null)}
                maxSize={5}
                multiple={false}
                label="Change Profile Image"
                placeholder="Click to select or drag and drop"
                disabled={profileUpdating}
              />
              {profileImageFile && <div className="mt-2 text-sm text-slate-600">Selected: {profileImageFile.name}</div>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">First Name</label>
              <input
                type="text"
                name="firstName"
                className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={profileFields.firstName}
                onChange={handleProfileFieldsChange}
                disabled={profileUpdating}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Last Name</label>
              <input
                type="text"
                name="lastName"
                className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={profileFields.lastName}
                onChange={handleProfileFieldsChange}
                disabled={profileUpdating}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Email</label>
              <input
                type="email"
                className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={user?.email || ""}
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Phone</label>
              <input
                type="tel"
                name="phone"
                className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={profileFields.phone}
                onChange={handleProfileFieldsChange}
                disabled={profileUpdating}
              />
            </div>
          </div>
          {profileError && <div className="text-red-600 mt-4">{profileError}</div>}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 hover:shadow-lg transition-shadow">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
            <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-teal-500 rounded-full mr-3"></div>
            Preferences
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Preferred Location</label>
              <select className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all">
                <option>Kathmandu</option>
                <option>Lalitpur</option>
                <option>Bhaktapur</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">Budget Range</label>
              <select className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all">
                <option>Rs. 25,000 - Rs. 50,000</option>
                <option>Rs. 50,000 - Rs. 100,000</option>
                <option>Rs. 100,000+</option>
              </select>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">Notifications</label>
              <div className="space-y-4">
                <label className="flex items-center p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    className="mr-4 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    defaultChecked
                  />
                  <span className="text-sm font-medium text-slate-600">Email notifications</span>
                </label>
                <label className="flex items-center p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    className="mr-4 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    defaultChecked
                  />
                  <span className="text-sm font-medium text-slate-600">SMS notifications</span>
                </label>
                <label className="flex items-center p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                  <input type="checkbox" className="mr-4 w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                  <span className="text-sm font-medium text-slate-600">Marketing emails</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const Sidebar = () => (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-72 bg-white transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r border-slate-200 shadow-xl lg:shadow-none`}
    >
      <div className="flex items-center justify-between h-20 px-8 border-b border-slate-200">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Swornim
          </span>
        </div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden text-slate-500 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-8">
        <div className="flex items-center space-x-4 mb-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
          <img
            src={profileImage || "/placeholder.svg"}
            alt={user?.username}
            className="w-16 h-16 rounded-2xl border-2 border-white shadow-lg object-cover"
          />
          <div>
            <div className="text-lg font-bold text-slate-800">
              {firstName} {lastName}
            </div>
            <div className="text-sm text-slate-600 capitalize flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {user?.role} account
            </div>
          </div>
        </div>

        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <Link
              to={item.path}
              key={item.id}
              onClick={() => {
                setActiveTab(item.id)
                setSidebarOpen(false) // Close sidebar on mobile after clicking a link
              }}
              className={`w-full flex items-center px-6 py-4 rounded-xl transition-all duration-300 group ${
                activeTab === item.id
                  ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 shadow-lg border-r-4 border-blue-600"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <div
                className={`p-2 rounded-lg mr-4 ${
                  activeTab === item.id ? "bg-blue-100" : "bg-slate-100 group-hover:bg-slate-200"
                } transition-colors`}
              >
                {item.icon}
              </div>
              <span className="font-semibold">{item.name}</span>
              {activeTab === item.id && <ChevronRight className="w-5 h-5 ml-auto" />}
            </Link>
          ))}
        </nav>

        <div className="mt-10 pt-8 border-t border-slate-200">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 mb-6 border border-yellow-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-800">Premium Member</h4>
              <Award className="w-6 h-6 text-yellow-500" />
            </div>
            <p className="text-sm text-slate-600 mb-4">Get 20% off on all premium services</p>
            <button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 px-4 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-300 hover:-translate-y-0.5">
              Upgrade Now
            </button>
          </div>
          <button className="w-full flex items-center px-6 py-4 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors mb-3">
            <div className="p-2 bg-slate-100 rounded-lg mr-4">
              <Settings className="w-5 h-5" />
            </div>
            <span className="font-semibold">Settings</span>
          </button>
          <button
            className="w-full flex items-center px-6 py-4 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
            onClick={() => setLogoutModal(true)}
            disabled={loading}
          >
            <div className="p-2 bg-red-100 rounded-lg mr-4">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="font-semibold">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Enhanced Logout Modal */}
      {logoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-slate-800">Confirm Logout</h2>
            <p className="mb-8 text-slate-600">Are you sure you want to log out of your account?</p>
            {logoutError && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl">{logoutError}</div>}
            <div className="flex justify-end gap-4">
              <button
                className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold transition-colors"
                onClick={() => setLogoutModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="px-6 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 font-semibold transition-colors"
                onClick={handleLogout}
                disabled={loading}
              >
                {loading ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const ServiceCard = ({ service }: { service: any }) => (
    <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 overflow-hidden hover:-translate-y-2">
      <div className="relative overflow-hidden">
        <img
          src={service.image || "/placeholder.svg"}
          alt={service.name}
          className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {service.featured && (
          <div className="absolute top-4 left-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm shadow-lg">
              ⭐ Featured
            </span>
          </div>
        )}
        {service.discount && (
          <div className="absolute top-4 right-4">
            <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              {service.discount}% OFF
            </span>
          </div>
        )}
        <button className="absolute bottom-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:bg-white group-hover:scale-110">
          <Heart className="w-6 h-6 text-slate-600 hover:text-red-500 transition-colors" />
        </button>
      </div>

      <div className="p-8">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2 text-slate-800 group-hover:text-blue-600 transition-colors">
              {service.name}
            </h3>
            <p className="text-sm text-slate-500 mb-3 font-medium">{service.category}</p>
            <div className="flex flex-wrap gap-2">
              {service.tags?.slice(0, 2).map((tag: string, index: number) => (
                <span
                  key={index}
                  className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 px-3 py-1 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          {service.verified && (
            <div className="bg-green-100 p-2 rounded-full">
              <Award className="w-5 h-5 text-green-600" />
            </div>
          )}
        </div>

        <div className="flex items-center space-x-6 mb-6">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-bold text-slate-700">{service.rating}</span>
            <span className="text-sm text-slate-500">({service.reviews})</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-500">
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">{Math.floor(Math.random() * 50) + 10} views</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="text-2xl font-bold text-blue-600">{service.price}</div>
            {service.originalPrice && (
              <div className="text-sm text-slate-400 line-through">{service.originalPrice}</div>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5">
            Book Now
          </button>
          <button className="p-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
          <button className="p-3 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>

        {/* View Details Links */}
        {service.category === "Photography" && service.id && (
          <Link
            to={`/photographers/${service.id}`}
            className="block text-center text-blue-600 font-semibold hover:text-blue-700 mt-4 p-2 hover:bg-blue-50 rounded-lg transition-colors"
          >
            View Details
          </Link>
        )}
        {service.category === "Venue" && service.id && (
          <Link
            to={`/serviceprovider/venue/${service.id}`}
            className="block text-center text-blue-600 font-semibold hover:text-blue-700 mt-4 p-2 hover:bg-blue-50 rounded-lg transition-colors"
          >
            View Details
          </Link>
        )}
        {service.category === "Makeup" && service.id && (
          <Link
            to={`/serviceprovider/makeupartist/${service.id}`}
            className="block text-center text-blue-600 font-semibold hover:text-blue-700 mt-4 p-2 hover:bg-blue-50 rounded-lg transition-colors"
          >
            View Details
          </Link>
        )}
        {service.category === "Catering" && service.id && (
          <Link
            to={`/serviceprovider/caterer/${service.id}`}
            className="block text-center text-blue-600 font-semibold hover:text-blue-700 mt-4 p-2 hover:bg-blue-50 rounded-lg transition-colors"
          >
            View Details
          </Link>
        )}
        {service.category === "Decorator" && service.id && (
          <Link
            to={`/serviceprovider/decorator/${service.id}`}
            className="block text-center text-blue-600 font-semibold hover:text-blue-700 mt-4 p-2 hover:bg-blue-50 rounded-lg transition-colors"
          >
            View Details
          </Link>
        )}
      </div>
    </div>
  )

  const handleLogout = async () => {
    setLoading(true)
    setLogoutError("")
    try {
      await logout()
      navigate("/login")
    } catch (err: any) {
      setLogoutError("Logout failed. Please try again.")
    } finally {
      setLoading(false)
      setLogoutModal(false)
    }
  }

  // Handler for file selection (to be passed to FileUpload component)
  const handleProfileImageSelect = (file: File) => {
    setProfileImageFile(file)
  }

  // Handler to upload/update profile image
  const handleProfileImageUpload = async () => {
    if (!profileImageFile || !user) return
    setProfileUpdating(true)
    setProfileError(null)
    try {
      const formData = new FormData()
      formData.append("profileImage", profileImageFile)
      await api.put(`/users/${user.id}`, formData)
      await refreshUser()
      setProfileImageFile(null)
    } catch (err: any) {
      setProfileError("Failed to update profile image.")
    } finally {
      setProfileUpdating(false)
    }
  }

  // Handler for profile field changes
  const handleProfileFieldsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setProfileFields((prev) => ({ ...prev, [name]: value }))
  }

  // Handler to update profile (fields + image)
  const handleProfileUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!user) return
    setProfileUpdating(true)
    setProfileError(null)
    try {
      const formData = new FormData()
      formData.append("name", `${profileFields.firstName} ${profileFields.lastName}`.trim())
      formData.append("phone", profileFields.phone)
      if (profileImageFile) {
        formData.append("profileImage", profileImageFile)
      }
      await api.put(`/users/${user.id}`, formData)
      await refreshUser()
      setProfileImageFile(null)
    } catch (err: any) {
      setProfileError("Failed to update profile.")
    } finally {
      setProfileUpdating(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-40 p-3 bg-white rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-all"
        >
          <Menu className="w-6 h-6 text-slate-600" />
        </button>

        {/* Enhanced Payment Status Notification */}
        {(verifyingPayment || paymentStatus) && (
          <div className="fixed top-4 right-4 z-50 max-w-md">
            <div
              className={`rounded-2xl shadow-2xl border p-6 backdrop-blur-sm transition-all duration-500 ${
                verifyingPayment
                  ? "bg-blue-50 border-blue-200"
                  : paymentStatus === "success"
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-start space-x-4">
                <div
                  className={`p-2 rounded-xl ${
                    verifyingPayment ? "bg-blue-100" : paymentStatus === "success" ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  {verifyingPayment ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                  ) : paymentStatus === "success" ? (
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4
                    className={`font-bold mb-2 ${
                      verifyingPayment
                        ? "text-blue-800"
                        : paymentStatus === "success"
                          ? "text-green-800"
                          : "text-red-800"
                    }`}
                  >
                    {verifyingPayment
                      ? "Processing Payment"
                      : paymentStatus === "success"
                        ? "Payment Successful!"
                        : "Payment Failed"}
                  </h4>
                  <p
                    className={`text-sm ${
                      verifyingPayment
                        ? "text-blue-700"
                        : paymentStatus === "success"
                          ? "text-green-700"
                          : "text-red-700"
                    }`}
                  >
                    {paymentMessage}
                  </p>
                </div>
                {!verifyingPayment && (
                  <button
                    onClick={() => {
                      setPaymentStatus(null)
                      setPaymentMessage("")
                    }}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <Outlet
          context={{
            DashboardTab,
            BrowseTab,
            BookingsTab,
            FavoritesTab,
            MessagesTab,
            ProfileTab,
            user,
            loading,
            logout,
          }}
        />
      </main>
    </div>
  )
}

export default ClientDashboard
