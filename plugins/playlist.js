// playlist.js
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
    let url = args[0] || text.trim();
    if (!url) return m.reply(`🎵 Ingresa el enlace de una playlist de YouTube.\n\nEjemplo:\n${usedPrefix + command} https://youtube.com/playlist?list=PLxxxx`);

    if (!url.includes('playlist?list=')) return m.reply('❌ El enlace no es una playlist válida de YouTube.');

    await m.reply('⏳ Obteniendo lista de canciones desde API...');

    try {
        // API gratuita
        let res = await fetch(`https://api.lolhuman.xyz/api/ytplaylist?apikey=GATA_DIOS&url=${encodeURIComponent(url)}`);
        let json = await res.json();

        if (!json.result?.video?.length) {
            return m.reply('❌ No se pudo obtener la playlist.');
        }

        let total = json.result.video.length;
        await m.reply(`📀 *Playlist:* ${json.result.title}\n🎶 *Total canciones:* ${total}\n\n▶️ Descargando...`);

        let archivos = [];

        for (let i = 0; i < total; i++) {
            let vid = json.result.video[i];
            let audioUrl = `https://api.lolhuman.xyz/api/ytaudio2?apikey=GATA_DIOS&url=${encodeURIComponent(vid.url)}`;
            let filePath = path.join(__dirname, `temp_${Date.now()}_${i}.mp3`);

            let audioRes = await fetch(audioUrl);
            let buffer = await audioRes.buffer();
            fs.writeFileSync(filePath, buffer);

            archivos.push({ path: filePath, title: vid.title });
        }

        if (total > 20) {
            let zipPath = path.join(__dirname, `playlist_${Date.now()}.zip`);
            let outputZip = fs.createWriteStream(zipPath);
            let archive = archiver('zip', { zlib: { level: 9 } });

            archive.pipe(outputZip);
            archivos.forEach(({ path: filePath, title }) => {
                archive.file(filePath, { name: `${title}.mp3` });
            });
            await archive.finalize();

            outputZip.on('close', async () => {
                await conn.sendMessage(m.chat, {
                    document: fs.readFileSync(zipPath),
                    mimetype: 'application/zip',
                    fileName: `${json.result.title}.zip`
                }, { quoted: m });

                archivos.forEach(a => fs.unlinkSync(a.path));
                fs.unlinkSync(zipPath);

                await m.reply('🎉 Playlist enviada completa en ZIP.');
            });

        } else {
            for (let { path: filePath, title } of archivos) {
                await conn.sendMessage(m.chat, {
                    audio: fs.readFileSync(filePath),
                    mimetype: 'audio/mpeg',
                    fileName: `${title}.mp3`
                }, { quoted: m });
                fs.unlinkSync(filePath);
            }
            await m.reply('🎉 Playlist enviada completa.');
        }

    } catch (e) {
        console.error(e);
        m.reply('❌ Error al procesar la playlist.');
    }
};

// Detecta con o sin prefijo
handler.customPrefix = /^(playlist|pl)$/i;
handler.command = new RegExp;
handler.help = ['playlist <url>'];
handler.tags = ['descargas'];

export default handler;
