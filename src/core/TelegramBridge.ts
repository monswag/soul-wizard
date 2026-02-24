/**
 * TelegramBridge — thin wrapper around window.Telegram.WebApp
 *
 * Safe to call in a plain browser (all methods are no-ops when not in Telegram).
 * Detection: window.Telegram.WebApp.initData is a non-empty string when
 * launched from a Telegram keyboard/inline button; empty string in browser.
 */

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData:        string
        initDataUnsafe:  { start_param?: string }
        colorScheme:     'light' | 'dark'
        ready():         void
        expand():        void
        close():         void
        sendData(data: string): void
      }
    }
  }
}

const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined

/**
 * True when running inside a Telegram Mini App.
 * sendData() is only available in this context.
 */
export const isTelegram = !!tg?.initData

/** start_param from the Telegram bot deep-link, e.g. "hasimg_1" */
export function getStartParam(): string {
  return tg?.initDataUnsafe?.start_param ?? ''
}

export const TGBridge = {
  /** Tell Telegram the app is ready — removes loading indicator */
  ready()  { tg?.ready()  },

  /** Expand to full-screen height */
  expand() { tg?.expand() },

  /** Close the Mini App */
  close()  { tg?.close()  },

  /**
   * Send files back to the bot and auto-close the Mini App.
   * Telegram limit: 4096 bytes.  Typical payload here is ~2–3 KB.
   */
  sendData(data: string) { tg?.sendData(data) },
}
