import type { LucideIcon } from 'lucide-react';
import {
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown,
  ChevronRight, ChevronLeft, ChevronUp, ChevronDown,
  Plus, Minus, X, Check, Search, Filter,
  Edit, Trash2, Copy, Download, Upload, Share2, ExternalLink, RefreshCw,
  CheckCircle, CheckCircle2, XCircle, AlertCircle, AlertTriangle, Info,
  Menu, Eye, EyeOff, Settings, Bell, Home,
  User, Users, Mail, Phone, MapPin,
  Calendar, Clock, Star, Heart, ThumbsUp,
  ShoppingCart, CreditCard, DollarSign, TrendingUp, TrendingDown,
  BarChart3, FileText, Folder,
  Code, Globe, Lock, Zap, Rocket, Send, MessageCircle, Image, Play,
  Bookmark, Tag, Flag, Award, Gift, Briefcase, Building2,
  Wifi, Cloud, Database, Shield, Key, LogOut, LogIn,
} from 'lucide-react';

/**
 * Icon registry for dynamic icon resolution.
 * Only Button and Timeline use dynamic AI-generated icon names.
 * All other components import specific icons directly.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  // Navigation
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown,
  ChevronRight, ChevronLeft, ChevronUp, ChevronDown,

  // Actions
  Plus, Minus, X, Check, Search, Filter,
  Edit, Trash2, Copy, Download, Upload, Share2, ExternalLink, RefreshCw,

  // Status / Feedback
  CheckCircle, CheckCircle2, XCircle, AlertCircle, AlertTriangle, Info,

  // UI
  Menu, Eye, EyeOff, Settings, Bell, Home,

  // People / Contact
  User, Users, Mail, Phone, MapPin,

  // Time
  Calendar, Clock,

  // Emotion / Rating
  Star, Heart, ThumbsUp,

  // Commerce / Business
  ShoppingCart, CreditCard, DollarSign, TrendingUp, TrendingDown,
  Bookmark, Tag, Flag, Award, Gift, Briefcase, Building2,

  // Data
  BarChart3, FileText, Folder,

  // Tech
  Code, Globe, Lock, Zap, Rocket, Send, MessageCircle, Image, Play,
  Wifi, Cloud, Database, Shield, Key, LogOut, LogIn,
};

/** Resolve a Lucide icon name to its component. Returns null if not found. */
export function resolveIcon(name?: string): LucideIcon | null {
  if (!name) return null;
  return ICON_MAP[name] ?? null;
}
