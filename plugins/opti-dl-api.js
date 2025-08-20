
import fetch from 'node-fetch'
import yts from 'yt-search'

let handler = async (m, { conn, args, usedPrefix, command, text }) => {
  
  // Verificar que OptiShield esté disponible
  if (!global.optishieldAPI) {
    return m.reply('❌ *OptiShield no está disponible. Verifica la configuración.*')
  }

  try {
    // Comando playdl - buscar y descargar por nombre
    if (command === 'playdl') {
      if (!text) {
        return m.reply(`🎵 *Uso del comando:*\n${usedPrefix}playdl nombre de la canción\n\n*Ejemplo:* ${usedPrefix}playdl bad bunny monaco`)
      }

      await m.react('🔍')
      m.reply('🔍 *Buscando en YouTube...*')

      // Buscar en YouTube
      const searchResults = await yts(text)
      if (!searchResults.videos.length) {
        return m.reply('❌ *No se encontraron resultados para tu búsqueda.*')
      }

      const video = searchResults.videos[0]
      const videoUrl = video.url

      // Mostrar información del video encontrado
      const info = `🎥 *Video encontrado:*\n` +
                  `📝 *Título:* ${video.title}\n` +
                  `👤 *Canal:* ${video.author.name}\n` +
                  `⏱️ *Duración:* ${video.timestamp}\n` +
                  `📊 *Vistas:* ${video.views}\n` +
                  `🔗 *URL:* ${videoUrl}\n\n` +
                  `⏳ *Descargando...*`

      if (video.thumbnail) {
        await conn.sendMessage(m.chat, {
          image: { url: video.thumbnail },
          caption: info
        }, { quoted: m })
      } else {
        await m.reply(info)
      }

      // Procesar descarga
      await processDownload(conn, m, videoUrl, video.title)
    }
    
    // Comando para links directos
    else if (command === 'dl' || command === 'download') {
      if (!args[0]) {
        return m.reply(`🔗 *Uso del comando:*\n${usedPrefix}dl [link]\n\n*Plataformas soportadas:*\n• YouTube\n• Facebook\n• Instagram\n• TikTok\n• Twitter\n• SoundCloud\n• Y muchas más...`)
      }

      const url = args[0]
      
      // Validar URL
      if (!isValidUrl(url)) {
        return m.reply('❌ *URL inválida. Por favor proporciona un enlace válido.*')
      }

      await m.react('⏳')
      m.reply('⏳ *Analizando enlace y preparando descarga...*')

      // Procesar descarga
      await processDownload(conn, m, url)
    }

  } catch (error) {
    console.error('Error en downloader-optishield:', error)
    m.reply(`❌ *Error:* ${error.message}`)
    await m.react('❌')
  }
}

// Función principal de descarga usando OptiShield
async function processDownload(conn, m, url, title = null) {
  try {
    // Detectar tipo de plataforma
    const platform = detectPlatform(url)
    
    // Preparar parámetros para OptiShield
    const downloadParams = {
      type: 'download',
      url: url,
      platform: platform,
      quality: 'best',
      format: 'both' // audio y video
    }

    // Usar la API de OptiShield
    global.optishieldAPI.logger({ 
      texto: `Iniciando descarga de: ${url}`, 
      tipo: 'info' 
    })

    const result = await global.optishieldAPI.sendMessage(downloadParams)

    if (result.error) {
      throw new Error(result.error)
    }

    // Procesar resultado según la respuesta de OptiShield
    if (result.video_url && result.audio_url) {
      // Ambos formatos disponibles
      await m.reply('📥 *¡Descarga completada! Enviando archivos...*')
      
      // Enviar video
      if (result.video_url) {
        await conn.sendMessage(m.chat, {
          video: { url: result.video_url },
          caption: `🎥 *Video:* ${title || result.title || 'Descarga'}\n🔗 *Fuente:* ${url}`,
          fileName: `${title || 'video'}.mp4`
        }, { quoted: m })
      }

      // Enviar audio
      if (result.audio_url) {
        await conn.sendMessage(m.chat, {
          audio: { url: result.audio_url },
          mimetype: 'audio/mpeg',
          fileName: `${title || 'audio'}.mp3`
        }, { quoted: m })
      }
    }
    else if (result.download_url) {
      // URL de descarga única
      const fileBuffer = await global.optishieldAPI.getBuffer(result.download_url)
      
      // Determinar tipo de archivo
      if (result.type === 'video' || url.includes('youtube') || url.includes('tiktok')) {
        await conn.sendMessage(m.chat, {
          video: fileBuffer,
          caption: `🎥 *Descargado:* ${title || result.title || 'Video'}\n🔗 *Fuente:* ${url}`,
          fileName: `${title || 'video'}.mp4`
        }, { quoted: m })
      } else {
        await conn.sendMessage(m.chat, {
          audio: fileBuffer,
          mimetype: 'audio/mpeg',
          fileName: `${title || 'audio'}.mp3`
        }, { quoted: m })
      }
    }
    else {
      // Método alternativo usando uploadFile de OptiShield
      const uploadResult = await global.optishieldAPI.uploadFile(result.buffer || result.data, 'mp4')
      
      if (uploadResult.url) {
        const buffer = await global.optishieldAPI.getBuffer(uploadResult.url)
        
        await conn.sendMessage(m.chat, {
          video: buffer,
          caption: `🎥 *Descargado:* ${title || 'Video'}\n🔗 *Fuente:* ${url}`,
          fileName: `${title || 'video'}.mp4`
        }, { quoted: m })
      }
    }

    // Log de éxito
    global.optishieldAPI.logger({ 
      texto: `Descarga exitosa de: ${url}`, 
      tipo: 'info' 
    })

    await m.react('✅')

  } catch (error) {
    global.optishieldAPI.logger({ 
      texto: `Error en descarga: ${error.message}`, 
      tipo: 'error' 
    })
    
    // Método de respaldo usando APIs tradicionales
    await fallbackDownload(conn, m, url, title)
  }
}

// Método de respaldo usando APIs externas
async function fallbackDownload(conn, m, url, title) {
  try {
    m.reply('🔄 *Intentando método alternativo...*')
    
    // APIs de respaldo
    const apis = [
      `https://theadonix-api.vercel.app/api/download?url=${encodeURIComponent(url)}`,
      `https://api.vreden.my.id/api/download?url=${encodeURIComponent(url)}`,
      `https://delirius-apiofc.vercel.app/download/universal?url=${encodeURIComponent(url)}`
    ]

    let success = false

    for (const api of apis) {
      try {
        const response = await fetch(api)
        const data = await response.json()
        
        if (data.result && (data.result.video || data.result.audio || data.result.download_url)) {
          const videoUrl = data.result.video || data.result.download_url
          const audioUrl = data.result.audio
          
          if (videoUrl) {
            await conn.sendMessage(m.chat, {
              video: { url: videoUrl },
              caption: `🎥 *Video:* ${title || data.result.title || 'Descarga'}\n🔗 *Fuente:* ${url}`,
              fileName: `${title || 'video'}.mp4`
            }, { quoted: m })
          }
          
          if (audioUrl) {
            await conn.sendMessage(m.chat, {
              audio: { url: audioUrl },
              mimetype: 'audio/mpeg',
              fileName: `${title || 'audio'}.mp3`
            }, { quoted: m })
          }
          
          success = true
          break
        }
      } catch (apiError) {
        continue
      }
    }

    if (!success) {
      throw new Error('Todos los métodos de descarga fallaron')
    }

    await m.react('✅')

  } catch (error) {
    await m.reply(`❌ *Error en descarga:* ${error.message}\n\n*Intenta con otro enlace o reporta el problema.*`)
    await m.react('❌')
  }
}

// Detectar plataforma del URL
function detectPlatform(url) {
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('facebook.com') || url.includes('fb.watch')) return 'facebook'
  if (url.includes('instagram.com')) return 'instagram'
  if (url.includes('tiktok.com')) return 'tiktok'
  if (url.includes('twitter.com') || url.includes('x.com')) return 'twitter'
  if (url.includes('soundcloud.com')) return 'soundcloud'
  if (url.includes('spotify.com')) return 'spotify'
  if (url.includes('twitch.tv')) return 'twitch'
  return 'universal'
}

// Validar URL
function isValidUrl(string) {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

// Configuración del handler
handler.help = ['playdl', 'dl', 'download']
handler.tags = ['downloader']
handler.command = ['playdl', 'dl', 'download', 'descargar']
handler.register = true

export default handler
