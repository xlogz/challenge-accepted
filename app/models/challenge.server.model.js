var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var ChallengeSchema = new Schema({
  name: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: ''
  },
  reward: {
    type: String,
    default: ''
  },
  tasks: {
    type: Array,
    default: []
  },
  completed:{
    type: Boolean,
    default: false
  },
   category: {
    type: String,
    default: ''
   }
});

mongoose.model('Challenge', ChallengeSchema);