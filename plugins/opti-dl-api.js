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

    // Usar la API de OptiShield con el formato correcto
    global.optishieldAPI.logger({
      texto: `Iniciando descarga de: ${url}`,
      tipo: 'info'
    })

    // Usar sendMessage con el tipo ytdl como especificaste
    const result = await global.optishieldAPI.sendMessage({
      type: "ytdl",
      link: url
    })

    if (result.error) {
      throw new Error(result.error)
    }

    // Log de la respuesta para debug
    global.optishieldAPI.logger({
      texto: `Respuesta OptiShield: ${JSON.stringify(result)}`,
      tipo: 'debug'
    })

    // Procesar resultado según la respuesta de OptiShield
    if (result.success || result.status === 'success') {
      await m.reply('📥 *¡Descarga completada! Enviando archivos...*')

      // Diferentes formatos de respuesta posibles
      let videoUrl = result.video_url || result.video || result.url || result.download_url
      let audioUrl = result.audio_url || result.audio
      let resultTitle = result.title || title || 'Descarga'
      let thumbnail = result.thumbnail || result.thumb

      // Enviar video si está disponible
      if (videoUrl) {
        try {
          await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            caption: `🎥 *${resultTitle}*\n🔗 *Fuente:* ${url}\n📡 *Powered by OptiShield*`,
            fileName: `${sanitizeFilename(resultTitle)}.mp4`
          }, { quoted: m })
        } catch (videoError) {
          global.optishieldAPI.logger({
            texto: `Error enviando video: ${videoError.message}`,
            tipo: 'error'
          })
        }
      }

      // Enviar audio si está disponible
      if (audioUrl) {
        try {
          await conn.sendMessage(m.chat, {
            audio: { url: audioUrl },
            mimetype: 'audio/mpeg',
            fileName: `${sanitizeFilename(resultTitle)}.mp3`
          }, { quoted: m })
        } catch (audioError) {
          global.optishieldAPI.logger({
            texto: `Error enviando audio: ${audioError.message}`,
            tipo: 'error'
          })
        }
      }

      // Si no hay URLs directas, verificar si hay buffer o datos
      if (!videoUrl && !audioUrl) {
        if (result.buffer || result.data) {
          try {
            const fileBuffer = result.buffer || Buffer.from(result.data, 'base64')

            await conn.sendMessage(m.chat, {
              video: fileBuffer,
              caption: `🎥 *${resultTitle}*\n🔗 *Fuente:* ${url}\n📡 *Powered by OptiShield*`,
              fileName: `${sanitizeFilename(resultTitle)}.mp4`
            }, { quoted: m })
          } catch (bufferError) {
            throw new Error('No se pudo procesar el archivo descargado')
          }
        } else {
          throw new Error('No se encontraron archivos en la respuesta')
        }
      }

      // Log de éxito
      global.optishieldAPI.logger({
        texto: `Descarga exitosa de: ${url}`,
        tipo: 'info'
      })

      await m.react('✅')

    } else {
      throw new Error(result.message || 'Error desconocido en OptiShield')
    }

  } catch (error) {
    global.optishieldAPI.logger({
      texto: `Error en descarga OptiShield: ${error.message}`,
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

    // APIs de respaldo públicas y gratuitas
    const apis = [
      // Cobalt (universal)
      {
        name: 'Cobalt',
        url: 'https://api.cobalt.tools/api/json',
        method: 'POST',
        body: { url: url, filenamePattern: 'basic', isAudioOnly: false }
      },
      // Y2Mate
      {
        name: 'Y2Mate',
        url: 'https://www.y2mate.com/mates/analyzeV2/ajax',
        method: 'POST',
        body: { k_query: url, k_page: 'home', hl: 'en', q_auto: 0 }
      },
      // SaveTube
      {
        name: 'SaveTube',
        url: `https://p.oceansaver.in/ajax/download.php?copyright=0&format=360&url=${encodeURIComponent(url)}`,
        method: 'GET'
      },
      // YT1s
      {
        name: 'YT1s',
        url: 'https://yt1s.com/api/ajaxSearch/index',
        method: 'POST',
        body: { q: url, vt: 'home' }
      }
    ]

    let success = false

    for (const api of apis) {
      try {
        let response
        if (api.method === 'POST') {
          response = await fetch(api.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            body: JSON.stringify(api.body)
          })
        } else {
          response = await fetch(api.url, {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          })
        }

        if (!response.ok) continue

        const data = await response.json()

        // Procesar diferentes formatos de respuesta
        let videoUrl = null
        let downloadTitle = title || 'Descarga'

        // Formato Cobalt
        if (data.status === 'success' && data.url) {
          videoUrl = data.url
          downloadTitle = data.filename || downloadTitle
        }
        // Formato Y2Mate
        else if (data.status === 'ok' && data.mess) {
          const mess = data.mess
          if (mess.vid) videoUrl = mess.vid
          if (mess.title) downloadTitle = mess.title
        }
        // Formato genérico
        else if (data.result) {
          videoUrl = data.result.video || data.result.download_url || data.result.url
          downloadTitle = data.result.title || downloadTitle
        }

        if (videoUrl) {
          // Limpiar título
          downloadTitle = sanitizeFilename(downloadTitle)

          // Enviar video
          try {
            await conn.sendMessage(m.chat, {
              video: { url: videoUrl },
              caption: `🎥 *${downloadTitle}*\n🔗 *Fuente:* ${url}\n📡 *API:* ${api.name}`,
              fileName: `${downloadTitle}.mp4`
            }, { quoted: m })

            success = true
            break
          } catch (sendError) {
            continue
          }
        }
      } catch (apiError) {
        console.error(`Error con API ${api.name}:`, apiError.message)
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

// Limpiar nombre de archivo
function sanitizeFilename(filename) {
  return filename.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').substring(0, 50)
}

// Configuración del handler
handler.help = ['playdl', 'dl', 'download']
handler.tags = ['downloader']
handler.command = ['playdl', 'dl', 'download', 'descargar']
handler.register = false

export default handler
