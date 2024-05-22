const low = require("lowdb")
const FileSync = require("lowdb/adapters/FileSync")

const database  = new FileSync('./database/db.json')
const yusuf = low(database)

yusuf.defaults({ premiumUsers: [], botOwners: [], rooms: [], roomId: 0 }).write();

function getRoomIdBefore() {
    return yusuf.get("roomId").value()
}

function setupRoom(senderNumber, recipientNumber) {
    let roomIdBefore = getRoomIdBefore()
    yusuf.get("rooms")
    .push({id: roomIdBefore += 1, sender: senderNumber, recipient: recipientNumber, limit: 10})
    .write()

    yusuf.set("roomId", roomIdBefore)
    .write()
}

function removeRoomById(id) {
    yusuf.get("rooms")
    .remove({id: id})
    .write()

    const rooms = yusuf.get("rooms").value();

    rooms.forEach((room) => {
        if (room.id > id) {
            room.id--;
        }
    });

    yusuf.set("rooms", rooms).write();
    yusuf.update("roomId", (value) => value - 1).write();
}

function removeRoom(number) {
    let room = yusuf.get("rooms")
    .find({sender: number})
    .get("id")
    .value()

    if(!room) {
        room = yusuf.get("rooms")
        .find({recipient: number})
        .get("id")
        .value()
    }

    return removeRoomById(room)
}

function isUserInActiveRoom(number) {
    let info = yusuf.get("rooms")
    .find({sender: number})
    .value()

    if(!info) {
        info = yusuf.get("rooms")
        .find({recipient: number})
        .value()
    }

    return info? true:false
}

function getRoomInfo(number) {
    let info = yusuf.get("rooms")
    .find({sender: number})
    .get("recipient")
    .value()

    if(!info) {
        info = yusuf.get("rooms")
        .find({recipient: number})
        .get("sender")
        .value()
    }

    return info
}

function isUserPremium(number) {
    const info = yusuf.get("premiumUsers").value()
    
    return info.includes(number)
}

function isUserOwner(number) {
    const info = yusuf.get("botOwners").value()
    
    return info.includes(number)
}

function addPremiumUser(number) {
    yusuf.get("premiumUsers").push(number).write()
}

module.exports = {
    setupRoom,
    isUserInActiveRoom,
    removeRoom,
    getRoomInfo,
    isUserPremium,
    isUserOwner,
    addPremiumUser
}
