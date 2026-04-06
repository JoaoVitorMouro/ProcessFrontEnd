/* ─── API Wrapper ──────────────────────────────────────────────── */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    data: T[];
    links: {
      first: string | null;
      last: string | null;
      prev: string | null;
      next: string | null;
    };
    meta: {
      current_page: number;
      from: number | null;
      last_page: number;
      path: string;
      per_page: number;
      to: number | null;
      total: number;
      links: {
        url: string | null;
        label: string;
        page: number | null;
        active: boolean;
      }[];
    };
  };
}

/* ─── Area ─────────────────────────────────────────────────────── */
export interface Area {
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  processes_count?: number;
  all_processes_count?: number;
  processes?: Process[];
  created_at: string;
  updated_at: string;
}

export interface AreaFormData {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

/* ─── Process ──────────────────────────────────────────────────── */
export type ProcessType = 'manual' | 'systemic' | 'hybrid';
export type ProcessStatus = 'active' | 'inactive' | 'draft' | 'deprecated';
export type ProcessPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Process {
  id: number;
  area_id: number;
  parent_id: number | null;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  type: ProcessType;
  status: ProcessStatus;
  priority: ProcessPriority;
  order: number;
  is_root: boolean;
  children_count?: number;
  children?: Process[];
  tools?: Tool[];
  responsibles?: Responsible[];
  documents?: Document[];
  area?: Area;
  created_at: string;
  updated_at: string;
}

export interface ProcessFormData {
  area_id: number;
  parent_id?: number | null;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  type?: ProcessType;
  status?: ProcessStatus;
  priority?: ProcessPriority;
  order?: number;
  tools?: { id: number; notes?: string }[];
  responsibles?: { id: number; notes?: string }[];
  documents?: { id: number; notes?: string }[];
}

export interface ProcessFilters {
  area_id?: number;
  parent_id?: number | null;
  root_only?: boolean;
  status?: ProcessStatus;
  type?: ProcessType;
  priority?: ProcessPriority;
  search?: string;
  per_page?: number;
  page?: number;
}

/* ─── Tool ─────────────────────────────────────────────────────── */
export interface Tool {
  id: number;
  name: string;
  description: string | null;
  url: string | null;
  icon: string | null;
  category: string | null;
  pivot?: { notes: string | null };
  created_at: string;
  updated_at: string;
}

export interface ToolFormData {
  name: string;
  description?: string;
  url?: string;
  icon?: string;
  category?: string;
}

/* ─── Responsible ──────────────────────────────────────────────── */
export interface Responsible {
  id: number;
  name: string;
  email: string | null;
  role: string | null;
  department: string | null;
  phone: string | null;
  pivot?: { notes: string | null };
  created_at: string;
  updated_at: string;
}

export interface ResponsibleFormData {
  name: string;
  email?: string;
  role?: string;
  department?: string;
  phone?: string;
}

/* ─── Document ─────────────────────────────────────────────────── */
export interface Document {
  id: number;
  name: string;
  description: string | null;
  file_path: string | null;
  url: string | null;
  type: string | null;
  pivot?: { notes: string | null };
  created_at: string;
  updated_at: string;
}

export interface DocumentFormData {
  name: string;
  description?: string;
  file_path?: string;
  url?: string;
  type?: string;
}

/* ─── Dashboard ────────────────────────────────────────────────── */
export interface DashboardStats {
  totals: {
    areas: number;
    processes: number;
    root_processes: number;
    tools: number;
    responsibles: number;
    documents: number;
  };
  processes_by_type: Record<string, number>;
  processes_by_status: Record<string, number>;
  processes_by_priority: Record<string, number>;
}

export interface DashboardOverviewArea {
  id: number;
  name: string;
  color: string | null;
  icon: string | null;
  total_processes: number;
  root_processes: number;
  by_status: Record<string, number>;
  by_type: Record<string, number>;
}

/* ─── Analytics ────────────────────────────────────────────────── */
export interface AnalyticsInsight {
  type: string;
  severity: 'critical' | 'warning' | 'info';
  process_id?: number;
  process_name?: string;
  area_id?: number;
  area_name?: string;
  count?: number;
  depth?: number;
  percentage?: number;
  message: string;
  suggestion: string;
}

export interface ProcessChange {
  id: number;
  action: 'created' | 'updated' | 'deleted' | 'restored';
  changed_by: string;
  description: string | null;
  changes: Record<string, any>;
  created_at: string;
}

/* ─── Breadcrumb ───────────────────────────────────────────────── */
export interface BreadcrumbData {
  breadcrumb: string[];
  depth: number;
}
