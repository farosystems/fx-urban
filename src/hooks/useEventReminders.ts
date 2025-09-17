import { useEffect, useRef, useCallback } from 'react';
import { EventoAgenda } from '@/types/agenda';
import { toast } from 'sonner';

interface UseEventRemindersProps {
  eventos: EventoAgenda[];
  enabled?: boolean;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
}

export function useEventReminders({ eventos, enabled = true, soundEnabled = true, vibrationEnabled = true }: UseEventRemindersProps) {
  const checkedRemindersRef = useRef<Set<string>>(new Set());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Función para crear y reproducir el sonido de notificación
  const playNotificationSound = useCallback(async () => {
    try {
      if (!audioContextRef.current) {
        // Crear AudioContext solo cuando sea necesario (después de una interacción del usuario)
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;

      // Crear un sonido de notificación agradable
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Configurar el sonido: dos tonos cortos
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);

    } catch (error) {
      console.warn('No se pudo reproducir el sonido de notificación:', error);
      // Fallback: usar vibración si está habilitada y disponible
      if (vibrationEnabled && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    }
  }, [vibrationEnabled]);

  // Función para mostrar la notificación de recordatorio
  const showReminderNotification = useCallback((evento: EventoAgenda, minutosAntes: number) => {
    const fechaEvento = new Date(evento.fecha_inicio);
    const tiempoTexto = evento.todo_el_dia
      ? fechaEvento.toLocaleDateString('es-ES')
      : fechaEvento.toLocaleString('es-ES', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

    toast.warning(`🔔 Recordatorio: ${evento.titulo}`, {
      description: `${minutosAntes > 0 ? `En ${minutosAntes} minutos` : 'Ahora'} • ${tiempoTexto}${evento.ubicacion ? ` • ${evento.ubicacion}` : ''}`,
      duration: 10000, // 10 segundos
      action: {
        label: 'Ver evento',
        onClick: () => {
          // Podríamos emitir un evento para abrir el modal de edición
          console.log('Ver evento:', evento.id);
        },
      },
      className: 'reminder-toast',
      style: {
        borderColor: evento.color,
        borderWidth: '3px',
        borderLeftWidth: '6px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 4px 6px -2px rgba(0, 0, 0, 0.1)'
      }
    });

    // Reproducir sonido si está habilitado
    if (soundEnabled) {
      playNotificationSound();
    }
  }, [playNotificationSound, soundEnabled]);

  // Función para verificar recordatorios
  const checkReminders = useCallback(() => {
    if (!enabled || eventos.length === 0) return;

    const now = new Date();
    const currentTime = now.getTime();

    eventos.forEach(evento => {
      if (evento.recordatorio_minutos === 0) return; // Sin recordatorio

      const eventoFecha = new Date(evento.fecha_inicio);
      const tiempoEvento = eventoFecha.getTime();
      const tiempoRecordatorio = tiempoEvento - (evento.recordatorio_minutos * 60 * 1000);

      // Crear un ID único para este recordatorio
      const reminderId = `${evento.id}-${evento.recordatorio_minutos}`;

      // Verificar si ya se mostró este recordatorio
      if (checkedRemindersRef.current.has(reminderId)) return;

      // Si es tiempo del recordatorio (con tolerancia de 1 minuto)
      if (currentTime >= tiempoRecordatorio && currentTime < tiempoRecordatorio + 60000) {
        checkedRemindersRef.current.add(reminderId);
        showReminderNotification(evento, evento.recordatorio_minutos);
      }

      // Recordatorio adicional cuando el evento empieza (si no es el mismo que el recordatorio principal)
      if (evento.recordatorio_minutos > 0) {
        const startReminderId = `${evento.id}-start`;
        if (!checkedRemindersRef.current.has(startReminderId) &&
            currentTime >= tiempoEvento &&
            currentTime < tiempoEvento + 60000) {
          checkedRemindersRef.current.add(startReminderId);
          showReminderNotification(evento, 0);
        }
      }
    });

    // Limpiar recordatorios antiguos (más de 24 horas)
    const yesterday = currentTime - (24 * 60 * 60 * 1000);
    const toRemove = Array.from(checkedRemindersRef.current).filter(id => {
      const evento = eventos.find(e => id.startsWith(e.id.toString()));
      if (!evento) return true; // Eliminar si el evento ya no existe

      const eventoTime = new Date(evento.fecha_inicio).getTime();
      return eventoTime < yesterday;
    });

    toRemove.forEach(id => checkedRemindersRef.current.delete(id));
  }, [eventos, enabled, showReminderNotification]);

  // Configurar el intervalo de verificación
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Verificar inmediatamente
    checkReminders();

    // Verificar cada 30 segundos
    intervalRef.current = setInterval(checkReminders, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [checkReminders, enabled]);

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Función para testear recordatorios (desarrollo)
  const testReminder = useCallback((evento: EventoAgenda) => {
    showReminderNotification(evento, evento.recordatorio_minutos);
  }, [showReminderNotification]);

  return {
    testReminder
  };
}