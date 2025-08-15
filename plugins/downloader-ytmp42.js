import fetch from 'node-fetch';
import ytdl from 'ytdl-core';
import yts from 'yt-search';

// 🔹 APIs de descarga
const primaryAPI = (encodedUrl) => `https://theadonix-api.vercel.app/api/ytmp3?url=${encodedUrl}`;
const backupAPI1 = (encodedUrl) => `https://api.vreden.my.id/api/ytmp3?url=${encodedUrl}`;
const backupAPI2 = (encodedUrl) => `https://delirius-apiofc.vercel.app/download/ytmp3?url=${encodedUrl}`;

// 🔹 Lista de API keys de búsqueda
const API_KEYS = [
  'AIzaSyA3-PRUEBA3',
  'AIzaSyA4-PRUEBA4',
  'AIzaSyA5-PRUEBA5',
  'AIzaSyA6-PRUEBA6',
  'AIzaSyA7-PRUEBA7',
  'AIzaSyA8-PRUEBA8',
  'AIzaSyA9-PRUEBA9',
  'AIzaSyA10-PRUEBA10'
];

// Función para obtener una API key aleatoria
function getRandomApiKey() {
  return API_KEYS[Math.floor(Math.random() * API_KEYS.length)];
}

const handler = async (m, { conn, args, usedPrefix }) => {
  if (!args[0]) {
    return conn.reply(m.chat, `✏️ Ingresa un título para buscar en YouTube.\n\nEjemplo:\n> ${usedPrefix}play Corazón Serrano - Mix Poco Yo`, m);
  }

  // 🔹 Animación de carga
  const mensajesCarga = [
    "🔍 Buscando la canción...",
    "🎵 Encontrando el mejor resultado...",
    "⏳ Preparando tu audio...",
    "📥 Descargando archivo...",
    "✅ ¡Listo! Enviando..."
  ];

  for (let msg of mensajesCarga) {
    await conn.sendMessage(m.chat, { text: msg }, { quoted: m });
    await new Promise(res => setTimeout(res, 1000));
  }

  try {
    let videoInfo;

    // 1️⃣ Intentar búsqueda con YouTube Data API
    try {
      const API_KEY = getRandomApiKey();
      const searchURL = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(args.join(" "))}&key=${API_KEY}`;
      const res = await fetch(searchURL);
      const data = await res.json();

      if (data.items && data.items.length) {
        const video = data.items[0];
        videoInfo = {
          title: video.snippet.title,
          url: `https://www.youtube.com/watch?v=${video.id.videoId}`,
          thumbnail: video.snippet.thumbnails.high.url
        };
      } else {
        throw new Error('Sin resultados API oficial');
      }
    } catch (err) {
      console.warn('⚠️ Error en API oficial, usando yt-search:', err.message);
      const results = await yts(args.join(" "));
      if (!results.videos.length) throw new Error('No se encontraron resultados en yt-search');
      const video = results.videos[0];
      videoInfo = {
        title: video.title,
        url: video.url,
        thumbnail: video.thumbnail
      };
    }

    // 2️⃣ Descargar miniatura
    const thumbnail = await (await fetch(videoInfo.thumbnail)).buffer();

    // 3️⃣ Enviar información
    await conn.sendMessage(m.chat, {
      image: thumbnail,
      caption: `🎥 *Video encontrado*\n📌 *Título:* ${videoInfo.title}\n🔗 *Enlace:* ${videoInfo.url}`
    }, { quoted: m });

    // 4️⃣ Intentar descarga con APIs
    const encodedUrl = encodeURIComponent(videoInfo.url);
    let audioBuffer;

    try {
      // API primaria
      const res1 = await fetch(primaryAPI(encodedUrl));
      if (res1.ok) {
        const json = await res1.json();
        if (json.result?.download_url) {
          audioBuffer = await (await fetch(json.result.download_url)).buffer();
        }
      }
    } catch {}

    if (!audioBuffer) {
      try {
        // API de respaldo 1
        const res2 = await fetch(backupAPI1(encodedUrl));
        if (res2.ok) {
          const json = await res2.json();
          if (json.result?.download_url) {
            audioBuffer = await (await fetch(json.result.download_url)).buffer();
          }
        }
      } catch {}
    }

    if (!audioBuffer) {
      try {
        // API de respaldo 2 (DELIRIUS)
        const res3 = await fetch(backupAPI2(encodedUrl));
        if (res3.ok) {
          const json = await res3.json();
          if (json.result?.download_url) {
            audioBuffer = await (await fetch(json.result.download_url)).buffer();
          }
        }
      } catch {}
    }

    // 5️⃣ Enviar audio
    if (audioBuffer) {
      await conn.sendMessage(m.chat, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${videoInfo.title}.mp3`
      }, { quoted: m });
    } else {
      // Último recurso: YTDL local
      const audioStream = ytdl(videoInfo.url, { filter: 'audioonly', quality: 'highestaudio' });
      await conn.sendMessage(m.chat, {
        audio: { stream: audioStream },
        mimetype: 'audio/mpeg',
        fileName: `${videoInfo.title}.mp3`
      }, { quoted: m });
    }

  } catch (e) {
    console.error(e);
    conn.reply(m.chat, '❗ Ocurrió un error al buscar o enviar el audio.', m);
  }
};

handler.help = ['play'];
handler.tags = ['descargas'];
handler.command = ['play'];

export default handler;
