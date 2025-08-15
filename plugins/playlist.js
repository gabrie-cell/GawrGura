import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, text }) => {
  if (!text) return m.reply(`🦈 *¡Eh buba~! Ingresa una playlist de YouTube desu~*\n🌊 *Ejemplo:* ${usedPrefix + command} https://youtube.com/playlist?list=PL...`)

  try {
    // 1️⃣ Obtener info de la playlist
    let playlistRes = await fetch(`https://delirius-apiofc.vercel.app/ytplaylist?url=${encodeURIComponent(text)}`)
    let playlist = await playlistRes.json()

    if (!playlist.data || !playlist.data.length) return m.reply('❌ *Awww~ No encontré esa playlist buba~.*')

    m.reply(`📀 *Encontré ${playlist.data.length} canciones en la playlist*\n🦈 Espera mientras las descargo todas...`)

    let audios = []
    for (let video of playlist.data) {
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
        audios.push({ title: video.title, url: audioUrl })
      }
    }

    // 2️⃣ Enviar resultados
    if (audios.length > 20) {
      let lista = audios.map((a, i) => `${i + 1}. ${a.title}\n${a.url}`).join('\n\n')
      await conn.sendMessage(m.chat, { text: `📦 *Demasiados audios buba~*\nAquí tienes los links:\n\n${lista}` }, { quoted: m })
    } else {
      for (let audio of audios) {
        await conn.sendMessage(m.chat, {
          audio: { url: audio.url },
          mimetype: 'audio/mpeg',
          fileName: `${audio.title}.mp3`,
          ptt: true
        }, { quoted: m })
      }
    }

  } catch (e) {
    console.error(e)
    m.reply(`❌ *Gyaa~ Algo salió mal desu~: ${e.message}*`)
  }
}

handler.command = ['playlist', 'ytplaylist']
export default handler
