"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mysql_1 = __importDefault(require("mysql"));
var configdatebase_1 = __importDefault(require("../configdatebase"));
var auth_1 = require("../middlewares/auth");
var moment_1 = __importDefault(require("moment"));
var _a = require('express-validator'), check = _a.check, validationResult = _a.validationResult;
var con = mysql_1.default.createConnection(configdatebase_1.default);
var VehiculosRouter = express_1.Router();
VehiculosRouter.get('/listarclientes', auth_1.tokenverif, function (req, res) {
    var sql = "SELECT * FROM cliente";
    con.query(sql, function (err, rows, fields) {
        if (err) {
            return res.json({
                code: -7,
                msj: 'Ocurrio un error desconodico'
            });
        }
        if (rows.length == 0) {
            return res.json({
                code: 200,
                msj: 'No hay clientes en la base de datos'
            });
        }
        else {
            res.json({
                code: 200,
                clientes: rows
            });
        }
    });
});
VehiculosRouter.post('/listarvehiculos', auth_1.tokenverif, [
    check('estado').isLength({ min: 0, max: 15 }).withMessage('Estado no valido').matches(/([1-9][0-9]*)|0/).withMessage('El estado no es valido'),
], function (req, res) {
    var errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    var sql = "SELECT * FROM vehiculos WHERE estado_id = " + req.body.estado;
    con.query(sql, function (err, rows, fields) {
        if (err) {
            return res.json({
                code: -7,
                msj: 'Ocurrio un error desconodico'
            });
        }
        if (rows.length == 0) {
            return res.json({
                code: -5,
                msj: 'No hay vehiculos en el parqueadero'
            });
        }
        else {
            res.json({
                code: 200,
                vehiculos: rows
            });
        }
    });
});
VehiculosRouter.post('/salidavihuculo', auth_1.tokenverif, [
    check('placa').isLength({ max: 6 }).withMessage('Placa no valida').not().isEmpty().withMessage('Placa requerida'),
    check('observacion').not().isEmpty().withMessage('La observacion es requerida'),
], function (req, res) {
    var errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    con.query("SELECT * FROM vehiculos WHERE placa = '" + req.body.placa + "' AND estado_id = 1", function (err, rwos, fliend) {
        if (rwos.length > 0) {
            var sql = "UPDATE vehiculos SET estado_id = 2, observacion = '" + req.body.observacion + "' WHERE placa = '" + req.body.placa + "'";
            con.query(sql, function (err, rows, flieds) {
                if (err) {
                    return res.status(400).json({
                        code: -15,
                        msj: 'Ocurrio un error desconocido'
                    });
                }
                res.json({
                    code: 200,
                    msj: "Exito",
                });
            });
        }
        else {
            res.status(400).json({
                "code": -1,
                "mensaje": 'El vehiculo no existe en el parqueadero',
            });
        }
    });
});
VehiculosRouter.post('/reservar', auth_1.tokenverif, [
    check('placa').isLength({ max: 6 }).withMessage('Placa no valida').not().isEmpty().withMessage('Placa requerida'),
    check('color').matches('[a-zA-Z ]{2,254}').withMessage('Color requerido').matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/).withMessage('Color no valido'),
    check('marca').not().isEmpty().withMessage('La marca es requerida'),
    check('cliente').matches(/([1-9][0-9]*)|0/).not().isEmpty().withMessage('El dueño es requerido'),
    check('observacion').not().isEmpty().withMessage('La observación es requerida'),
], function (req, res) {
    var errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    con.query("SELECT * FROM vehiculos WHERE placa = '" + req.body.placa + "'", function (err, rwos, fliend) {
        if (rwos.length > 0) {
            res.status(400).json({
                "code": -1,
                "mensaje": 'Ya el vehiculo esta en el parqueadero',
            });
        }
        else {
            var sql = "INSERT INTO vehiculos (`estado_id`, `placa`, `color`, `id_cliente`, `marca`, `observacion`, `id_usuario`, `fecha_ingreso`) VALUES (" + 1 + ",'" + req.body.placa + "', '" + req.body.color + "'," + req.body.cliente + ", '" + req.body.marca + "', '" + req.body.observacion + "', " + req.usuario.id + ", '" + moment_1.default().format('DD-MM-YYYY HH:mm:ss') + "')";
            con.query(sql, function (err, rows, fliels) {
                if (err) {
                    return console.log(err);
                }
                res.json({
                    code: 200,
                    msj: "reserva exiosa",
                });
            });
        }
    });
});
VehiculosRouter.post('/agregarcliente', auth_1.tokenverif, [
    check('nombre').isLength({ max: 20 }).withMessage('Nombre no valido').matches('[a-zA-Z ]{2,100}').withMessage('Nombre requerido').matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/).withMessage('Nombre no valido'),
    check('apellido').isLength({ max: 20 }).withMessage('Apellido no valido').matches('[a-zA-Z ]{2,100}').withMessage('Apellido requerido').matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/).withMessage('Apellido no valido'),
    check('cedula').isLength({ max: 15 }).withMessage('Cedula no valida').matches('[1-9][0-9]{3,11}').withMessage('la cedula no es valida'),
    check('direccion').not().isEmpty().withMessage('dirección requerida').isLength({ min: 3, max: 50 }).withMessage('dirección no valida'),
    check('celular').matches(/^3[\d]{9}$/).withMessage('Celular no valido').isLength({ min: 10, max: 10 }).withMessage('Celular no valido'),
    check('telefono').matches(/^3[\d]{6}$/).withMessage('telefono no valido').isLength({ max: 10 }).withMessage('Celular no valido'),
], function (req, res) {
    var errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    var sql = "INSERT INTO cliente(`nombre`, `apellido`, `cedula`, `direccion`, `telefono`, `celular`) VALUES ('" + req.body.nombre + "','" + req.body.apellido + "'," + req.body.cedula + ",'" + req.body.direccion + "'," + req.body.telefono + "," + req.body.celular + ")";
    console.log(sql);
    con.query("SELECT * FROM cliente WHERE cedula = " + req.body.cedula, function (errr, rowss, flield) {
        if (rowss.length > 0) {
            res.json({
                "code": -1,
                "mensaje": 'Ya existe el cliente registrado',
            });
        }
        else {
            con.query(sql, function (err, rows, fields) {
                if (err) {
                    return console.log(err);
                }
                res.json({
                    code: 200,
                    msj: 'Cliente agregado exitosamente'
                });
            });
        }
    });
});
exports.default = VehiculosRouter;
