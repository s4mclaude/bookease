export interface User {
  id: string
  email: string
  name: string | null
  created_at: string
}

export interface Business {
  id: string
  owner_id: string
  name: string
  slug: string
  type: 'clinic' | 'barbershop' | 'salon' | null
  phone: string | null
  email: string | null
  address: string | null
  logo_url: string | null
  description: string | null
  created_at: string
}

export interface Service {
  id: string
  business_id: string
  name: string
  description: string | null
  price: number | null
  duration_minutes: number
  is_active: boolean
  created_at: string
}

export interface Professional {
  id: string
  business_id: string
  name: string
  role: string | null
  photo_url: string | null
  is_active: boolean
  created_at: string
}

export interface ProfessionalService {
  id: string
  professional_id: string
  service_id: string
}

export interface Availability {
  id: string
  professional_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_available: boolean
}

export interface Customer {
  id: string
  business_id: string
  name: string
  whatsapp: string
  created_at: string
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'canceled' | 'completed'

export interface Appointment {
  id: string
  business_id: string
  customer_id: string
  professional_id: string
  service_id: string
  scheduled_date: string
  start_time: string
  end_time: string
  status: AppointmentStatus
  notes: string | null
  created_at: string
}

// Tipos expandidos com joins (usados em consultas com relacionamentos)
export interface AppointmentWithDetails extends Appointment {
  customer: Customer
  professional: Professional
  service: Service
}

export interface ProfessionalWithServices extends Professional {
  professional_services: Array<{ service: Service }>
  availability: Availability[]
}

// Tipo para o fluxo de agendamento público
export interface BookingState {
  service: Service | null
  professional: Professional | null
  date: string | null
  time: string | null
  customerName: string
  customerWhatsapp: string
}
