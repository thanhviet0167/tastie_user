require("dotenv").config();
const mongoose = require('mongoose')


/*
   {
    "user_id": 1039129,
    "role": 1, //to check whether a notification belongs to user or provider
    "subject": "The Dirty South",
    "content": "has confirmed your order #483I1P7-6537131032665508", //notification content
    "create_at": "2022-05-05T00:00:00.000+00:00", //to display datetime that a notification was sent
    "order_code": "483I1P7-6537131032665508",
    "read_status": false,
    "type": 1
}

*/

const NotificationSchema = mongoose.Schema({
    user_id : {
        type : Intl,
        require : false
    } ,
    provider_id : {
        type : Intl,
        require : false
    } ,
    content : {
        type : String,
        require : false
    },
    subject : {
        type : String,
        require : false
    },
    order_code : {
        type : String,
        require : false
    },
    read_status : {
        type : Boolean,
        require : false
    },
    type : {
        type : Intl,
        require : false
    },
    create_at : {
        type : Date,
        require : false
    }
})


const NotificationModel = mongoose.model("Notifications",NotificationSchema); 



/*
       {
    "user_id": 1039129,
    "role": 1, //to check whether a notification belongs to user or provider
    "subject": "The Dirty South",
    "content": "has confirmed your order #483I1P7-6537131032665508", //notification content
    "order_code": "483I1P7-6537131032665508",
    "read_status": false,
    "type": 1
}
*/

class NotificationModels{

    static async addNotification(data){
        try {
            const {user_id, provider_id, subject, content, order_code, read_status, type} = data
            const newNotifi = new NotificationModel({
                user_id,
                provider_id,
                content,
                subject,
                order_code,
                read_status,
                type,
                create_at : new Date().toUTCString('vi-VI')
            });
            const result =  await newNotifi.save()
        
           
            return result['_id']

            
        } catch (error) {
            return false   
        }
    }

    static async updateStatusNotification(notif_id){
        try {
            await NotificationModel.updateOne({_id : notif_id}, {read_status : true})
            return true
        } catch (error) {
            return false
        }
    }

    static async getNotification(user_id){
        try {
        
            
            var response = await NotificationModel.find({user_id : parseInt(user_id)}).exec();
           
            response = response.map((noti) => {
           
                return {
                    id : noti._id,
                    user_id : noti.user_id,
                    content : noti.content,        
                    subject : noti.subject,
                    order_code : noti.order_code,
                    read_status : noti.read_status,
                    type : noti.type,
                    create_at : noti.create_at
                }
                
            })

            response.reverse()
            return response.slice(0,20) 
        } catch (error) {
            return []
        }
    }

    static async getNotificationToProvider(provider_id){
        try {
        
            var response = await NotificationModel.find({provider_id : parseInt(provider_id)}).exec();
           
            response = response.map((noti) => {
           
                return {
                    id : noti._id,
                    provider_id : noti.provider_id,
                    content : noti.content,        
                    subject : noti.subject,
                    order_code : noti.order_code,
                    read_status : noti.read_status,
                    type : noti.type,
                    create_at : noti.create_at
                }
                
            })

            
            response.reverse()
            return response.slice(0,20) 
        } catch (error) {
            return []
        }
    }
}

module.exports = NotificationModels