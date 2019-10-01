import { Router,Request,Response } from "express";
import {readFile} from 'fs'
const indexRouter = Router()

indexRouter.get('/', function(req, res, next) {
 readFile('./template.html',null,function(err,data){
    if (err) {
        res.writeHead(404);
        res.write('Whoops! File not found!');
    } else {
        res.write(data);
    }
    res.end();
 })
});

export default indexRouter