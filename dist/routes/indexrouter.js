"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var fs_1 = require("fs");
var indexRouter = express_1.Router();
indexRouter.get('/', function (req, res, next) {
    fs_1.readFile('./dist/template.html', null, function (err, data) {
        if (err) {
            res.writeHead(404);
            res.write('Whoops! File not found!!!!');
        }
        else {
            res.write(data);
        }
        res.end();
    });
});
exports.default = indexRouter;
