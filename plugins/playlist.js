import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) return m.reply(`🦈 *¡Eh buba~! Ingresa una playlist de YouTube desu~*\n🌊 *Ejemplo:* ${usedPrefix + command} https://youtube.com/playlist?list=PL...`)

  try {
    // 1️⃣ Obtener info de la playlist
    let playlistRes = await fetch(`https://delirius-apiofc.vercel.app/ytplaylist?url=${encodeURIComponent(text)}`)
    let playlist = await playlistRes.json()

    if (!playlist.data || !playlist.data.length) return m.reply('❌ *Awww~ No encontré esa playlist buba~.*')

    await m.reply(`📀 *Encontré ${playlist.data.length} canciones en la playlist*\n🦈 Empezando a descargarlas...`)

    // 2️⃣ Procesar y enviar cada canción
    for (let video of playlist.data) {
      try {
        // Buscar audio usando APIs
        let audioUrl = null
        const apis = [
          `https://theadonix-api.vercel.app/api/ytmp3?url=${encodeURIComponent(video.url)}`,
          `https://api.ytjar.download/audio?url=${encodeURIComponent(video.url)}`
        ]

        for (const api of apis) {
          try {
            const res = await fetch(api)
            const json = await res.json()
            if (json?.result?.audio) {
              audioUrl = json.result.audio
              break
            } else if (json?.url) {
              audioUrl = json.url
              break
            }
          } catch {}
        }

        if (audioUrl) {
          await conn.sendMessage(m.chat, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            fileName: `${video.title}.mp3`,
            ptt: true
          }, { quoted: m })
        } else {
          await m.reply(`❌ No pude descargar: *${video.title}*`)
        }

      } catch (err) {
        console.error(`Error con ${video.title}`, err)
        await m.reply(`⚠️ Error descargando: *${video.title}*`)
      }
    }

    await m.reply(`✅ *Playlist completa buba~* 🦈`)

  } catch (e) {
    console.error(e)
    m.reply(`❌ *Gyaa~ Algo salió mal desu~: ${e.message}*`)
  }
}

handler.command = ['playlist', 'ytplaylist']
export default handler
