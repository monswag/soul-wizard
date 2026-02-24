/**
 * agent-avatar bot plugin for openclaw
 *
 * Adds a /avatar command that opens the agent-avatar Mini App.
 * When the user completes the wizard, the generated files are written
 * directly into the openclaw workspace and the agent restarts cleanly.
 *
 * Setup
 * ─────
 * 1. Deploy the agent-avatar web app somewhere (e.g. npm run build → serve dist/)
 * 2. Set AVATAR_APP_URL in your environment (must be HTTPS for Telegram)
 * 3. Import and call registerAvatarPlugin(bot, workspacePath) in your bot setup
 *    — the plugin automatically registers /avatar with Telegram, merging with
 *      any commands already registered (does NOT overwrite existing commands)
 *
 * Example (openclaw bot entry):
 *   import { registerAvatarPlugin } from './plugins/avatar'
 *   registerAvatarPlugin(bot, process.env.WORKSPACE_PATH ?? '~/.openclaw/workspace')
 */

import { Bot, Context } from 'grammy'
import { writeFile, mkdir } from 'fs/promises'
import { join, resolve } from 'path'
import { homedir } from 'os'

interface AvatarFiles {
  identityMd: string
  soulMd:     string
  userMd:     string
}

function resolvePath(p: string): string {
  return p.startsWith('~') ? join(homedir(), p.slice(1)) : resolve(p)
}

export function registerAvatarPlugin(
  bot: Bot<Context>,
  workspacePath: string = '~/.openclaw/workspace',
) {
  const appUrl = process.env.AVATAR_APP_URL

  if (!appUrl) {
    console.warn('[avatar-plugin] AVATAR_APP_URL is not set — /avatar command disabled')
    return
  }

  const workspace = resolvePath(workspacePath)

  // ── Register /avatar command with Telegram — merges with existing commands ──
  // Runs once when the plugin loads; getMyCommands + setMyCommands avoids
  // overwriting any commands already registered by openclaw or other plugins.
  void (async () => {
    try {
      const existing = await bot.api.getMyCommands()
      if (!existing.some(c => c.command === 'avatar')) {
        await bot.api.setMyCommands([
          ...existing,
          { command: 'avatar', description: '配置角色身份' },
        ])
        console.log('[avatar-plugin] /avatar command registered')
      }
    } catch (err) {
      console.warn('[avatar-plugin] could not register command:', err)
    }
  })()

  // ── /avatar — send a keyboard button that opens the Mini App ────────────────
  bot.command('avatar', async (ctx) => {
    await ctx.reply('点击下方按钮，启动角色配置向导 ↓', {
      reply_markup: {
        keyboard: [[
          { text: '🌟 配置我的角色', web_app: { url: appUrl } },
        ]],
        resize_keyboard:  true,
        one_time_keyboard: true,
      },
    })
  })

  // ── Receive completed files from Mini App ────────────────────────────────────
  bot.on('message:web_app_data', async (ctx) => {
    const raw = ctx.message.web_app_data?.data
    if (!raw) return

    let files: AvatarFiles
    try {
      files = JSON.parse(raw) as AvatarFiles
    } catch {
      await ctx.reply('❌ 数据格式有误，请重试。')
      return
    }

    if (!files.identityMd || !files.soulMd || !files.userMd) {
      await ctx.reply('❌ 文件数据不完整，请重试。')
      return
    }

    try {
      await mkdir(workspace, { recursive: true })
      await Promise.all([
        writeFile(join(workspace, 'IDENTITY.md'), files.identityMd, 'utf-8'),
        writeFile(join(workspace, 'SOUL.md'),     files.soulMd,     'utf-8'),
        writeFile(join(workspace, 'USER.md'),     files.userMd,     'utf-8'),
      ])

      await ctx.reply(
        '✅ IDENTITY.md、SOUL.md、USER.md 已写入 workspace。\n\n重启 gateway 后生效。',
        { reply_markup: { remove_keyboard: true } },
      )
    } catch (err) {
      await ctx.reply(`❌ 写入失败：${String(err)}`)
    }
  })
}
