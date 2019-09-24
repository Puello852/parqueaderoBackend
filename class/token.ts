import jwt from 'jsonwebtoken'
export default class Token {

    constructor(){}

    static getjwtToken(payload:any){
        return jwt.sign({usuario:payload}, 'Junior1997', {
            expiresIn: 60 * 60 * 24 // expires in 24 hours
         })
    }

    static comprobarToken(token:string){

        return new Promise((resolve,reject)=>{
            jwt.verify(token,'Junior1997',(err,decoded)=>{
                if(err){
                    reject()
                }else{
                   resolve(decoded)
                }
            })
        })

    }
}