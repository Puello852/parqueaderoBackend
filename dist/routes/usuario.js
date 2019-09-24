"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var mysql_1 = __importDefault(require("mysql"));
var bcrypt_1 = __importDefault(require("bcrypt"));
var moment_1 = __importDefault(require("moment"));
var configdatebase_1 = __importDefault(require("../configdatebase"));
var token_1 = __importDefault(require("../class/token"));
var _a = require('express-validator'), check = _a.check, validationResult = _a.validationResult;
var userRouter = express_1.Router();
var con = mysql_1.default.createConnection(configdatebase_1.default);
userRouter.post('/create', [
    check('nombre').matches('[a-zA-Z ]{2,254}').withMessage('Nombre requerido').matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/),
    check('email').isEmail().withMessage('Correo no valido'),
    check('password').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, "i").withMessage('Contraseña no valida'),
], function (req, res) {
    var errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    con.query("SELECT * FROM users WHERE email = '" + req.body.email + "'", function (err, rows, fields) {
        if (rows.length >= 1) {
            res.json({
                "code": -1,
                "mensaje": 'Ya existe el correo registrado',
            });
        }
        else {
            var salt = bcrypt_1.default.genSaltSync(10);
            var pass = bcrypt_1.default.hashSync(req.body.password, salt);
            var sql = "INSERT INTO users(email,name,password,created_at,updated_at,id_rol) VALUES('" + req.body.email + "','" + req.body.nombre + "','" + pass + "','" + moment_1.default().locale('es').format('YYYY-MM-DD HH:ss:SS') + "','" + moment_1.default().locale('es').format('YYYY-MM-DD HH:ss:SS') + "','2')";
            res.json({
                ok: true,
                mensaje: 'Usuario creado exitosamente',
            });
            con.query(sql);
        }
    });
});
userRouter.post('/login', function (req, res) {
    con.query("SELECT * FROM users WHERE email = '" + req.body.email + "'", function (err, rows, fields) {
        if (rows.length > 0) {
            bcrypt_1.default.compare(req.body.password, rows[0].password, function (err, result) {
                if (err)
                    return res.status(400).json({ code: -5, mensaje: 'ocurrio un error desconocido' });
                if (result) {
                    var tokenData = {
                        correo: req.body.email,
                        id: rows[0].id,
                        nombre: rows[0].name
                    };
                    var token = token_1.default.getjwtToken(tokenData);
                    res.json({
                        code: 200,
                        token: token
                    });
                }
                else {
                    res.status(400).json({
                        code: -3,
                        token: 'usario o contraseña no valida'
                    });
                }
            });
        }
        else {
            res.status(400).json({
                code: -2,
                token: 'usario o contraseña no valida'
            });
        }
    });
});
exports.default = userRouter;
