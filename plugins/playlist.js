import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// APIs públicas sin Key
const apis = [
  // Delirius
  async (videoUrl) => {
    const res = await fetch(`https://delirius-apiofc.vercel.app/download/ytmp3?url=${encodeURIComponent(videoUrl)}`);
    const data = await res.json();
    if (data?.status && data?.data?.download?.url) {
      return { title: data.data.title, url: data.data.download.url };
    }
    return null;
  },
  // SaveTube
  async (videoUrl) => {
    const res = await fetch(`https://yt-api.org/api/mp3?url=${encodeURIComponent(videoUrl)}`);
    const data = await res.json();
    if (data?.success && data?.link) {
      return { title: data.title, url: data.link };
    }
    return null;
  }
];

// Descargar mp3 en disco temporal
async function descargarMp3(url, nombreArchivo) {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(nombreArchivo, Buffer.from(buffer));
}

// Comando para procesar playlist
export async function comandoPlaylist(sock, chatId, playlistUrl) {
  try {
    // Obtener lista de videos desde API pública
    const playlistRes = await fetch(`https://yt-api.org/api/playlist?url=${encodeURIComponent(playlistUrl)}`);
    const playlistData = await playlistRes.json();

    if (!playlistData?.videos?.length) {
      await sock.sendMessage(chatId, { text: '⚠️ No se encontraron videos en la playlist.' });
      return;
    }

    await sock.sendMessage(chatId, { text: `🎵 Encontrados ${playlistData.videos.length} videos. Enviando...` });

    for (const video of playlistData.videos) {
      let mp3Info = null;

      // Probar cada API hasta que funcione
      for (const api of apis) {
        try {
          mp3Info = await api(video.url);
          if (mp3Info) break;
        } catch {
          // Si falla, pasa a la siguiente
        }
      }

      if (!mp3Info) {
        await sock.sendMessage(chatId, { text: `❌ No pude descargar: ${video.title}` });
        continue;
      }

      const filePath = path.join(__dirname, `${mp3Info.title}.mp3`);
      await descargarMp3(mp3Info.url, filePath);

      const stats = fs.statSync(filePath);
      const isHeavy = stats.size > 8 * 1024 * 1024;

      // Enviar audio o documento dependiendo del tamaño
      if (isHeavy) {
        await sock.sendMessage(chatId, {
          document: { url: filePath },
          mimetype: 'audio/mpeg',
          fileName: `${mp3Info.title}.mp3`
        });
      } else {
        await sock.sendMessage(chatId, {
          audio: { url: filePath },
          mimetype: 'audio/mpeg'
        });
      }

      fs.unlinkSync(filePath); // eliminar archivo temporal
    }

    await sock.sendMessage(chatId, { text: '✅ Playlist completa enviada.' });
  } catch (err) {
    console.error(err);
    await sock.sendMessage(chatId, { text: '❌ Error al procesar la playlist.' });
  }
}
