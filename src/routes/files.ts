import express, { Application, Request, Response, NextFunction, Router } from 'express';
import moment from 'moment';
import path from 'path';
import { isAuthenticated } from '../config/auth';
import { systemError } from '../functions/errors';
import { slugify } from '../functions/general';

const router = Router();

router.post('/', isAuthenticated, (req: Request, res: Response, next: NextFunction) => {
    try {
        const { folderPath, extension, title } = req.body;
        const reqFile = req.files;
        const user = req.user;
        if (reqFile == undefined) {
            return res.status(400).send('No files were uploaded.');
        }

        if (reqFile.file == undefined) {
            return res.status(400).send('No files were uploaded.');
        }
        
        let file = reqFile.file as any;
        let ext = extension;
        let date = moment(Date.now()).format('YYYY-MM-DD');
        let randomName = slugify(`${title} ${date}`);
        const fileN = `${randomName}.${ext}`;
    
        let finalFile = `${folderPath}/${fileN}`;
    
        const publicDir = req.app.locals.publicDir;
        const finalFilePath = path.join(publicDir, finalFile);
        
        file.mv(finalFilePath, async (err: any) => {
            if (err){
                const error = new Error(JSON.stringify([err.message]));
                next(error);
            } else {
                res.send(finalFile);
            }
        });
    } catch (e) {
        next(systemError(e.message));
    }
});

export default router;