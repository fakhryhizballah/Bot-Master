const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const { phoneNumberFormatter } = require('./helpers/formatter');
const { clientMq } = require('./konektor/mqtt');
const qrcode = require('qrcode-terminal');

console.log("Connection to Whatsapp Web Client");
const client = new Client({
    // authStrategy: new NoAuth({
    authStrategy: new LocalAuth({
        // clientId: "client-two",
        // dataPath: "./data",
        restartOnAuthFail: false,
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                // '--single-process', // <- this one doesn't works in Windows
                // '--disable-gpu',
            ],
        }
    })
});





client.initialize();

client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true }, function (qrcode) {
        console.log(qrcode)
    });
});

client.on('authenticated', async (session) => {
    console.log('WHATSAPP WEB => Authenticated');
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessful
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on("ready", async () => {
    console.log("WHATSAPP WEB => Ready");
});

client.on('disconnected', (reason) => {
    console.log('Session file deleted!');
    console.log('Client was logged out', reason);
    // client.initialize();
    client.resetState();
});
client.on('change_state', state => {
    console.log('CHANGE STATE', state);
});
let sesi = [];
client.on('message', async (msg) => {
    console.log("------------------------------------------------------");
    console.log("Msg: " + msg.body);
    console.log("From: " + msg.from);
    console.log("To: " + msg.to);
    console.log("Type: " + msg.type);
    console.log("Timestamp: " + msg.timestamp);
    // console.log(msg);
    // msg.reply('pong');
    // msg.react('🙏');
    console.log("------------------------------------------------------");
    try {
        let message = msg.body.toLowerCase();
        let cek_pesan = message.split(" ");
        let geeting = message.includes("pagi");
        console.log(geeting);
        const conditions = ["hello", "hi", "al", "assalamualaikum", "selamat", "pagi", "siang", "sore", "malam", "salam", "ui"];
        const isGreeting = conditions.some(el => message.includes(el));
        console.log(isGreeting);
        if (msg.type === "chat") {
            let find_sesi = sesi.find(el => el == msg.from);
            if (isGreeting) {
                if (find_sesi) {
                    msg.reply("Masukan Angka");
                    return;
                }
                // push to array sesi
                sesi.push(msg.from);
                console.log(sesi);
                // send to mqtt
                msg.react('🙏');
                msg.reply('Haii, saya fakhry senang anda\n' +
                    'Saya Admin IT RSUD ABDUL AZIZ\n ' +
                    'Balas pesan ini dengan angka\n ' +
                    '1. Cek saldo\n' +
                    '2. Cek mutasi\n' +
                    '3. Cek rekening\n');
                clientMq.publish('whatsapp/PC', JSON.stringify({
                    "from": msg.from,
                    "to": msg.to,
                    "body": msg.body,
                    "type": msg.type,
                    "timestamp": msg.timestamp
                }));
                return;
            }
            // find sesi 

            console.log(find_sesi);
            if (find_sesi) {
                if (cek_pesan[0] == "1") {
                    msg.reply('Saldo anda Rp. 100.000');
                    sesi = sesi.filter(el => el != msg.from);
                } else if (cek_pesan[0] == "2") {
                    msg.reply('Mutasi anda Rp. 100.000');
                    sesi = sesi.filter(el => el != msg.from);
                } else if (cek_pesan[0] == "3") {
                    msg.reply('Rekening anda 123456789');
                    sesi = sesi.filter(el => el != msg.from);
                } else {
                    msg.reply('Maaf, saya tidak mengerti\n' +
                        'Ucapkan salam untuk memulai percakapan dengan saya');
                    // remove sesi
                    sesi = sesi.filter(el => el != msg.from);
                    console.log(sesi);
                }
                return;
            }
        }

    } catch (error) {
        console.log(error);
    }


    // if chat prsonal


});

const findGroupByName = async function (name) {
    const group = await client.getChats().then(chats => {
        return chats.find(chat =>
            chat.isGroup && chat.name.toLowerCase() == name.toLowerCase()
        );
    });
    return group;
}

const checkRegisteredNumber = async function (number) {
    const isRegistered = await client.isRegisteredUser(number);
    return isRegistered;
}

clientMq.on('message', async function (topic, message) {
    if (topic == 'wa-api/sendPesan') {
        let data = JSON.parse(message);
        console.log(data.number);
        let noHp = phoneNumberFormatter(data.number);
        let pesan = data.message;
        console.log(noHp);
        console.log(pesan);
        try {
            const isRegistered = await checkRegisteredNumber(noHp);
            console.log(isRegistered);
            if (isRegistered) {
                client.sendMessage(noHp, data.message).then(response => {
                    // console.log(response);
                    console.log("Pesan Terkirim");
                    logs(data.number, data.message, 'terkirim');
                }).catch(err => {

                    console.log("err");
                });
            } else {
                logs(data.number, data.message, 'user-not-registered');
                console.log('WHATSAPP WEB => User not registered');
            }
        }
        catch (err) {
            console.log(err);
            logs(data.number, data.message, 'wa-error');
        }

    } else if (topic == 'wa-api/sendGrup') {
        try {
            let data = JSON.parse(message);
            console.log('nama Grub: ' + (data.grup));
            console.log('pesan Grub: ' + data.message);

            const group = await findGroupByName(data.grup);
            if (group) {
                chatId = group.id._serialized;
                console.log(group.id._serialized);
                client.sendMessage(group.id._serialized, data.message).then(response => {
                    // console.log(response);
                    console.log("Pesan Grup Terkirim");
                }).catch(err => {
                    console.log(err);
                });
            }
            console.log('No group found with name: ' + data.grup);
        } catch (error) {
            console.log(error)
            logs(data.grup, data.message, 'wa-error');
        }
    }
    if (topic == 'wa-api/sendBroadcast') {
        try {
            let data = JSON.parse(message);
            console.log('pesan Broadcast: ' + data.message);
            const chats = await client.getChats();
            chats.forEach(chat => {
                if (chat.isGroup) {
                    console.log(chat.name);
                    client.sendMessage(chat.id._serialized, data.message).then(response => {
                        // console.log(response);
                        console.log("Pesan Broadcast Terkirim");
                    }).catch(err => {
                        console.log(err);
                    });
                }
            });
        } catch (error) {
            console.log(error)
        }
    }
    if (topic == 'wa-api/send') {
        try {
            let data = JSON.parse(message);
            await client.sendMessage(data.number, data.message)
            const chats = await client.getChats();
            console.log(chats);

        } catch (error) {
            console.log(error)
        }


    }


});