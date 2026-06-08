const fs = require('fs')
const LIST_PATH = '/tmp/shopping-list.json'

function addItem(item) {
    const list = fs.existsSync(LIST_PATH) ? JSON.parse(fs.readFileSync(LIST_PATH)) : [] 
    list.push(item)
    fs.writeFileSync(LIST_PATH, JSON.stringify(list))
    return `Added ${item} to your shopping list.`
}

function getList() {
    const list = fs.existsSync(LIST_PATH) ? JSON.parse(fs.readFileSync(LIST_PATH)) : []
    return list
}

function clearList() {
    if (fs.existsSync(LIST_PATH)) fs.unlinkSync(LIST_PATH)
    return "Shopping list cleared."
}

module.exports = { addItem, getList, clearList }