"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var server_1 = __importDefault(require("./class/server"));
var usuario_1 = __importDefault(require("./routes/usuario"));
var mysql_1 = __importDefault(require("mysql"));
var body_parser_1 = __importDefault(require("body-parser"));
var configdatebase_1 = __importDefault(require("./configdatebase"));
var vehiculos_1 = __importDefault(require("./routes/vehiculos"));
var server = new server_1.default();
// bODY PARSER
server.app.use(body_parser_1.default.urlencoded({ extended: true }));
server.app.use(body_parser_1.default.json());
//levantar express
server.start(function () {
    console.log("servidor corriendo el puerto " + server.port);
});
//conectar mysql
var con = mysql_1.default.createConnection(configdatebase_1.default);
con.connect(function (err) {
    if (err) {
        console.log('Error connecting to Db');
        return;
    }
    console.log("Connected! con mysql :v");
});
server.app.use('/user', usuario_1.default);
server.app.use('/vehiculos', vehiculos_1.default);
