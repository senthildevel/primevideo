const mongoose = require('mongoose');

const id = new mongoose.Types.ObjectId();
console.log(id)

console.log(id.getTimestamp());

// Validate the object idf

console.log(mongoose.Types.ObjectId.isValid('123fgrertw'))