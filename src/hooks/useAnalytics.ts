import { useCallback, useEffect, useRef } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';
const HEARTBEAT_INTERVAL = 60000; // 60 segundos

// Clave para almacenar session_id en sessionStorage
const SESSION_STORAGE_KEY = 'analytics_session_id';

/**
 * Hook para tracking de analytics.
 * Gestiona sesiones, eventos y heartbeats.
 */
export function useAnalytics() {
  const heartbeatIntervalRef = useRef<number | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  /**
   * Obtiene o crea un session_id.
   */
  const getSessionId = useCallback(async (): Promise<string | null> => {
    // Verificar si ya existe en sessionStorage
    const existingSessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (existingSessionId) {
      sessionIdRef.current = existingSessionId;
      return existingSessionId;
    }

    // Crear nueva sesión
    try {
      const response = await fetch(`${API_URL}/api/analytics/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_info: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop'
        })
      });

      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem(SESSION_STORAGE_KEY, data.session_id);
        sessionIdRef.current = data.session_id;
        if (import.meta.env.DEV) {
          console.log('📊 Analytics session created:', data.session_id.slice(0, 8) + '...');
        }
        return data.session_id;
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('⚠️ Failed to create analytics session:', error);
      }
    }
    return null;
  }, []);

  /**
   * Envía un evento de tracking.
   */
  const trackEvent = useCallback(async (
    eventType: string, 
    eventData?: Record<string, unknown>
  ): Promise<void> => {
    let sessionId = sessionIdRef.current || sessionStorage.getItem(SESSION_STORAGE_KEY);
    
    // Si no hay sesión, intentar crearla
    if (!sessionId) {
      sessionId = await getSessionId();
    }

    if (!sessionId) {
      if (import.meta.env.DEV) {
        console.warn('⚠️ Cannot track event, no session available');
      }
      return;
    }

    try {
      await fetch(`${API_URL}/api/analytics/event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          event_type: eventType,
          event_data: eventData ? JSON.stringify(eventData) : null
        })
      });

      if (import.meta.env.DEV) {
        console.log(`📊 Event tracked: ${eventType}`, eventData || '');
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('⚠️ Failed to track event:', error);
      }
    }
  }, [getSessionId]);

  /**
   * Envía heartbeat para tracking de usuarios activos.
   */
  const sendHeartbeat = useCallback(async (): Promise<void> => {
    const sessionId = sessionIdRef.current || sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionId) return;

    try {
      await fetch(`${API_URL}/api/analytics/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId })
      });
    } catch (error) {
      // Silently fail heartbeat
      if (import.meta.env.DEV) {
        console.warn('⚠️ Heartbeat failed:', error);
      }
    }
  }, []);

  /**
   * Inicia el intervalo de heartbeat.
   */
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) return;
    
    heartbeatIntervalRef.current = window.setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);
    if (import.meta.env.DEV) {
      console.log('📊 Heartbeat started');
    }
  }, [sendHeartbeat]);

  /**
   * Detiene el intervalo de heartbeat.
   */
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      window.clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  /**
   * Retorna el session_id actual (para incluir en payload de conversión).
   */
  const getCurrentSessionId = useCallback((): string | null => {
    return sessionIdRef.current || sessionStorage.getItem(SESSION_STORAGE_KEY);
  }, []);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      stopHeartbeat();
    };
  }, [stopHeartbeat]);

  return {
    getSessionId,
    trackEvent,
    sendHeartbeat,
    startHeartbeat,
    stopHeartbeat,
    getCurrentSessionId
  };
}
