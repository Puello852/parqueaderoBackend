import { Router,Request,Response } from "express";
import mysql from 'mysql'
import bycript from 'bcrypt'
import moment from 'moment'
import config from "../configdatebase";
import jwt from 'jsonwebtoken'
import Token from "../class/token";
const { check, validationResult } = require('express-validator');
const userRouter = Router()
const con = mysql.createConnection(config);

userRouter.post('/create',[
        check('nombre').matches('[a-zA-Z ]{2,254}').withMessage('Nombre requerido').matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/),
        check('email').isEmail().withMessage('Correo no valido'),
        check('password').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, "i").withMessage('Contraseña no valida'),
    ],(req:Request,res:Response)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    con.query(`SELECT * FROM users WHERE email = '${req.body.email}'`,(err,rows,fields)=>{

       if(rows.length >= 1){
         res.json({
           "code": -1,
           "mensaje": 'Ya existe el correo registrado',
         })
       }else{
         var salt = bycript.genSaltSync(10);  
         let pass = bycript.hashSync(req.body.password, salt)
         let sql = `INSERT INTO users(email,name,password,created_at,updated_at,id_rol) VALUES('${req.body.email}','${req.body.nombre}','${pass}','${moment().locale('es').format('YYYY-MM-DD HH:ss:SS')}','${moment().locale('es').format('YYYY-MM-DD HH:ss:SS')}','2')`;
         res.json({
           ok: true,
           mensaje: 'Usuario creado exitosamente',
         })
         con.query(sql);
       }
    })  
})

userRouter.post('/login',(req:Request,res:Response)=>{
 
   con.query(`SELECT * FROM users WHERE email = '${req.body.email}'`,(err,rows,fields)=>{
    if(rows.length>0){
      bycript.compare(req.body.password, rows[0].password, (err, result)=> {
        if(err) return res.status(400).json({code:-5,mensaje:'ocurrio un error desconocido'})
          if(result) {
            var tokenData = {
              correo: req.body.email,
              id: rows[0].id,
              nombre: rows[0].name
            }
            const token = Token.getjwtToken(tokenData)
           res.json({
             code:200,
             token
           })
          }
          else {
            res.status(400).json({
              code:-3,
              token:'usario o contraseña no valida'
            })
          }
      })
    }else{
      res.status(400).json({
        code:-2,
        token:'usario o contraseña no valida'
      })
    }
 })
})



export default userRouter