import fetch from 'node-fetch'
import ytdlp from 'yt-dlp-exec'
import fs from 'fs'
import path from 'path'

// Descargar desde APIs públicas
async function descargarDesdeAPIs(url) {
  const apis = [
    `https://delirius-apiofc.vercel.app/download/ytmp3?url=${encodeURIComponent(url)}`,
    `https://api.vevioz.com/api/button/mp3/${encodeURIComponent(url)}`,
    `https://api.ytjar.download/audio?url=${encodeURIComponent(url)}`
  ]
  for (const api of apis) {
    try {
      const res = await fetch(api)
      const data = await res.json()
      if (data?.result?.audio) return data.result.audio
      if (data?.url) return data.url
      if (data?.links?.mp3) return data.links.mp3
    } catch { }
  }
  return null
}

// Descargar con yt-dlp como último recurso
async function descargarConYtDlp(url) {
  try {
    const filePath = path.resolve(`./temp_${Date.now()}.mp3`)
    await ytdlp(url, {
      extractAudio: true,
      audioFormat: 'mp3',
      output: filePath
    })
    return filePath
  } catch {
    return null
  }
}

let handler = async (m, { conn, args }) => {
  if (!args[0]) return m.reply('🎵 Debes poner el enlace de la playlist de YouTube.')

  const playlistUrl = args[0]
  if (!playlistUrl.includes('list=')) return m.reply('❌ Ese enlace no es de una playlist.')

  await m.reply('🔍 Obteniendo lista de videos...')

  try {
    // Obtener lista de videos
    const res = await fetch(`https://delirius-apiofc.vercel.app/playlist/yt?url=${encodeURIComponent(playlistUrl)}`)
    const playlistData = await res.json()

    if (!playlistData.data || playlistData.data.length === 0) {
      return m.reply('❌ No pude obtener los videos de la playlist.')
    }

    await m.reply(`📀 Playlist encontrada con ${playlistData.data.length} videos. Comenzando descarga...`)

    for (const video of playlistData.data) {
      let audioUrl = await descargarDesdeAPIs(video.url)

      if (audioUrl) {
        let audioRes = await fetch(audioUrl)
        let audioBuffer = await audioRes.buffer()
        await conn.sendMessage(m.chat, {
          audio: audioBuffer,
          mimetype: 'audio/mpeg',
          fileName: `${video.title}.mp3`
        }, { quoted: m })
      } else {
        let filePath = await descargarConYtDlp(video.url)
        if (filePath) {
          let audioBuffer = fs.readFileSync(filePath)
          await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            fileName: `${video.title}.mp3`
          }, { quoted: m })
          fs.unlinkSync(filePath)
        } else {
          await m.reply(`❌ No pude descargar: ${video.title}`)
        }
      }
    }

    await m.reply('✅ Playlist enviada completa.')
  } catch (e) {
    console.error(e)
    await m.reply('❌ Error procesando la playlist.')
  }
}

handler.command = ['playlist', 'ytplaylist']
handler.help = ['playlist <url>']
handler.tags = ['downloader']

export default handler
