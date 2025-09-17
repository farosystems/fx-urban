"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Settings, Bell, BellOff, Volume2, VolumeX } from "lucide-react";

interface ReminderSettingsProps {
  onSettingsChange: (settings: ReminderSettings) => void;
}

interface ReminderSettings {
  enabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export function ReminderSettings({ onSettingsChange }: ReminderSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<ReminderSettings>({
    enabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
  });

  // Cargar configuración del localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('agenda-reminder-settings');
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        setSettings(parsedSettings);
        onSettingsChange(parsedSettings);
      }
    } catch (error) {
      console.warn('Error loading reminder settings:', error);
    }
  }, [onSettingsChange]);

  // Guardar configuración y notificar cambios
  const updateSettings = (newSettings: ReminderSettings) => {
    setSettings(newSettings);
    localStorage.setItem('agenda-reminder-settings', JSON.stringify(newSettings));
    onSettingsChange(newSettings);
  };

  // Solicitar permisos de notificación
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted');
      } else {
        console.log('Notification permission denied');
      }
    }
  };

  useEffect(() => {
    if (settings.enabled) {
      requestNotificationPermission();
    }
  }, [settings.enabled]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          {settings.enabled ? (
            <Bell className="w-4 h-4 text-blue-600" />
          ) : (
            <BellOff className="w-4 h-4 text-gray-400" />
          )}
          <span className="hidden sm:inline">Recordatorios</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Configuración de Recordatorios
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estado general de recordatorios */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-medium">
                Habilitar recordatorios
              </Label>
              <p className="text-sm text-gray-500">
                Recibir notificaciones antes de los eventos
              </p>
            </div>
            <Switch
              checked={settings.enabled}
              onCheckedChange={(enabled) =>
                updateSettings({ ...settings, enabled })
              }
            />
          </div>

          {/* Configuraciones adicionales (solo si están habilitados) */}
          {settings.enabled && (
            <>
              <div className="h-px bg-gray-200" />

              {/* Sonido */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    {settings.soundEnabled ? (
                      <Volume2 className="w-4 h-4 text-blue-600" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-gray-400" />
                    )}
                    Sonido de notificación
                  </Label>
                  <p className="text-sm text-gray-500">
                    Reproducir sonido con las notificaciones
                  </p>
                </div>
                <Switch
                  checked={settings.soundEnabled}
                  onCheckedChange={(soundEnabled) =>
                    updateSettings({ ...settings, soundEnabled })
                  }
                />
              </div>

              {/* Vibración */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Vibración</Label>
                  <p className="text-sm text-gray-500">
                    Vibrar en dispositivos móviles
                  </p>
                </div>
                <Switch
                  checked={settings.vibrationEnabled}
                  onCheckedChange={(vibrationEnabled) =>
                    updateSettings({ ...settings, vibrationEnabled })
                  }
                />
              </div>

              <div className="h-px bg-gray-200" />

              {/* Información sobre permisos */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>💡 Consejo:</strong> Para mejores resultados, permite las notificaciones del navegador cuando se te solicite.
                </p>
              </div>
            </>
          )}

          {/* Estado de permisos */}
          <div className="text-xs text-gray-500">
            Estado de permisos de notificación:{' '}
            <span className="font-medium">
              {'Notification' in window
                ? Notification.permission === 'granted'
                  ? '✅ Concedido'
                  : Notification.permission === 'denied'
                  ? '❌ Denegado'
                  : '⏳ Pendiente'
                : '❌ No soportado'}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}