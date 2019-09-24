import { Request,Response,NextFunction } from 'express'
import Token from '../class/token'

export const tokenverif = (req:any,res:Response,next:NextFunction) => {
        const userToken = req.get('x-token') || ''

        Token.comprobarToken(userToken).then((decoded:any)=>{
            req.usuario = decoded.usuario
            next()
        }).catch(err=>{
            res.json({
                code:-4,
                msj:'El token no es correcto'
            })
        })
 }