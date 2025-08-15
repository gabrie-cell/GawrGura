import axios from 'axios';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

export async function comandoPlaylist(sock, chatId, playlistUrl) {
  try {
    // 1️⃣ Obtener links de videos en la playlist
    let videoLinks = [];
    try {
      const res = await axios.get(`https://api.cafirexos.com/api/ytplaylist?url=${encodeURIComponent(playlistUrl)}`);
      if (res.data?.videos) {
        videoLinks = res.data.videos.map(v => v.url);
      }
    } catch {
      try {
        const res = await axios.get(`https://api.luistar15.com/ytplaylist?url=${encodeURIComponent(playlistUrl)}`);
        if (res.data?.videos) {
          videoLinks = res.data.videos.map(v => v.url);
        }
      } catch {
        console.log("⚠ No se pudo obtener con las APIs, probando con yt-dlp como último recurso...");
        videoLinks = await getPlaylistLinksYT_DLP(playlistUrl);
      }
    }

    if (!videoLinks.length) {
      return await sock.sendMessage(chatId, { text: "❌ No se pudo obtener la playlist." });
    }

    // 2️⃣ Descargar y enviar cada canción
    for (let link of videoLinks) {
      let mp3Url = null;

      // Intentar con la API de Delirius
      try {
        const res = await axios.get(`https://delirius-apiofc.vercel.app/download/ytmp3?url=${encodeURIComponent(link)}`);
        if (res.data?.status && res.data?.data?.download?.url) {
          mp3Url = res.data.data.download.url;
        }
      } catch {}

      // Intentar con otra API pública
      if (!mp3Url) {
        try {
          const res = await axios.get(`https://api.akuari.my.id/downloader/youtubeaudio?link=${encodeURIComponent(link)}`);
          if (res.data?.success && res.data?.result?.link) {
            mp3Url = res.data.result.link;
          }
        } catch {}
      }

      // Usar yt-dlp como último recurso
      if (!mp3Url) {
        mp3Url = await downloadWithYTDLP(link);
      }

      if (mp3Url) {
        try {
          const filename = `${Date.now()}.mp3`;
          const filePath = path.join(process.cwd(), filename);
          const response = await axios({ url: mp3Url, method: 'GET', responseType: 'stream' });

          await new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);
            writer.on('finish', resolve);
            writer.on('error', reject);
          });

          const stats = fs.statSync(filePath);
          if (stats.size > 10 * 1024 * 1024) {
            await sock.sendMessage(chatId, { document: fs.readFileSync(filePath), mimetype: 'audio/mpeg', fileName: filename });
          } else {
            await sock.sendMessage(chatId, { audio: fs.readFileSync(filePath), mimetype: 'audio/mpeg' });
          }
          fs.unlinkSync(filePath);
        } catch (err) {
          console.error("Error enviando canción:", err.message);
        }
      }
    }
  } catch (err) {
    console.error(err);
    await sock.sendMessage(chatId, { text: "❌ Error procesando la playlist." });
  }
}

// Obtener links usando yt-dlp
async function getPlaylistLinksYT_DLP(url) {
  return new Promise((resolve) => {
    const links = [];
    const yt = spawn('yt-dlp', ['--flat-playlist', '--print', 'url', url]);

    yt.stdout.on('data', (data) => {
      links.push(...data.toString().trim().split('\n'));
    });

    yt.on('close', () => resolve(links));
    yt.on('error', () => resolve([]));
  });
}

// Descargar mp3 con yt-dlp
async function downloadWithYTDLP(url) {
  return new Promise((resolve) => {
    const filename = `${Date.now()}.mp3`;
    const outputPath = path.join(process.cwd(), filename);
    const yt = spawn('yt-dlp', ['-x', '--audio-format', 'mp3', '-o', outputPath, url]);

    yt.on('close', () => resolve(outputPath));
    yt.on('error', () => resolve(null));
  });
}
