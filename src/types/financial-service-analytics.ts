// F2: Types for Service Sales Analytics

export interface ServiceRankingItem {
  service_id: string;
  service_name: string;
  appointment_count: number;
  total_revenue: number;
  avg_revenue_per_appointment: number;
  revenue_share_percent: number;
}

export interface ServiceRankingReport {
  start_date: string;
  end_date: string;
  sort_by: string;
  items: ServiceRankingItem[];
  total_revenue: number;
  total_appointments: number;
}

export interface ServiceTrendPoint {
  period_label: string;
  period_start: string;
  period_end: string;
  appointment_count: number;
  total_revenue: number;
}

export interface ServiceTrendReport {
  start_date: string;
  end_date: string;
  granularity: string;
  service_id?: string | null;
  service_name?: string;
  points: ServiceTrendPoint[];
}

export interface ServicePeriodData {
  period: string;
  count: number;
  revenue: number;
}

export interface ServiceByPeriodItem {
  service_id: string;
  service_name: string;
  data: ServicePeriodData[];
}

export interface ServiceByPeriodReport {
  granularity: string;
  periods: string[];
  services: ServiceByPeriodItem[];
}

export interface WeekdayData {
  weekday: number;
  weekday_name: string;
  count: number;
  revenue: number;
}

export interface ServiceWeekdayPattern {
  service_id: string;
  service_name: string;
  by_weekday: WeekdayData[];
}

export interface ServiceWeekdayPatternReport {
  items: ServiceWeekdayPattern[];
}
