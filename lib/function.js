const low = require("lowdb")
const FileSync = require("lowdb/adapters/FileSync")

const database  = new FileSync('./database/db.json')
const mastay = low(database)

mastay.defaults({ premiumUsers: [], botOwners: [], rooms: [], roomId: 0 }).write();

function getRoomIdBefore() {
    return mastay.get("roomId").value()
}

function setupRoom(senderNumber, recipientNumber) {
    let roomIdBefore = getRoomIdBefore()
    mastay.get("rooms")
    .push({id: roomIdBefore += 1, sender: senderNumber, recipient: recipientNumber, limit: 10})
    .write()

    mastay.set("roomId", roomIdBefore)
    .write()
}

function removeRoomById(id) {
    mastay.get("rooms")
    .remove({id: id})
    .write()

    const rooms = mastay.get("rooms").value();

    rooms.forEach((room) => {
        if (room.id > id) {
            room.id--;
        }
    });

    mastay.set("rooms", rooms).write();
    mastay.update("roomId", (value) => value - 1).write();
}

function removeRoom(number) {
    let room = mastay.get("rooms")
    .find({sender: number})
    .get("id")
    .value()

    if(!room) {
        room = mastay.get("rooms")
        .find({recipient: number})
        .get("id")
        .value()
    }

    return removeRoomById(room)
}

function isUserInActiveRoom(number) {
    let info = mastay.get("rooms")
    .find({sender: number})
    .value()

    if(!info) {
        info = mastay.get("rooms")
        .find({recipient: number})
        .value()
    }

    return info? true:false
}

function getRoomInfo(number) {
    let info = mastay.get("rooms")
    .find({sender: number})
    .get("recipient")
    .value()

    if(!info) {
        info = mastay.get("rooms")
        .find({recipient: number})
        .get("sender")
        .value()
    }

    return info
}

function isUserPremium(number) {
    const info = mastay.get("premiumUsers").value()
    
    return info.includes(number)
}

function isUserOwner(number) {
    const info = mastay.get("botOwners").value()
    
    return info.includes(number)
}

function addPremiumUser(number) {
    mastay.get("premiumUsers").push(number).write()
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