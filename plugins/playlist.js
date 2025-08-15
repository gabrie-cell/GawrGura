import fetch from 'node-fetch'

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply(`🦈 Ingresa una URL de playlist de YouTube\nEj: .playlist https://youtube.com/playlist?list=...`)

  try {
    // Obtener datos de playlist con API estable
    let info = await fetch(`https://api-pip.ywftools.com/ytplaylist?url=${encodeURIComponent(text)}`)
    let playlist = await info.json()

    if (!playlist || !playlist.videos || playlist.videos.length === 0) {
      return m.reply('❌ No pude obtener esa playlist buba~')
    }

    await m.reply(`📀 Encontré ${playlist.videos.length} canciones\n🎵 Empezando descargas...`)

    for (let video of playlist.videos) {
      try {
        let dl = await fetch(`https://api-pip.ywftools.com/ytmp3?url=${encodeURIComponent(video.url)}`)
        let json = await dl.json()

        if (json?.status && json?.audio) {
          await conn.sendMessage(m.chat, {
            audio: { url: json.audio },
            mimetype: 'audio/mpeg',
            fileName: `${video.title}.mp3`
          }, { quoted: m })
        } else {
          await m.reply(`⚠️ No pude descargar: ${video.title}`)
        }
      } catch (err) {
        await m.reply(`⚠️ Error descargando: ${video.title}`)
      }
    }

    await m.reply(`✅ Playlist completa buba~ 🦈`)

  } catch (e) {
    console.error(e)
    m.reply('❌ Error al procesar la playlist')
  }
}

handler.command = ['playlist', 'ytplaylist']
export default handler
