"use client";
import React, { useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import listPlugin from '@fullcalendar/list';
import { EventoAgenda } from '@/types/agenda';
import { formatearFechaParaFullCalendar } from '@/services/agenda';

interface CalendarComponentProps {
  eventos: EventoAgenda[];
  onEventClick: (evento: any) => void;
  onDateClick: (date: string) => void;
  onEventDrop: (info: any) => void;
  onEventResize: (info: any) => void;
  loading?: boolean;
}

export function CalendarComponent({
  eventos,
  onEventClick,
  onDateClick,
  onEventDrop,
  onEventResize,
  loading = false
}: CalendarComponentProps) {
  const calendarRef = useRef<FullCalendar>(null);

  const eventosFormateados = formatearFechaParaFullCalendar(eventos);

  const handleDateClick = (arg: any) => {
    onDateClick(arg.dateStr);
  };

  const handleEventClick = (info: any) => {
    onEventClick(info.event);
  };

  const handleEventDrop = (info: any) => {
    onEventDrop({
      eventId: info.event.id,
      start: info.event.start,
      end: info.event.end,
      allDay: info.event.allDay
    });
  };

  const handleEventResize = (info: any) => {
    onEventResize({
      eventId: info.event.id,
      start: info.event.start,
      end: info.event.end
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className={`${loading ? 'opacity-50 pointer-events-none' : ''}`}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
          initialView="dayGridMonth"
          locale="es"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
          }}
          buttonText={{
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
            list: 'Lista'
          }}
          events={eventosFormateados}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          editable={true}
          droppable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          height="600px"
          nowIndicator={true}
          eventDisplay="block"
          displayEventTime={true}
          allDaySlot={true}
          slotMinTime="06:00:00"
          slotMaxTime="23:00:00"
          slotDuration="00:30:00"
          snapDuration="00:15:00"
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5],
            startTime: '09:00',
            endTime: '18:00'
          }}
          eventMouseEnter={(info) => {
            info.el.style.cursor = 'pointer';
          }}
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
          slotLabelFormat={{
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }}
        />
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}