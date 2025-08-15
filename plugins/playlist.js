import fetch from 'node-fetch';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('📀 Ingresa la URL de la playlist de YouTube');

  const tempDir = './temp_playlist';
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

  m.reply('🔍 Obteniendo lista de videos...');

  // Obtener títulos y URLs de la playlist con yt-dlp (modo rápido)
  const list = spawn('yt-dlp', ['--flat-playlist', '--print', 'title', '--print', 'url', text]);

  let output = '';
  list.stdout.on('data', data => { output += data.toString(); });

  list.on('close', async () => {
    let lines = output.trim().split('\n');

    for (let i = 0; i < lines.length; i += 2) {
      let title = lines[i];
      let url = lines[i + 1];
      m.reply(`🎵 Descargando: ${title}`);

      let filePath = path.join(tempDir, `${title.replace(/[\/\\?%*:|"<>]/g, '_')}.mp3`);

      // Primero intentar con la API Delirius
      let downloaded = false;
      try {
        let apiUrl = `https://delirius-apiofc.vercel.app/download/ytmp3?url=${url}`;
        let res = await fetch(apiUrl);
        let json = await res.json();

        if (json.status && json.download?.url) {
          let audioRes = await fetch(json.download.url);
          let buffer = await audioRes.arrayBuffer();
          fs.writeFileSync(filePath, Buffer.from(buffer));
          downloaded = true;
        }
      } catch (e) {
        console.error(`❌ API Delirius falló para ${title}`, e);
      }

      // Si la API falla, usar yt-dlp local
      if (!downloaded) {
        await new Promise((resolve, reject) => {
          const dl = spawn('yt-dlp', [
            '-x', '--audio-format', 'mp3', '-o', filePath, url
          ]);

          dl.on('close', resolve);
          dl.on('error', reject);
        });
      }

      // Enviar audio
      try {
        await conn.sendMessage(m.chat, {
          audio: fs.readFileSync(filePath),
          mimetype: 'audio/mpeg',
          fileName: `${title}.mp3`
        }, { quoted: m });
        fs.unlinkSync(filePath);
      } catch (e) {
        console.error(e);
      }
    }

    m.reply('✅ Playlist enviada completa');
  });
};

handler.command = ['playlist'];
export default handler;
