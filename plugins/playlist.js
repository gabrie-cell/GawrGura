const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

let handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) return m.reply(`🎵 Ingresa el enlace de una playlist de YouTube.\n\nEjemplo:\n${usedPrefix + command} https://youtube.com/playlist?list=PL123456`);

    let url = args[0];
    if (!url.includes('playlist?list=')) return m.reply('❌ El enlace no es una playlist válida de YouTube.');

    await m.reply('⏳ Obteniendo lista de canciones desde API...');

    try {
        // API para obtener playlist
        let res = await fetch(`https://api.lolhuman.xyz/api/ytplaylist?apikey=GATA_DIOS&url=${encodeURIComponent(url)}`);
        let json = await res.json();

        if (!json.result || !json.result.video || json.result.video.length === 0) {
            return m.reply('❌ No se pudo obtener la playlist.');
        }

        let total = json.result.video.length;
        await m.reply(`📀 *Playlist:* ${json.result.title}\n🎶 *Total canciones:* ${total}\n\n▶️ Descargando desde API...`);

        let archivos = [];

        for (let i = 0; i < total; i++) {
            let vid = json.result.video[i];
            let audioUrl = `https://api.lolhuman.xyz/api/ytaudio2?apikey=GATA_DIOS&url=${encodeURIComponent(vid.url)}`;
            let filePath = path.join(__dirname, `temp_${Date.now()}_${i}.mp3`);

            let audioRes = await fetch(audioUrl);
            let buffer = await audioRes.buffer();
            fs.writeFileSync(filePath, buffer);

            archivos.push({
                path: filePath,
                title: vid.title
            });
        }

        if (total > 20) {
            // Comprimir a ZIP
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

handler.command = /^playlist$/i;
handler.help = ['playlist <url>'];
handler.tags = ['descargas'];

module.exports = handler;
