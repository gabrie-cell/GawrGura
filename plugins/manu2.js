let handler = async (m, { conn, args }) => {
  let userId = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.sender
  let user = global.db.data.users[userId]
  let name = conn.getName(userId)
  let _uptime = process.uptime() * 1000
  let uptime = clockString(_uptime)
  let totalreg = Object.keys(global.db.data.users).length
  let totalCommands = Object.values(global.plugins).filter((v) => v.help && v.tags).length

  // 20 Decoraciones
  let decoraciones = [
    "🌸💙🎤", "💙🎶🌟", "🌌🎶💎", "🎤💙🌸", "🎶🌟💙",
    "🌺💚🎤", "🌈🎶🌸", "💙💎🎶", "🎵🌸💙", "🌟🎤💙",
    "🎤🌺💎", "💙🌌🎶", "🌸🌈💚", "💙🎵🌺", "🌟💎🎤",
    "🎶🌌🌸", "💚💎🎶", "🌈💙🎤", "💙🌸🎵", "🎤🌟💎"
  ]

  // 20 pares de bordes
  let bordes = [
    { top: "╭━━━✦❘༻🌸༺❘✦━━━╮", bottom: "╰━━━✦❘༻🌸༺❘✦━━━╯" },
    { top: "╔═══*.·:·.☽✧☾.·:·.*═══╗", bottom: "╚═══*.·:·.☽✧☾.·:·.*═══╝" },
    { top: "┏━━━ 💙 🎤 💙 ━━━┓", bottom: "┗━━━ 💙 🎤 💙 ━━━┛" },
    { top: "┏━━━━━━━━━━━━━━━━━┓", bottom: "┗━━━━━━━━━━━━━━━━━┛" },
    { top: "╔═══🎶💙🎶═══╗", bottom: "╚═══🎶💙🎶═══╝" },
    { top: "╭─💙─🌸─💙─╮", bottom: "╰─💙─🌸─💙─╯" },
    { top: "❀━━━━━━━❀", bottom: "❀━━━━━━━❀" },
    { top: "✦───💙───✦", bottom: "✦───💙───✦" },
    { top: "╭──•✧💙✧•──╮", bottom: "╰──•✧💙✧•──╯" },
    { top: "╔═💙═🌸═💙═╗", bottom: "╚═💙═🌸═💙═╝" },
    { top: "╭🌟━━━━━🌟╮", bottom: "╰🌟━━━━━🌟╯" },
    { top: "╔🎵═════🎵╗", bottom: "╚🎵═════🎵╝" },
    { top: "┏💎━━━━━━━💎┓", bottom: "┗💎━━━━━━━💎┛" },
    { top: "╭🌈━━━━━━━🌈╮", bottom: "╰🌈━━━━━━━🌈╯" },
    { top: "╔🌺═══════🌺╗", bottom: "╚🌺═══════🌺╝" },
    { top: "✿━━━━━━━✿", bottom: "✿━━━━━━━✿" },
    { top: "╭✧━━━━━━━✧╮", bottom: "╰✧━━━━━━━✧╯" },
    { top: "╔★═══════★╗", bottom: "╚★═══════★╝" },
    { top: "┏➤━━━━━━━➤┓", bottom: "┗➤━━━━━━━➤┛" },
    { top: "╭❍━━━━━━━❍╮", bottom: "╰❍━━━━━━━❍╯" }
  ]

  // 20 iconos para comandos
  let iconosCmd = [
    "ᰔᩚ", "✦", "❍", "➤", "★", "✧", "✪", "➺", "✿", "➳",
    "🌸", "💙", "🎤", "🎶", "💎", "🌟", "🌺", "🎵", "🌈", "💚"
  ]

  // Elecciones aleatorias
  let deco = decoraciones[Math.floor(Math.random() * decoraciones.length)]
  let bordeSel = bordes[Math.floor(Math.random() * bordes.length)]
  let icono = iconosCmd[Math.floor(Math.random() * iconosCmd.length)]

  let txt = `
${bordeSel.top}
${deco} 𝑯𝑨𝑻𝑺𝑼𝑵𝑬 𝑴𝑬𝑵𝑼 𝑼𝑳𝑻𝑹𝑨 ${deco}
╭┈─────────────────
│✎ Cliente ➪ @${userId.split('@')[0]}
│✎ Modo ➪ Publico
│✎ Soy *${botname}*, tu bot virtual.
│✎ Bot ➪ ${(conn.user.jid == global.conn.user.jid ? 'Principal 🅥' : 'Prem Bot 🅑')}
│✎ Activada ➪ ${uptime}
│✎ Usuarios ➪ ${totalreg}
│✎ Comandos ➪ ${totalCommands}
│✎ Baileys ➪ Multi Device
╰─────────────────

• :･ﾟ⊹˚• \`『 Info-Bot 』\` •˚⊹:･ﾟ•

❍ Comandos para ver estado e información de la Bot.
${icono} *#help • #menu*
> ✦ Ver la lista de comandos de la Bot.
${icono} *#uptime • #runtime*
> ✦ Ver tiempo activo o en linea de la Bot.
${icono} *#sc • #script*
> ✦ Link del repositorio oficial de la Bot
${icono} *#staff • #colaboradores*
> ✦ Ver la lista de desarrolladores de la Bot.
${icono} *#serbot • #serbot code*
> ✦ Crea una sesión de Sub-Bot.
${icono} *#bots • #sockets*
> ✦ Ver la lista de Sub-Bots activos.
${icono} *#status • #estado*
> ✦ Ver el estado actual de la Bot.
${icono} *#links • #grupos*
> ✦ Ver los enlaces oficiales de la Bot.
${icono} *#infobot • #infobot*
> ✦ Ver la información completa de la Bot.
${icono} *#sug • #newcommand*
> ✦ Sugiere un nuevo comando.
${icono} *#p • #ping*
> ✦ Ver la velocidad de respuesta del Bot.
${icono} *#reporte • #reportar*
> ✦ Reporta alguna falla o problema de la Bot.
${icono} *#sistema • #system*
> ✦ Ver estado del sistema de alojamiento.
${icono} *#speed • #speedtest*
> ✦ Ver las estadísticas de velocidad de la Bot.
${icono} *#views • #usuarios*
> ✦ Ver la cantidad de usuarios registrados en el sistema.
${icono} *#funciones • #totalfunciones*
> ✦ Ver todas las funciones de la Bot.
${icono} *#ds • #fixmsgespera*
> ✦ Eliminar archivos de sesión innecesarios.
${icono} *#editautoresponder*
> ✦ Configurar un Prompt personalizado de la Bot.
• :･ﾟ⊹˚• `『 Buscadores 』` •˚⊹:･ﾟ•

❍ Comandos para realizar búsquedas en distintas plataformas.
${icono} *#tiktoksearch • #tiktoks*
> ✦ Buscador de videos de tiktok.
${icono} *#tweetposts*
> ✦ Buscador de posts de Twitter/X.
${icono} *#ytsearch • #yts*
> ✦ Realiza búsquedas de Youtube.
${icono} *#githubsearch*
> ✦ Buscador de usuarios de GitHub.
${icono} *#cuevana • #cuevanasearch*
> ✦ Buscador de películas/series por Cuevana.
${icono} *#google*
> ✦ Realiza búsquedas por Google.
${icono} *#pin • #pinterest*
> ✦ Buscador de imagenes de Pinterest.
${icono} *#imagen • #image*
> ✦ buscador de imagenes de Google.
${icono} *#infoanime*
> ✦ Buscador de información de anime/manga.
${icono} *#hentaisearch • #searchhentai*
> ✦ Buscador de capítulos hentai.
${icono} #xnxxsearch • #xnxxs*
> ✦ Buscador de vídeos de Xnxx.
${icono} *#xvsearch • #xvideossearch*
> ✦ Buscador de vídeos de Xvideos.
${icono} *#pornhubsearch • #phsearch*
> ✦ Buscador de videos de Pornhub.
${icono} *#npmjs*
> ✦ Buscandor de npmjs.

• :･ﾟ⊹˚• `『 Descargas 』` •˚⊹:･ﾟ•

❍ Comandos de descargas para varios archivos.
${icono} *#tiktok • #tt*
> ✦ Descarga videos de TikTok.
${icono} *#mediafire • #mf*
> ✦ Descargar un archivo de MediaFire.
${icono} *#pinvid • #pinvideo* + [enlacé]
> ✦ Descargar vídeos de Pinterest. 
${icono} *#mega • #mg* + [enlacé]
> ✦ Descargar un archivo de MEGA.
${icono} *#play • #play2*
> ✦ Descarga música/video de YouTube.
${icono} *#ytmp3 • #ytmp4*
> ✦ Descarga música/video de YouTube mediante url.
${icono} *#fb • #facebook*
> ✦ Descarga videos de Facebook.
${icono} *#twitter • #x* + [Link]
> ✦ Descargar un video de Twitter/X
${icono} *#ig • #instagram*
> ✦ Descarga contenido de Instagram.
${icono} *#tts • #tiktoks* + [busqueda]
> ✦ Buscar videos de tiktok 
${icono} *#terabox • #tb* + [enlace]
> ✦ Descargar archivos por Terabox.
${icono} *#ttimg • #ttmp3* + <url>
> ✦ Descarga fotos/audios de tiktok. 
${icono} *#gitclone* + <url> 
> ✦ Descarga un repositorio de github.
${icono} *#xvideosdl*
> ✦ Descarga videos porno de (Xvideos). 
${icono} *#xnxxdl*
> ✦ Descarga videos porno de (xnxx).
${icono} *#apk • #modapk*
> ✦ Descarga un apk de Aptoide.
${icono} *#tiktokrandom • #ttrandom*
> ✦ Descarga un video aleatorio de tiktok.
${icono} *#npmdl • #npmdownloader*
> ✦ Descarga paquetes de NPMJs.

• :･ﾟ⊹˚• `『 Economia 』` •˚⊹:･ﾟ•

❍ Comandos de economía y rpg para ganar dinero y otros recursos.
${icono} *#w • #work • #trabajar*
> ✦ Trabaja para ganar ${moneda}.
${icono} *#slut • #protituirse*
> ✦ Trabaja como prostituta y gana ${moneda}.
${icono} *#cf • #suerte*
> ✦ Apuesta tus ${moneda} a cara o cruz.
${icono} *#crime • #crimen*
> ✦ Trabaja como ladrón para ganar ${moneda}.
${icono} *#ruleta • #roulette • #rt*
> ✦ Apuesta ${moneda} al color rojo o negro.
${icono} *#casino • #apostar*
> ✦ Apuesta tus ${moneda} en el casino.
${icono} *#slot*
> ✦ Apuesta tus ${moneda} en la ruleta y prueba tu suerte.
${icono} *#cartera • #wallet*
> ✦ Ver tus ${moneda} en la cartera.
${icono} *#banco • #bank*
> ✦ Ver tus ${moneda} en el banco.
${icono} *#deposit • #depositar • #d*
> ✦ Deposita tus ${moneda} al banco.
${icono} *#with • #retirar • #withdraw*
> ✦ Retira tus ${moneda} del banco.
${icono} *#transfer • #pay*
> ✦ Transfiere ${moneda} o XP a otros usuarios.
${icono} *#miming • #minar • #mine*
> ✦ Trabaja como minero y recolecta recursos.
${icono} *#buyall • #buy*
> ✦ Compra ${moneda} con tu XP.
${icono} *#daily • #diario*
> ✦ Reclama tu recompensa diaria.
${icono} *#cofre*
> ✦ Reclama un cofre diario lleno de recursos.
${icono} *#weekly • #semanal*
> ✦ Reclama tu regalo semanal.
${icono} *#monthly • #mensual*
> ✦ Reclama tu recompensa mensual.
${icono} *#steal • #robar • #rob*
> ✦ Intenta robarle ${moneda} a alguien.
${icono} *#robarxp • #robxp*
> ✦ Intenta robar XP a un usuario.
${icono} *#eboard • #baltop*
> ✦ Ver el ranking de usuarios con más ${moneda}.
${icono} *#aventura • #adventure*
> ✦ Aventúrate en un nuevo reino y recolecta recursos.
${icono} *#curar • #heal*
> ✦ Cura tu salud para volverte aventurar.
${icono} *#cazar • #hunt • #berburu*
> ✦ Aventúrate en una caza de animales.
${icono} *#inv • #inventario*
> ✦ Ver tu inventario con todos tus ítems.
${icono} *#mazmorra • #explorar*
> ✦ Explorar mazmorras para ganar ${moneda}.
${icono} *#halloween*
> ✦ Reclama tu dulce o truco (Solo en Halloween).
${icono} *#christmas • #navidad*
> ✦ Reclama tu regalo navideño (Solo en Navidad).
• :･ﾟ⊹˚• `『 Gacha 』` •˚⊹:･ﾟ•

❍ Comandos de gacha para reclamar y colecciónar personajes.
${icono} *#rollwaifu • #rw • #roll*
> ✦ Waifu o husbando aleatorio.
${icono} *#claim • #c • #reclamar*
> ✦ Reclamar un personaje.
${icono} *#harem • #waifus • #claims*
> ✦ Ver tus personajes reclamados.
${icono} *#charimage • #waifuimage • #wimage* 
> ✦ Ver una imagen aleatoria de un personaje.
${icono} *#charinfo • #winfo • #waifuinfo*
> ✦ Ver información de un personaje.
${icono} *#givechar • #givewaifu • #regalar*
> ✦ Regalar un personaje a otro usuario.
${icono} *#vote • #votar*
> ✦ Votar por un personaje para subir su valor.
${icono} *#waifusboard • #waifustop • #topwaifus*
> ✦ Ver el top de personajes con mayor valor.

• :･ﾟ⊹˚• `『 Stickers 』` •˚⊹:･ﾟ•

❍ Comandos para creaciones de stickers etc.
${icono} *#sticker • #s*
> ✦ Crea stickers de (imagen/video)
${icono} *#setmeta*
> ✦ Estable un pack y autor para los stickers.
${icono} *#delmeta*
> ✦ Elimina tu pack de stickers.
${icono} *#pfp • #getpic*
> ✦ Obtén la foto de perfil de un usuario.
${icono} *#qc*
> ✦ Crea stickers con texto o de un usuario.
${icono} *#toimg • #img*
> ✦ Convierte stickers en imagen.
${icono} *#brat • #ttp • #attp*
> ✦ Crea stickers con texto.
${icono} *#emojimix*
> ✦ Fuciona 2 emojis para crear un sticker.
${icono} *#wm*
> ✦ Cambia el nombre de los stickers.

• :･ﾟ⊹˚• `『 Herramientas 』` •˚⊹:･ﾟ•

❍ Comandos de herramientas con muchas funciones.
${icono} *#calcular • #calcular • #cal*
> ✦ Calcular todo tipo de ecuaciones.
${icono} *#tiempo • #clima*
> ✦ Ver el clima de un pais.
${icono} *#horario*
> ✦ Ver el horario global de los países.
${icono} *#fake • #fakereply*
> ✦ Crea un mensaje falso de un usuario.
${icono} *#enhance • #remini • #hd*
> ✦ Mejora la calidad de una imagen.
${icono} *#letra*
> ✦ Cambia la fuente de las letras.
${icono} *#read • #readviewonce • #ver*
> ✦ Ver imágenes de una sola vista.
${icono} *#whatmusic • #shazam*
> ✦ Descubre el nombre de canciones o vídeos.
${icono} *#ss • #ssweb*
> ✦ Ver el estado de una página web.
${icono} *#length • #tamaño*
> ✦ Cambia el tamaño de imágenes y vídeos.
${icono} *#say • #decir* + [texto]
> ✦ Repetir un mensaje.
${icono} *#todoc • #toducument*
> ✦ Crea documentos de (audio, imágenes y vídeos).
${icono} *#translate • #traducir • #trad*
> ✦ Traduce palabras en otros idiomas.

• :･ﾟ⊹˚• `『 Perfil 』` •˚⊹:･ﾟ•

❍ Comandos de perfil para ver, configurar y comprobar estados de tu perfil.
${icono} *#reg • #verificar • #register*
> ✦ Registra tu nombre y edad en el bot.
${icono} *#unreg*
> ✦ Elimina tu registro del bot.
${icono} *#profile*
> ✦ Muestra tu perfil de usuario.
${icono} *#marry* [mension / etiquetar]
> ✦ Propón matrimonio a otro usuario.
${icono} *#divorce*
> ✦ Divorciarte de tu pareja.
${icono} *#setgenre • #setgenero*
> ✦ Establece tu género en el perfil del bot.
${icono} *#delgenre • #delgenero*
> ✦ Elimina tu género del perfil del bot.
${icono} *#setbirth • #setnacimiento*
> ✦ Establece tu fecha de nacimiento en el perfil del bot.
${icono} *#delbirth • #delnacimiento*
> ✦ Elimina tu fecha de nacimiento del perfil del bot.
${icono} *#setdescription • #setdesc*
> ✦ Establece una descripción en tu perfil del bot.
${icono} *#deldescription • #deldesc*
> ✦ Elimina la descripción de tu perfil del bot.
${icono} *#lb • #lboard* + <Paginá>
> ✦ Top de usuarios con más (experiencia y nivel).
${icono} *#level • #lvl* + <@Mencion>
> ✦ Ver tu nivel y experiencia actual.
${icono} *#comprarpremium • #premium*
> ✦ Compra un pase premium para usar el bot sin límites.
${icono} *#confesiones • #confesar*
> ✦ Confiesa tus sentimientos a alguien de manera anonima.

• :･ﾟ⊹˚• `『 Grupos 』` •˚⊹:･ﾟ•

❍ Comandos de grupos para una mejor gestión de ellos.
${icono} *#hidetag*
> ✦ Envia un mensaje mencionando a todos los usuarios
${icono} *#gp • #infogrupo*
> ✦  Ver la Informacion del grupo.
${icono} *#linea • #listonline*
> ✦ Ver la lista de los usuarios en linea.
${icono} *#setwelcome*
> ✦ Establecer un mensaje de bienvenida personalizado.
${icono} *#setbye*
> ✦ Establecer un mensaje de despedida personalizado.
${icono} *#link*
> ✦ El bot envia el link del grupo.
${icono} *admins • admin*
> ✦ Mencionar a los admins para solicitar ayuda.
${icono} *#restablecer • #revoke*
> ✦ Restablecer el enlace del grupo.
${icono} *#grupo • #group* [open / abrir]
> ✦ Cambia ajustes del grupo para que todos los usuarios envien mensaje.
${icono} *#grupo • #gruop* [close / cerrar]
> ✦ Cambia ajustes del grupo para que solo los administradores envien mensaje.
${icono} *#kick* [número / mension]
> ✦ Elimina un usuario de un grupo.
${icono} *#add • #añadir • #agregar* [número]
> ✦ Invita a un usuario a tu grupo.
${icono} *#promote* [mension / etiquetar]
> ✦ El bot dara administrador al usuario mencionando.
${icono} *#demote* [mension / etiquetar]
> ✦ El bot quitara administrador al usuario mencionando.
${icono} *#gpbanner • #groupimg*
> ✦ Cambiar la imagen del grupo.
${icono} *#gpname • #groupname*
> ✦ Cambiar el nombre del grupo.
${icono} *#gpdesc • #groupdesc*
> ✦ Cambiar la descripción del grupo.
${icono} *#advertir • #warn • #warning*
> ✦ Darle una advertencia aún usuario.
${icono} *#unwarn • #delwarn*
> ✦ Quitar advertencias.
${icono} *#advlist • #listadv*
> ✦ Ver lista de usuarios advertidos.
${icono} *#bot on*
> ✦ Enciende el bot en un grupo.
${icono} *#bot off*
> ✦ Apaga el bot en un grupo.
${icono} *#mute* [mension / etiquetar]
> ✦ El bot elimina los mensajes del usuario.
${icono} *#unmute* [mension / etiquetar]
> ✦ El bot deja de eliminar los mensajes del usuario.
${icono} *#encuesta • #poll*
> ✦ Crea una encuesta.
${icono} *#delete • #del*
> ✦ Elimina mensaje de otros usuarios.
${icono} *#fantasmas*
> ✦ Ver lista de inactivos del grupo.
${icono} *#kickfantasmas*
> ✦ Elimina a los inactivos del grupo.
${icono} *#invocar • #tagall • #todos*
> ✦ Invoca a todos los usuarios de un grupo.
${icono} *#setemoji • #setemo*
> ✦ Cambia el emoji que se usa en la invitación de usuarios.
${icono} *#listnum • #kicknum*
> ✦ Elimine a usuario por el prefijo de país.
• :･ﾟ⊹˚• `『 Anime 』` •˚⊹:･ﾟ•

❍ Comandos de reacciones de anime.
${icono} *#angry • #enojado* + <mencion>
> ✦ Estar enojado
${icono} *#bite* + <mencion>
> ✦ Muerde a alguien
${icono} *#bleh* + <mencion>
> ✦ Sacar la lengua
${icono} *#blush* + <mencion>
> ✦ Sonrojarte
${icono} *#bored • #aburrido* + <mencion>
> ✦ Estar aburrido
${icono} *#cry* + <mencion>
> ✦ Llorar por algo o alguien
${icono} *#cuddle* + <mencion>
> ✦ Acurrucarse
${icono} *#dance* + <mencion>
> ✦ Sacate los pasitos prohíbidos
${icono} *#drunk* + <mencion>
> ✦ Estar borracho
${icono} *#eat • #comer* + <mencion>
> ✦ Comer algo delicioso
${icono} *#facepalm* + <mencion>
> ✦ Darte una palmada en la cara
${icono} *#happy • #feliz* + <mencion>
> ✦ Salta de felicidad
${icono} *#hug* + <mencion>
> ✦ Dar un abrazo
${icono} *#impregnate • #preg* + <mencion>
> ✦ Embarazar a alguien
${icono} *#kill* + <mencion>
> ✦ Toma tu arma y mata a alguien
${icono} *#kiss • #besar • #kiss2* + <mencion>
> ✦ Dar un beso
${icono} *#laugh* + <mencion>
> ✦ Reírte de algo o alguien
${icono} *#lick* + <mencion>
> ✦ Lamer a alguien
${icono} *#love • #amor* + <mencion>
> ✦ Sentirse enamorado
${icono} *#pat* + <mencion>
> ✦ Acaricia a alguien
${icono} *#poke* + <mencion>
> ✦ Picar a alguien
${icono} *#pout* + <mencion>
> ✦ Hacer pucheros
${icono} *#punch* + <mencion>
> ✦ Dar un puñetazo
${icono} *#run* + <mencion>
> ✦ Correr
${icono} *#sad • #triste* + <mencion>
> ✦ Expresar tristeza
${icono} *#scared* + <mencion>
> ✦ Estar asustado
${icono} *#seduce* + <mencion>
> ✦ Seducir a alguien
${icono} *#shy • #timido* + <mencion>
> ✦ Sentir timidez
${icono} *#slap* + <mencion>
> ✦ Dar una bofetada
${icono} *#dias • #days*
> ✦ Darle los buenos días a alguien 
${icono} *#noches • #nights*
> ✦ Darle las buenas noches a alguien 
${icono} *#sleep* + <mencion>
> ✦ Tumbarte a dormir
${icono} *#smoke* + <mencion>
> ✦ Fumar
${icono} *#think* + <mencion>
> ✦ Pensar en algo

• :･ﾟ⊹˚• `『 NSFW 』` •˚⊹:･ﾟ•

❍ Comandos NSFW (Contenido para adultos)
${icono} *#anal* + <mencion>
> ✦ Hacer un anal
${icono} *#waifu*
> ✦ Buscá una waifu aleatorio.
${icono} *#bath* + <mencion>
> ✦ Bañarse
${icono} *#blowjob • #mamada • #bj* + <mencion>
> ✦ Dar una mamada
${icono} *#boobjob* + <mencion>
> ✦ Hacer una rusa
${icono} *#cum* + <mencion>
> ✦ Venirse en alguien.
${icono} *#fap* + <mencion>
> ✦ Hacerse una paja
${icono} *#ppcouple • #ppcp*
> ✦ Genera imagenes para amistades o parejas.
${icono} *#footjob* + <mencion>
> ✦ Hacer una paja con los pies
${icono} *#fuck • #coger • #fuck2* + <mencion>
> ✦ Follarte a alguien
${icono} *#cafe • #coffe*
> ✦ Tomate un cafecito con alguien
${icono} *#violar • #perra* + <mencion>
> ✦ Viola a alguien
${icono} *#grabboobs* + <mencion>
> ✦ Agarrar tetas
${icono} *#grop* + <mencion>
> ✦ Manosear a alguien
${icono} *#lickpussy* + <mencion>
> ✦ Lamer un coño
${icono} *#rule34 • #r34* + [Tags]
> ✦ Buscar imagenes en Rule34
${icono} *#sixnine • #69* + <mencion>
> ✦ Haz un 69 con alguien
${icono} *#spank • #nalgada* + <mencion>
> ✦ Dar una nalgada
${icono} *#suckboobs* + <mencion>
> ✦ Chupar tetas
${icono} *#undress • #encuerar* + <mencion>
> ✦ Desnudar a alguien
${icono} *#yuri • #tijeras* + <mencion>
> ✦ Hacer tijeras.

• :･ﾟ⊹˚• `『 Juegos 』` •˚⊹:･ﾟ•

❍ Comandos de juegos para jugar con tus amigos.
${icono} *#amistad • #amigorandom* 
> ✦ Hacer amigos con un juego. 
${icono} *#chaqueta • #jalamela*
> ✦ Hacerte una chaqueta.
${icono} *#chiste*
> ✦ La bot te cuenta un chiste.
${icono} *#consejo* 
> ✦ La bot te da un consejo. 
${icono} *#doxeo • #doxear* + <mencion>
> ✦ Simular un doxeo falso.
${icono} *#facto*
> ✦ La bot te lanza un facto. 
${icono} *#formarpareja*
> ✦ Forma una pareja. 
${icono} *#formarpareja5*
> ✦ Forma 5 parejas diferentes.
${icono} *#frase*
> ✦ La bot te da una frase.
${icono} *#huevo*
> ✦ Agarrale el huevo a alguien.
${icono} *#chupalo* + <mencion>
> ✦ Hacer que un usuario te la chupe.
${icono} *#aplauso* + <mencion>
> ✦ Aplaudirle a alguien.
${icono} *#marron* + <mencion>
> ✦ Burlarte del color de piel de un usuario. 
${icono} *#suicidar*
> ✦ Suicidate. 
${icono} *#iq • #iqtest* + <mencion>
> ✦ Calcular el iq de alguna persona. 
${icono} *#meme*
> ✦ La bot te envía un meme aleatorio. 
${icono} *#morse*
> ✦ Convierte un texto a codigo morse. 
${icono} *#nombreninja*
> ✦ Busca un nombre ninja aleatorio. 
${icono} *#paja • #pajeame* 
> ✦ La bot te hace una paja.
${icono} *#personalidad* + <mencion>
> ✦ La bot busca tu personalidad. 
${icono} *#piropo*
> ✦ Lanza un piropo.
${icono} *#pregunta*
> ✦ Hazle una pregunta a la bot.
${icono} *#ship • #pareja*
> ✦ La bot te da la probabilidad de enamorarte de una persona. 
${icono} *#sorteo*
> ✦ Empieza un sorteo. 
${icono} *#top*
> ✦ Empieza un top de personas.
${icono} *#formartrio* + <mencion>
> ✦ Forma un trio.
${icono} *#ahorcado*
> ✦ Diviértete con la bot jugando el juego ahorcado.
${icono} *#mates • #matematicas*
> ✦ Responde las preguntas de matemáticas para ganar recompensas.
${icono} *#ppt*
> ✦ Juega piedra papel o tijeras con la bot.
${icono} *#sopa • #buscarpalabra*
> ✦ Juega el famoso juego de sopa de letras.
${icono} *#pvp • #suit* + <mencion>
> ✦ Juega un pvp contra otro usuario.
${icono} *#ttt*
> ✦ Crea una sala de juego.

${bordeSel.bottom}
`.trim()

await conn.sendMessage(m.chat, {
    video: { url: 'https://cdn.russellxz.click/72b0b493.mp4' },
    gifPlayback: true,
    caption: txt,
    contextInfo: {
      mentionedJid: [m.sender, userId],
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterJid: channelRD.id,
        newsletterName: channelRD.name,
      },
    }
  },
  {
    quoted: m
  });
}

handler.help = ['menu2']
handler.tags = ['main']
handler.command = ['menu2', 'menú2', 'help']

export default handler

function clockString(ms) {
  let seconds = Math.floor((ms / 1000) % 60)
  let minutes = Math.floor((ms / (1000 * 60)) % 60)
  let hours = Math.floor((ms / (1000 * 60 * 60)) % 24)
  return `${hours}h ${minutes}m ${seconds}s`
}
