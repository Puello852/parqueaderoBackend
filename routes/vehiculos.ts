import { Router,Request,Response } from "express";
import mysql from 'mysql'
import config from "../configdatebase";
import { tokenverif } from "../middlewares/auth";
import moment from "moment";
const { check, validationResult } = require('express-validator');
const con = mysql.createConnection(config);
const VehiculosRouter = Router()


VehiculosRouter.get('/listarclientes',tokenverif,(req:any,res:Response)=>{
    const sql = "SELECT * FROM cliente"
    con.query(sql,(err,rows,fields)=>{
        if(err){
            return res.json({
                code: -7,
                msj: 'Ocurrio un error desconodico'
            })
        }
        if(rows.length == 0){
            return res.json({
                code: 200,
                msj: 'No hay clientes en la base de datos'
            })
        }else{
            res.json({
                code:200,
                clientes:rows
            })
        }
    })
})

VehiculosRouter.post('/listarvehiculos',tokenverif,[
    check('estado').isLength({ min: 0,max: 15 }).withMessage('Estado no valido').matches(/([1-9][0-9]*)|0/).withMessage('El estado no es valido'),
],(req:any,res:Response)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const sql = `SELECT * FROM vehiculos WHERE estado_id = ${req.body.estado}`
    con.query(sql,(err,rows,fields)=>{
        if(err){
            return res.json({
                code: -7,
                msj: 'Ocurrio un error desconodico'
            })
        }
        if(rows.length == 0){
            return res.json({
                code: -5,
                msj: 'No hay vehiculos en el parqueadero'
            })
        }else{
            res.json({
                code:200,
                vehiculos:rows
            })
        }
    })
})


VehiculosRouter.post('/salidavihuculo',tokenverif,[
    check('placa').isLength({ max: 6 }).withMessage('Placa no valida').not().isEmpty().withMessage('Placa requerida'),
    check('observacion').not().isEmpty().withMessage('La observacion es requerida'),
],(req:any,res:Response)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    con.query(`SELECT * FROM vehiculos WHERE placa = '${req.body.placa}' AND estado_id = 1`,(err,rwos,fliend)=>{ 
        if(rwos.length>0){
            let sql = `UPDATE vehiculos SET estado_id = 2, observacion = '${req.body.observacion}' WHERE placa = '${req.body.placa}'`
            con.query(sql,(err,rows,flieds)=>{
                if(err){
                  return res.status(400).json({
                        code: -15,
                        msj: 'Ocurrio un error desconocido'
                   })
                }
                res.json({
                    code:200,
                    msj:"Exito",
                })
            })
        }else{
            res.status(400).json({
                "code": -1,
                "mensaje": 'El vehiculo no existe en el parqueadero',
            })
        }
    })
    
})

VehiculosRouter.post('/reservar', tokenverif, [
    check('placa').isLength({ max: 6 }).withMessage('Placa no valida').not().isEmpty().withMessage('Placa requerida'),
    check('color').matches('[a-zA-Z ]{2,254}').withMessage('Color requerido').matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/).withMessage('Color no valido'),
    check('marca').not().isEmpty().withMessage('La marca es requerida'),
    check('cliente').matches(/([1-9][0-9]*)|0/).not().isEmpty().withMessage('El dueño es requerido'),
    check('observacion').not().isEmpty().withMessage('La observación es requerida'),
],(req:any,res:Response)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
        con.query(`SELECT * FROM vehiculos WHERE placa = '${req.body.placa}'`,(err,rwos,fliend)=>{
            if(rwos.length>0){
                res.status(400).json({
                    "code": -1,
                    "mensaje": 'Ya el vehiculo esta en el parqueadero',
                  })
            }else{
                let sql = "INSERT INTO vehiculos (`estado_id`, `placa`, `color`, `id_cliente`, `marca`, `observacion`, `id_usuario`, `fecha_ingreso`) VALUES ("+1+",'"+req.body.placa+"', '"+req.body.color+"',"+req.body.cliente+", '"+req.body.marca+"', '"+req.body.observacion+"', "+req.usuario.id+", '"+moment().format('DD-MM-YYYY HH:mm:ss')+"')"
                 con.query(sql,(err,rows,fliels)=>{
                 if(err){
                     return console.log(err)
                 }
                    res.json({
                        code:200,
                        msj:"reserva exiosa",
                    })
                })
            }
        })
})


VehiculosRouter.post('/agregarcliente',tokenverif,[
    check('nombre').isLength({ max: 20 }).withMessage('Nombre no valido').matches('[a-zA-Z ]{2,100}').withMessage('Nombre requerido').matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/).withMessage('Nombre no valido'),
    check('apellido').isLength({ max: 20 }).withMessage('Apellido no valido').matches('[a-zA-Z ]{2,100}').withMessage('Apellido requerido').matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/).withMessage('Apellido no valido'),
    check('cedula').isLength({ max: 15 }).withMessage('Cedula no valida').matches('[1-9][0-9]{3,11}').withMessage('la cedula no es valida'),
    check('direccion').not().isEmpty().withMessage('dirección requerida').isLength({ min: 3, max: 50 }).withMessage('dirección no valida'),
    check('celular').matches(/^3[\d]{9}$/).withMessage('Celular no valido').isLength({ min: 10, max: 10 }).withMessage('Celular no valido'),
    check('telefono').matches(/^3[\d]{6}$/).withMessage('telefono no valido').isLength({ max: 10 }).withMessage('Celular no valido'),
],(req:any,res:Response)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    let sql = "INSERT INTO cliente(`nombre`, `apellido`, `cedula`, `direccion`, `telefono`, `celular`) VALUES ('"+req.body.nombre+"','"+req.body.apellido+"',"+req.body.cedula+",'"+req.body.direccion+"',"+req.body.telefono+","+req.body.celular+")"
    console.log(sql)
    con.query(`SELECT * FROM cliente WHERE cedula = ${req.body.cedula}`,(errr,rowss,flield)=>{
      if(rowss.length>0){
        res.json({
            "code": -1,
            "mensaje": 'Ya existe el cliente registrado',
          })
      }else{
        con.query(sql,(err,rows,fields)=>{
            if(err){
                return console.log(err)
            }
                res.json({
                    code:200,
                    msj: 'Cliente agregado exitosamente'
                })
        })
      }
  }) 
})

export default VehiculosRouter