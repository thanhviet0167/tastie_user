require("dotenv").config();
const host = require('../../config/connectMySql')
const bcrypt = require('bcrypt')
const moment = require('moment')
const jwt = require('jsonwebtoken');


const client = require('twilio')('AC7777ca9aeeae7c0582e1499a2e50efcd', 'd1fa0bc2fb18e8cbae0def56acc2967b', {
    lazyLoading: true
});



class UserModel {
    constructor(data){
        this.user_id = data.user_id ? data.user_id : null
        this.first_name = data.first_name ? data.first_name : null
        this.last_name = data.last_name ? data.last_name : null
        this.gender = data.gender ? data.gender : null
        this.birthday = data.birthday ? data.birthday : null
        this.email = data.email ? data.email : null
        this.phone = data.phone ? data.phone : null
        this.password = data.password ? data.password : null
        this.registered_at = data.registered_at ? data.registered_at : null
        this.role = data.role ? data.role : null
        this.last_login_at = data.last_login_at ? data.last_login_at : null
    }


    async registerUser(data) {
        
        // let sql = `
        // INSERT INTO user(phone, password, first_name, last_name, role, registered_at) 
        // VALUES(
        //     '${this.phone}',
        //     '${this.password}',
        //     '${this.first_name}',
        //     '${this.last_name}',
        //     '${this.role}',
        //     '${this.registered_at}'
        // )
        // `
        let sqlStoredProcedure = `CALL AccountRegistration ('${this.phone}', '${this.password}', '${this.role}', 
        '${this.email}', '${this.first_name}', '${this.last_name}', 1, '${this.registered_at}', '${this.registered_at}')`

        const [newUser, _] = await host.execute(sqlStoredProcedure);


        return newUser;

    }



    static  findUserByPhone(phone){
        
        let sql =  `SELECT * FROM Tastie.User WHERE phone = '${phone}'`

        return  host.execute(sql);
    }

    static async findUserByEmail(email){
        
        let sql = `SELECT * FROM Tastie.User WHERE email = '${email}'`

        return await host.execute(sql);
    }

    static findUserById(Id){
        
        let sql = `SELECT * FROM Tastie.User WHERE user_id = ${Id}`

        return host.execute(sql);
    }

    static setToken(Id, token){
        
        let sql = `UPDATE Tastie.User SET user_token = '${token}' WHERE user_id = ${Id}`

        return  host.execute(sql);
    }


    static async validateLogin(data){
       
        if(data.phone){
            // var [user, _] = await UserModel.findUserById('1000004')
            // console.log(user)
            var [result, _] = await UserModel.findUserByPhone(data.phone)
        
            return await bcrypt.compare(data.password, result[0].password)
        }
        else{
            if(data.email){
                // var [user, _] = await UserModel.findUserById('1000004')
                // console.log(user)
                var [result, _] = await UserModel.findUserByEmail(data.email)
                console.log(result)
                return await bcrypt.compare(data.password, result[0].password)
            }
        }
        
       
    }

    static async sendOtpSmS(phone, otp){

      
        try {
            var context= client.messages.create({
                body : `Your code is : ${otp}`,
                to : `+84${phone}`,
                from : '+18508096047'
            }).then(message => {
                console.log(message)
            
            }).catch(err => {
                console.log(err)
                
            })
            
          
        } catch (error) {
            console.log(error)
            return false;
        }
        return true
        
    }



    static async resestPassword(phone,newpassword){
        let sqlStr = `
            UPDATE Tastie.User SET password = '${newpassword}' WHERE phone = '${phone}'
        `

        return host.execute(sqlStr)
    }

    static async changePassword(data, newpassword){
        if(data.phone){
            let sqlStr = `
            UPDATE Tastie.User SET password = '${newpassword}' WHERE phone = '${data.phone}'
        `
            return host.execute(sqlStr)
        }
        else{
            if(data.email){
                let sqlStr = `
                UPDATE Tastie.User SET password = '${newpassword}' WHERE email = '${data.email}'
                `
                return host.execute(sqlStr)
            }
            
        }
        
        return null
        
    }

    static async logout(data){
        if(data.phone){
            let sql = `UPDATE Tastie.User SET user_token = '' WHERE phone = '${data.phone}'`
            return host.execute(sql)
        }
        else{
            if(data.email){
                let sql = `UPDATE Tastie.User SET user_token = '' WHERE email = '${data.email}'`
                return host.execute(sql)
            }
            
        }
        
        return null
        
       

        
    }


    static async updateUser(data){

        var [user, _] = await UserModel.findUserById(data.account_id)

        var dataDate = `"${data.birthday ? data.birthday : user[0].birthday}"`
        
        const convert_date = moment(dataDate,
            "ddd MMM DD YYYY"
        ); // This is your query from MySQL
        
        let final_date = convert_date.format("YYYY-MM-DD"); // Using moment.format() with the given format, it converts the date

        

        if(user){
            let sqlStoredProcedure = `
            CALL UpdateAccount(${data.account_id}, '${data.phone ? data.phone : user[0].phone}', 
            '${data.email ? data.email : user[0].email}', '${data.password ? data.password : user[0].password}', 
            '${data.role ? data.role : user[0].role}', '${data.first_name ? data.first_name : user[0].first_name}',
            '${data.last_name ? data.last_name : user[0].last_name}', '${data.gender ? data.gender : user[0].gender}',
            '${data.birthday ? data.birthday : final_date}')
        `

            console.log(sqlStoredProcedure)

            if(data.phone){
                var refreshToken = jwt.sign({phone:data.phone}, process.env.REFRESH_TOKEN_SECRET)
                await this.setToken(data.account_id, refreshToken)
               
                return await {
                    inforUpdate : await host.execute(sqlStoredProcedure),
                    refreshToken
                }  
            }
            else{
                if(data.email){
                    var refreshToken = jwt.sign({email:data.email}, process.env.REFRESH_TOKEN_SECRET)
                    await this.setToken(data.account_id, refreshToken)
                    return await {
                        inforUpdate : await  host.execute(sqlStoredProcedure),
                        refreshToken
                    }  
                }
                else{
                    return await {
                        inforUpdate : await host.execute(sqlStoredProcedure),
                        refreshToken : null
                    }  
                }
            }

            
            
            
        }

        return null;

        
    }

    static async getOperationsTime(provider_id){
        let sqlGetOperation = `SELECT * FROM Tastie.Operation where provider_id = ${provider_id};`

            const [opetations, _] = await host.execute(sqlGetOperation)

            let sqlGetStatusProvider = `SELECT status FROM Provider where provider_id = ${provider_id};`

            const statusProvider = await host.execute(sqlGetStatusProvider)

            
            var monday = {}, tuesday = {}, wednesday = {}, thursday = {}, friday = {}, saturday = {}, sunday = {}

            const dateNumber = new Date().getDay()

            for(var i = 0; i < opetations.length; i++){
                if(opetations[i]['day'] === "2")
                {
                    monday = {
                        is_day_off: dateNumber !== 1 || statusProvider[0][0]['status'] !== 0 ? false : true,
                        open_time: opetations[i]['open_time'],
                        close_time: opetations[i]['close_time']
                    }
                }
                if(opetations[i]['day'] === "3")
                {
                    tuesday = {
                        is_day_off: dateNumber !== 2 || statusProvider[0][0]['status'] !== 0 ? false : true,
                        open_time: opetations[i]['open_time'],
                        close_time: opetations[i]['close_time']
                    }
                }
                if(opetations[i]['day'] === "4")
                {
                    wednesday = {
                        is_day_off: dateNumber !== 3 || statusProvider[0][0]['status'] !== 0 ? false : true,
                        open_time: opetations[i]['open_time'],
                        close_time: opetations[i]['close_time']
                    }
                }
                if(opetations[i]['day'] === "5")
                {
                    thursday = {
                        is_day_off: dateNumber !== 4 || statusProvider[0][0]['status'] !== 0 ? false : true,
                        open_time: opetations[i]['open_time'],
                        close_time: opetations[i]['close_time']
                    }
                }
                if(opetations[i]['day'] === "6")
                {
                    friday = {
                        is_day_off: dateNumber !== 5 || statusProvider[0][0]['status'] !== 0 ? false : true,
                        open_time: opetations[i]['open_time'],
                        close_time: opetations[i]['close_time']
                    }
                }
                if(opetations[i]['day'] === "7")
                {
                    saturday = {
                        is_day_off: dateNumber !== 6 || statusProvider[0][0]['status'] !== 0 ? false : true,
                        open_time: opetations[i]['open_time'],
                        close_time: opetations[i]['close_time']
                    }
                }
                if(opetations[i]['day'] === "1")
                {
                    sunday = {
                        is_day_off: dateNumber !== 0 || statusProvider[0][0]['status'] !== 0 ? false : true,
                        open_time: opetations[i]['open_time'],
                        close_time: opetations[i]['close_time']
                    }
                }
            }


            var operation_time  = {
                monday,
                tuesday,
                wednesday,
                thursday,
                friday,
                saturday,
                sunday
            }
            return operation_time
    }

    static async getProvider (user_id){
        try {
            let sql = `SELECT * FROM Tastie.Provider where user_id = ${user_id};`



            const [provider_info, _] =  await host.execute(sql)

            const operation_time = await this.getOperationsTime(provider_info[0]['provider_id'])

            let sqlGetProviderCategory = `CALL Get_Provider_Categories(${provider_info[0]['provider_id']});`

            const provider_category = await host.execute(sqlGetProviderCategory)

            const response = {
                provider_name : provider_info[0]['merchant_name'],
                provider_category: provider_category[0][0],
                address: provider_info[0]['address'],
                latitude: provider_info[0]['latitude'], 
                longitude: provider_info[0]['longitude'],
                operation_time :operation_time,
                rating: provider_info[0]['rating'],
                total_reviews: provider_info[0]['total_review'],
                avatar: provider_info[0]['avatar'],
                estimated_cooking_time: provider_info[0]['estimated_cooking_time'],
                provider_status: provider_info[0]['status'], // (1 open, 2 closed, 3 busy)
            }
            return response
        } catch (error) {
            console.log(error)
            return null
        }
    }

    static async addCustomerAddress (data){
        try {
            const {customer_id, address, city, type, longtitude, latitude} = data
            // check type loai 1, 2
            if(type === 1 || type === 2){
                const [_address, _] = await host.execute(`SELECT * FROM Tastie.CustomerAddress WHERE customer_id = ${customer_id} AND type = ${type};`)
                
                if(_address.length)
                    return false
            }
            


            let addCustomerAddress = `CALL Add_Customer_Address(${customer_id}, '${address}', '${city}', ${type}, '${longtitude}', '${latitude}');`
            await host.execute(addCustomerAddress)
            return true

        } catch (error) {
            console.log(error)
            return false
        }
    }

    static async updateCustomerAddress (data){
        try {
            const {customer_id, address, city, type, pre_longitude, pre_latitude, longitude, latitude} = data
            let updateCustomerAddress = `CALL Update_Customer_Address(${customer_id}, '${address}', '${city}', ${type}, '${pre_longitude}', '${pre_latitude}','${longitude}', '${latitude}');`
            await host.execute(updateCustomerAddress)
            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }

    static async submitUpcomingProductReview(data){
        try {
            const {upcoming_product_id, customer_id, response} = data
            await host.execute(`CALL Submit_Upcoming_Product_Review(${upcoming_product_id}, ${customer_id}, '${response}')`);

            return true
        } catch (error) {
            console.log(error)
            return false
        }
    }

    static async getRecommendationsForCustomers(user_id){  
        try {
            const data = await host.execute(`CALL Get_Home_Recommend(${user_id});`);
            
            var data_recommend = data[0][0][0]['recommend_product'].slice(1, data[0][0][0]['recommend_product'].length-1)
            var response = []
            var listData = data_recommend.split("],")
            for(var i = 0; i < listData.length; i++){
                var splitData = listData[i].split(",")
                var rating = splitData[1].slice(1)
                var product_id = splitData[0].slice(1)
              
               
        
                var newData = {
                    product_id : parseInt(product_id.indexOf('[') >= 0 ? product_id.slice(1) : product_id),
                    rating : parseFloat(rating.indexOf(']') >= 0 ? rating.slice(0, rating.length-1) : rating)
                }
                response.push(newData)
            }
          
        

            return response
        } catch (error) {
            console.log(error)
            return []
        }
    }
    

}


module.exports = UserModel;