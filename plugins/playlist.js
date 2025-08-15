const fetch = require('node-fetch');
const ytpl = require('ytpl');
const fs = require('fs');
const path = require('path');
const ytdlp = require('yt-dlp-exec');
const archiver = require('archiver');

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) return m.reply(`🎵 Ingresa el enlace de una playlist de YouTube.\n\nEjemplo:\n${usedPrefix + command} https://youtube.com/playlist?list=PL123456`);

    let url = args[0];
    if (!url.includes('playlist?list=')) return m.reply('❌ El enlace no es una playlist válida de YouTube.');

    await m.reply('⏳ Obteniendo lista de canciones...');

    try {
        let playlist = await ytpl(url, { limit: Infinity });
        let total = playlist.items.length;
        await conn.sendMessage(m.chat, { text: `📀 *Playlist:* ${playlist.title}\n🎶 *Total canciones:* ${total}\n\n▶️ Descargando todas las canciones...` }, { quoted: m });

        let archivos = [];

        for (let i = 0; i < total; i++) {
            let video = playlist.items[i];
            let output = path.join(__dirname, `temp_${Date.now()}_${i}.mp3`);

            // Mensaje de progreso
            await conn.sendMessage(m.chat, { text: `🎶 Descargando ${i + 1}/${total} canciones...\n▶️ ${video.title}` }, { quoted: m });

            await ytdlp(video.url, {
                extractAudio: true,
                audioFormat: 'mp3',
                audioQuality: 0,
                output
            });

            archivos.push({
                path: output,
                title: video.title
            });
        }

        if (total > 20) {
            let zipPath = path.join(__dirname, `playlist_${Date.now()}.zip`);
            let outputZip = fs.createWriteStream(zipPath);
            let archive = archiver('zip', { zlib: { level: 9 } });

            archive.pipe(outputZip);
            for (let { path: filePath, title } of archivos) {
                archive.file(filePath, { name: `${title}.mp3` });
            }
            await archive.finalize();

            outputZip.on('close', async () => {
                await conn.sendMessage(m.chat, {
                    document: fs.readFileSync(zipPath),
                    mimetype: 'application/zip',
                    fileName: `${playlist.title}.zip`
                }, { quoted: m });

                archivos.forEach(a => fs.unlinkSync(a.path));
                fs.unlinkSync(zipPath);

                await m.reply('🎉 Playlist enviada completa en ZIP.');
            });

        } else {
            await m.reply('✅ Descargas completas, enviando playlist...');

            for (let { path: filePath, title } of archivos) {
                let stats = fs.statSync(filePath);
                let sizeMB = stats.size / (1024 * 1024);

                if (sizeMB > 15) {
                    await conn.sendMessage(m.chat, {
                        document: fs.readFileSync(filePath),
                        mimetype: 'audio/mpeg',
                        fileName: `${title}.mp3`
                    }, { quoted: m });
                } else {
                    await conn.sendMessage(m.chat, {
                        audio: fs.readFileSync(filePath),
                        mimetype: 'audio/mpeg',
                        fileName: `${title}.mp3`
                    }, { quoted: m });
                }

                fs.unlinkSync(filePath);
            }

            await m.reply('🎉 Playlist enviada completa.');
        }

    } catch (e) {
        console.error(e);
        m.reply('❌ Error al procesar la playlist.');
    }
};

handler.command = /^playlist$/i;
handler.help = ['playlist <url>'];
handler.tags = ['descargas'];

module.exports = handler;
