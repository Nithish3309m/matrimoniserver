const mongoose=require('mongoose');

const userschema=new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  age: Number,
  gender: String,
  city: String,
  education: String,
  job: String,
  religion: String,
  bio: String,
  
  // ✅ Profile image
  image: { type: String, default: "" },

  // ✅ Partner preferences
  preference: String,
  ageMin: Number,
  ageMax: Number,
  cityPreference: String,
  language: String,
  lookingFor: String,
  hobbies: String,
  isAdmin: {
  type: Boolean,
  default: false
},
isBlocked: {
  type: Boolean,
  default: false,
}


}, { timestamps: true });


 const userdata=mongoose.model('User',userschema);

 module.exports=userdata;