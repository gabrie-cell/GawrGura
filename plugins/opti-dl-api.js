
import fetch from 'node-fetch'
import yts from 'yt-search'
import '../lib/OptiShield.js'

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
    
    // APIs de respaldo públicas y gratuitas
    const apis = [
      // YouTube APIs
      {
        name: 'YT-DLP API',
        url: `https://api.cobalt.tools/api/json`,
        method: 'POST',
        body: { url: url, filenamePattern: 'basic', isAudioOnly: false }
      },
      {
        name: 'SaveTube',
        url: `https://p.oceansaver.in/ajax/download.php?copyright=0&format=360&url=${encodeURIComponent(url)}`,
        method: 'GET'
      },
      {
        name: 'Y2Mate API',
        url: `https://www.y2mate.com/mates/analyzeV2/ajax`,
        method: 'POST',
        body: { k_query: url, k_page: 'home', hl: 'en', q_auto: 0 }
      },
      {
        name: 'YT1s',
        url: `https://yt1s.com/api/ajaxSearch/index`,
        method: 'POST',
        body: { q: url, vt: 'home' }
      },
      {
        name: 'Loader.to',
        url: `https://loader.to/ajax/search.php?query=${encodeURIComponent(url)}`,
        method: 'GET'
      },
      // APIs generales para múltiples plataformas
      {
        name: 'AllTube',
        url: `https://api.alltubedownload.net/json?url=${encodeURIComponent(url)}`,
        method: 'GET'
      },
      {
        name: 'DownloadGram',
        url: `https://downloadgram.com/api/video/info`,
        method: 'POST',
        body: { url: url }
      },
      {
        name: 'SaveFrom',
        url: `https://worker-nameless-river-5c0c.savefrom.workers.dev/?url=${encodeURIComponent(url)}`,
        method: 'GET'
      },
      {
        name: 'SnapSave',
        url: `https://snapsave.app/action.php?lang=en`,
        method: 'POST',
        body: { url: url }
      },
      // APIs específicas para TikTok
      {
        name: 'TikMate',
        url: `https://tikmate.online/download`,
        method: 'POST',
        body: { url: url }
      },
      {
        name: 'SnapTik',
        url: `https://snaptik.app/abc2.php`,
        method: 'POST',
        body: { url: url, lang: 'en' }
      },
      // APIs para Instagram
      {
        name: 'InstaDownloader',
        url: `https://v3.saveig.app/api/ajaxSearch`,
        method: 'POST',
        body: { q: url, t: 'media', lang: 'en' }
      },
      // APIs generales adicionales
      {
        name: 'Universal Downloader',
        url: `https://co.wuk.sh/api/json`,
        method: 'POST',
        body: { url: url }
      },
      {
        name: 'VidPaw',
        url: `https://www.vidpaw.com/download?url=${encodeURIComponent(url)}`,
        method: 'GET'
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
        let audioUrl = null
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
        // Formato YT1s
        else if (data.status === 'ok' && data.mess) {
          if (data.mess.vid) videoUrl = data.mess.vid
          if (data.mess.title) downloadTitle = data.mess.title
        }
        // Formato SaveTube
        else if (data.success && data.url) {
          videoUrl = data.url
          downloadTitle = data.title || downloadTitle
        }
        // Formato genérico
        else if (data.result) {
          videoUrl = data.result.video || data.result.download_url || data.result.url
          audioUrl = data.result.audio
          downloadTitle = data.result.title || downloadTitle
        }
        // Formato directo
        else if (data.video_url || data.download_url || data.url) {
          videoUrl = data.video_url || data.download_url || data.url
          audioUrl = data.audio_url
          downloadTitle = data.title || downloadTitle
        }
        // Formato para TikTok/Instagram
        else if (data.medias && data.medias.length > 0) {
          videoUrl = data.medias[0].url
          downloadTitle = data.title || downloadTitle
        }

        if (videoUrl) {
          // Limpiar título
          downloadTitle = downloadTitle.replace(/[^\w\s-]/g, '').substring(0, 50)

          // Enviar video
          try {
            await conn.sendMessage(m.chat, {
              video: { url: videoUrl },
              caption: `🎥 *${downloadTitle}*\n🔗 *Fuente:* ${url}\n📡 *API:* ${api.name}`,
              fileName: `${downloadTitle}.mp4`
            }, { quoted: m })
            
            success = true
          } catch (sendError) {
            // Si falla el envío, intentar como buffer
            try {
              const buffer = await fetch(videoUrl).then(res => res.buffer())
              await conn.sendMessage(m.chat, {
                video: buffer,
                caption: `🎥 *${downloadTitle}*\n🔗 *Fuente:* ${url}\n📡 *API:* ${api.name}`,
                fileName: `${downloadTitle}.mp4`
              }, { quoted: m })
              success = true
            } catch (bufferError) {
              continue
            }
          }

          // Enviar audio si está disponible
          if (audioUrl && success) {
            try {
              await conn.sendMessage(m.chat, {
                audio: { url: audioUrl },
                mimetype: 'audio/mpeg',
                fileName: `${downloadTitle}.mp3`
              }, { quoted: m })
            } catch (audioError) {
              // Audio opcional, no interrumpir si falla
            }
          }

          if (success) break
        }
      } catch (apiError) {
        console.error(`Error con API ${api.name}:`, apiError.message)
        continue
      }
    }

    if (!success) {
      // Último intento con YTDL directo
      try {
        await ytdlFallback(conn, m, url, title)
        success = true
      } catch (ytdlError) {
        throw new Error('Todos los métodos de descarga fallaron')
      }
    }

    if (success) {
      await m.react('✅')
    }

  } catch (error) {
    await m.reply(`❌ *Error en descarga:* ${error.message}\n\n*Intenta con otro enlace o reporta el problema.*`)
    await m.react('❌')
  }
}

// Método de respaldo usando YTDL directo
async function ytdlFallback(conn, m, url, title) {
  try {
    m.reply('🔧 *Intentando con extractor directo...*')

    // Usar diferentes extractores según la plataforma
    const platform = detectPlatform(url)
    let extractorCommand = ''
    
    if (platform === 'youtube') {
      // Para YouTube, usar yt-dlp con diferentes formatos
      const formats = [
        'best[height<=720]',
        'worst[height>=360]',
        'best[ext=mp4]',
        'best'
      ]
      
      for (const format of formats) {
        try {
          const response = await fetch(`https://yt-dlp-api.vercel.app/api/download?url=${encodeURIComponent(url)}&format=${format}`)
          const data = await response.json()
          
          if (data.success && data.download_url) {
            await conn.sendMessage(m.chat, {
              video: { url: data.download_url },
              caption: `🎥 *${title || data.title || 'Video'}*\n🔗 *Fuente:* ${url}\n📡 *Extractor:* YT-DLP`,
              fileName: `${title || 'video'}.mp4`
            }, { quoted: m })
            return
          }
        } catch (e) {
          continue
        }
      }
    }

    // Método manual usando bibliotecas públicas
    const manualExtractors = [
      `https://invidious.io/api/v1/videos/${getVideoId(url)}`,
      `https://vid.puffyan.us/api/v1/videos/${getVideoId(url)}`,
      `https://invidious.snopyta.org/api/v1/videos/${getVideoId(url)}`
    ]

    for (const extractor of manualExtractors) {
      try {
        const response = await fetch(extractor)
        const data = await response.json()
        
        if (data.formatStreams && data.formatStreams.length > 0) {
          const video = data.formatStreams.find(f => f.container === 'mp4') || data.formatStreams[0]
          
          await conn.sendMessage(m.chat, {
            video: { url: video.url },
            caption: `🎥 *${title || data.title || 'Video'}*\n🔗 *Fuente:* ${url}\n📡 *Extractor:* Invidious`,
            fileName: `${title || 'video'}.mp4`
          }, { quoted: m })
          return
        }
      } catch (e) {
        continue
      }
    }

    throw new Error('Extractor directo falló')

  } catch (error) {
    throw error
  }
}

// Extraer ID de video de YouTube
function getVideoId(url) {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  const match = url.match(regex)
  return match ? match[1] : null
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
handler.register = false

export default handler
