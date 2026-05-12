'use server'

import sql from '@/lib/db'

function timeToMinutes(time: string): number {
  const [h, m] = time.slice(0, 5).split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

function generateSlots(start: string, end: string, duration: number): string[] {
  const slots: string[] = []
  let current = timeToMinutes(start)
  const endMin = timeToMinutes(end)
  while (current + duration <= endMin) {
    slots.push(minutesToTime(current))
    current += duration
  }
  return slots
}

export async function getAvailableSlots(
  professionalId: string,
  date: string,
  totalDurationMinutes: number
): Promise<string[]> {
  const dayOfWeek = new Date(date + 'T12:00:00').getDay()

  const avail = await sql`
    SELECT start_time, end_time FROM availability
    WHERE professional_id = ${professionalId}
    AND day_of_week = ${dayOfWeek}
    AND is_available = true
    LIMIT 1
  `
  if (!avail[0]) return []

  const appointments = await sql`
    SELECT start_time, end_time FROM appointments
    WHERE professional_id = ${professionalId}
    AND scheduled_date = ${date}
    AND status != 'canceled'
  `

  const all = generateSlots(
    avail[0].start_time.slice(0, 5),
    avail[0].end_time.slice(0, 5),
    totalDurationMinutes
  )

  const today = new Date().toISOString().slice(0, 10)
  const isToday = date === today
  const nowMinutes = isToday
    ? new Date().getHours() * 60 + new Date().getMinutes()
    : 0

  return all.filter((slot) => {
    const slotStart = timeToMinutes(slot)
    const slotEnd = slotStart + totalDurationMinutes

    if (isToday && slotStart <= nowMinutes) return false

    return !appointments.some((apt) => {
      const aptStart = timeToMinutes(apt.start_time)
      const aptEnd = timeToMinutes(apt.end_time)
      return slotStart < aptEnd && slotEnd > aptStart
    })
  })
}

type ServiceInput = {
  id: string
  durationMinutes: number
}

type AppointmentInput = {
  businessId: string
  professionalId: string
  services: ServiceInput[]
  date: string
  startTime: string
  customerName: string
  customerWhatsapp: string
}

export async function createAppointment(
  data: AppointmentInput
): Promise<{ error?: string; success?: boolean }> {
  try {
    const existing = await sql`
      SELECT id FROM customers
      WHERE business_id = ${data.businessId} AND whatsapp = ${data.customerWhatsapp}
      LIMIT 1
    `

    let customerId: string
    if (existing[0]) {
      customerId = existing[0].id
      await sql`UPDATE customers SET name = ${data.customerName} WHERE id = ${customerId}`
    } else {
      const created = await sql`
        INSERT INTO customers (business_id, name, whatsapp)
        VALUES (${data.businessId}, ${data.customerName}, ${data.customerWhatsapp})
        RETURNING id
      `
      customerId = created[0].id
    }

    // Create one appointment per service, sequentially in time
    let cursor = timeToMinutes(data.startTime)
    for (const service of data.services) {
      const startTime = minutesToTime(cursor)
      const endTime = minutesToTime(cursor + service.durationMinutes)
      await sql`
        INSERT INTO appointments
          (business_id, customer_id, professional_id, service_id, scheduled_date, start_time, end_time)
        VALUES
          (${data.businessId}, ${customerId}, ${data.professionalId}, ${service.id},
           ${data.date}, ${startTime}, ${endTime})
      `
      cursor += service.durationMinutes
    }

    return { success: true }
  } catch {
    return { error: 'Horário indisponível. Escolha outro horário e tente novamente.' }
  }
}
