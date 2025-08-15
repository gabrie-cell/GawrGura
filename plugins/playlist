import fetch from 'node-fetch';
import ytpl from 'ytpl';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ytdlp from 'yt-dlp-exec';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) return m.reply(`🎵 Ingresa el enlace de una playlist de YouTube.\n\nEjemplo:\n${usedPrefix + command} https://youtube.com/playlist?list=PL123456`);

  let url = args[0];
  if (!url.includes('playlist?list=')) return m.reply('❌ El enlace no es una playlist válida de YouTube.');

  m.reply('⏳ Obteniendo lista de canciones...');

  try {
    let playlist = await ytpl(url, { limit: Infinity });
    let total = playlist.items.length;
    await m.reply(`📀 *Playlist:* ${playlist.title}\n🎶 *Total canciones:* ${total}\n\n▶️ Comenzando descargas...`);

    for (let i = 0; i < total; i++) {
      let video = playlist.items[i];
      let output = path.join(__dirname, `temp_${Date.now()}.mp3`);

      await ytdlp(video.url, {
        extractAudio: true,
        audioFormat: 'mp3',
        audioQuality: 0,
        output
      });

      let stats = fs.statSync(output);
      let sizeMB = stats.size / (1024 * 1024);

      if (sizeMB > 15) {
        await conn.sendMessage(m.chat, { document: fs.readFileSync(output), mimetype: 'audio/mpeg', fileName: `${video.title}.mp3` }, { quoted: m });
      } else {
        await conn.sendMessage(m.chat, { audio: fs.readFileSync(output), mimetype: 'audio/mpeg', fileName: `${video.title}.mp3` }, { quoted: m });
      }

      fs.unlinkSync(output);
    }

    await m.reply('✅ Playlist enviada completa.');
  } catch (e) {
    console.error(e);
    m.reply('❌ Error al procesar la playlist.');
  }
};

handler.command = /^playlist$/i;
export default handler;
