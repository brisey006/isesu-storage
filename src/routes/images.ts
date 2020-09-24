import express, { Application, Request, Response, NextFunction, Router } from 'express';
import moment from 'moment';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { isAuthenticated } from '../config/auth';
import { systemError } from '../functions/errors';
import { slugify } from '../functions/general';

const router = Router();

router.post('/', isAuthenticated, (req: Request, res: Response, next: NextFunction) => {
    try {
        sharp.cache(false);
        const { imagePath, extension } = req.body;
        const reqFile = req.files;
        const user = req.user;
        if (reqFile == undefined) {
            return res.status(400).send('No files were uploaded.');
        }

        if (reqFile.file == undefined) {
            return res.status(400).send('No files were uploaded.');
        }
        
        let file = reqFile.file as any;
        let fileName = file.name;
        let ext = extension;
        let date = moment(Date.now()).format('YYYY-MM-DD');
        let randomName = slugify(`${user.firstName} ${user.lastName} ${date}`);
        const fileN = `${randomName}.${ext}`;
    
        let finalFile = `${imagePath}/${fileN}`;
        let croppedFilePath = `${imagePath}/thumbnails/${randomName}.jpeg`;
    
        const publicDir = req.app.locals.publicDir;
        const finalImage = path.join(publicDir, finalFile);
        const finalCroppedImagePath = path.join(publicDir, croppedFilePath);
        
        file.mv(finalImage, async (err: any) => {
            if (err){
                const error = new Error(JSON.stringify([err.message]));
                next(error);
            } else {
                const image = sharp(finalImage);
                const data = await image.resize(250, 250).jpeg().toBuffer();
                const thumbnailDir = path.join(publicDir, `${imagePath}/thumbnails`);
                if (!fs.existsSync(thumbnailDir)) {
                    fs.mkdirSync(thumbnailDir);
                }
                fs.writeFile(finalCroppedImagePath, data, (err) => {
                    if (err) {
                        next(systemError(err.message));
                    } else {
                        res.json({ original: finalFile, thumbnail: croppedFilePath });
                    }
                });
            }
        });
    } catch (e) {
        next(systemError(e.message));
    }
});

router.post('/crop', isAuthenticated, async (req: Request, res: Response, next: NextFunction) => {
    try {
        sharp.cache(false);
        const { originalImageUrl, croppedImageUrl, cropDetails } = req.body;

        let { width, height, x, y } = cropDetails;
        x = x < 0 ? 0 : x;
        y = y < 0 ? 0 : y;
    
        const publicDir = req.app.locals.publicDir;
        const originalImage = path.join(publicDir, originalImageUrl);
        const finalCroppedImagePath = path.join(publicDir, croppedImageUrl);
        
        const image = sharp(originalImage);
        const data = await image
        .extract({ left: parseInt(x, 10), top: parseInt(y, 10), width: parseInt(width, 10), height: parseInt(height, 10) })
        .resize(250, 250).jpeg().toBuffer();
        
        fs.writeFile(finalCroppedImagePath, data, (err) => {
            if (err) {
                next(systemError(err.message));
            } else {
                res.sendStatus(201);
            }
        });
    } catch (e) {
        next(systemError(e.message));
    }
});

export default router;