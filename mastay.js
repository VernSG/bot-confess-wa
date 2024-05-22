const { Client, LocalAuth, Contact } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const {
    setupRoom, isUserInActiveRoom, removeRoom, getRoomInfo, isUserOwner, addPremiumUser
} = require("./lib/function")

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "089528493188"
    }),
    puppeteer: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-extensions']
    }
});

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('authenticated', () => {
    // client.setStatus("*STATUS : Online* | _*BOT CONFESS CREATED BY Yusuf*_")
    console.log("AUTHENTICATED")
})

client.on('disconnected', () => {
    // client.setStatus("*STATUS : Offline* | _*BOT CONFESS CREATED BY Yusuf*_")
    console.log("DISCONNECTED")
})

client.on('message', async msg => {
    let prefix = "."
    
    if(msg.body.startsWith(`${prefix}confess`) || msg.body.startsWith(`${prefix}menfess`)){
        const params = msg.body.split(" ")

        if(params.length < 3) {
            return msg.reply(`Gunakan *${prefix}menfess/confess nomor pesan*\n_Format nomor harus berupa kode negara lalu diikuti nomor. Contoh : 6285xxxxxxxxx_`);
        }

        // const isRegistered = await client.isRegisteredUser(params[1].trim())
        // if(!isRegistered) {
        //     return msg.reply("Nomor tidak terdaftar di whatsapp atau kesalahan format\n_Format nomor harus berupa kode negara lalu diikuti nomor. Contoh : 6285xxxxxxxxx_")
        // }

        const recipientNumber = `${params[1].trim()}@c.us`

        if(recipientNumber === msg.from){
            return msg.reply("Tidak bisa mengirim menfess/confess ke nomor sendiri\n_(Gapunya crush kah? xixixi)_")
        } else if(isUserInActiveRoom(recipientNumber) || isUserInActiveRoom(msg.from)) {
            return msg.reply(`Kamu atau nomor yang dituju saat ini masih memiliki room yang aktif\nGunakan ${prefix}tolak untuk mengakhiri room yang sedang berjalan`)
        }

        const message = params.slice(2).join(" ")

        setupRoom(msg.from, recipientNumber)
        console.log(`Room created\nSender : ${msg.from}\nRecipient : ${recipientNumber}`)

        msg.reply("Berhasil mengirim pesan\n\n_Menunggu balasan dari nomor tujuan....._\n")
        msg.react("🥳")
        await client.sendMessage(recipientNumber, `Halo kak🥳, aku *Bot Confess*\nAda pesan nih untuk kakak\n\n*Pengirim :* Secret😜\n*Pesan :* ${message}\n\n_Cie-cie😆_\nNgomong-ngomong kakak bisa loh bales pesan ini, cukup kirim saja pesan balasan kakak nanti bakal aku kirim ke dia xixixi. Atau kakak bisa tolak dengan kirim *${prefix}tolak*`)
    } else if(msg.body.startsWith(`${prefix}tolak`) || msg.body.startsWith(`${prefix}akhiri`)) {
        const number = getRoomInfo(msg.from)
        if(!isUserInActiveRoom(msg.from)) {
            return msg.reply("Kamu sedang tidak memiliki room yang aktif")
        }

        const params = msg.body.split(" ")

        if(params.length > 1) {
            const message = params.splice(1).join(" ")
            await client.sendMessage(number, `Yah udah terputus🥲\n\n*Pesan terakhir :* ${message}`)
        } else {
            await client.sendMessage(number, `Yah udah terputus🥲\n\n*Pesan terakhir :* Dia tidak meninggalkan pesan🥲`)
        }

        removeRoom(msg.from)
        msg.react("✅")
        console.log(`Room ended\nSender : ${msg.from}`)
    } else if(msg.body.startsWith(`${prefix}addpremium`)) {
        if(!isUserOwner(msg.from)) {
            return msg.reply("Kamu tidak memiliki izin untuk menggunakan perintah ini")
        }

        const params = msg.body.split(" ")
        if(params.length < 2) {
            return msg.reply(`Gunakan ${prefix}addpremium nomor.\n\n_Nomor harus dimulai dari kode negara lalu diikuti nomor telepon tanpa angka 0 di depan. Contoh : 62857xxxxxx_`)
        }

        const number = `${params[1].trim()}@c.us`
        addPremiumUser(number)
        msg.react("✅")
    } else {
        if(isUserInActiveRoom(msg.from)) {
            if(msg.type === 'image' || msg.type === 'video') {
                return msg.reply("Maaf yah untuk sekarang tidak bisa mengirim video atau gambar🥲")
            }

            const number = getRoomInfo(msg.from)

            msg.forward(number)
            console.log(`${msg.from} sending message to ${number}`)
        } else {
            const pushName = await msg.getContact();

            const menu = `\n*Hai kak ${pushName.pushname}👋*. Aku *BOT CONFESS*\n\n*ıllıllı ʙᴏᴛ ɪɴғᴏ ıllıllı*\n\n*❏ Bot Name :* BOT CONFESS\n*❏ Version :* 1.0.0\n*❏ Prefix :* "."\n*❏ Author :* Yusuf\n\n_Gunakan *${prefix}confess nomor pesan*. Format nomor harus dimulai dari kode negara lalu diikuti nomor tanpa angka 0. Contoh : 62857xxxxxxx_\n\nıllıllı 𝔻𝕆ℕ𝔸𝕋𝔼 & 𝕊𝕆𝕊𝕄𝔼𝔻 ıllıllı\n\n☞ Instagram : https://instagram.com/yusufff.rttex\n☞ Github : https://github.com/VernSG\n☞ Saweria : https://saweria.co/VernSG\n`
            msg.reply(menu)
        }
    }
});


client.initialize();
