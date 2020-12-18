const express = require("express")
const uniqid = require("uniqid")
const path = require("path")
const  {writeFile,createReadStream} = require("fs-extra")
const { getMedia, writeMedia } = require("../../fsUtilities")
const { check, validationResult ,matchedData} = require("express-validator")
const multer = require("multer")
const fs = require("fs")




const router = express.Router()
const upload = multer({})
mediasFileImgPath= path.join(__dirname,"../../../public/img/media")
const readFile = fileName =>{

    const buffer = fs.readFileSync(path.join(__dirname,fileName))
    const fileContent = buffer.toString()
    return JSON.parse(fileContent)
}

const addImgProperty = async (id,imgpath)=>{
    console.log("adada",id)
    const media = readFile("media.json")
    console.log("asdasdas",imgpath)
    let oneMedia = media.find((media)=>media.imdbID===id)
    oneMedia.Poster = imgpath

    fs.writeFileSync(path.join(__dirname,"media.json"),JSON.stringify(media))
}

router.post("/:id/upload",upload.single("media"),async(req,res,next)=>{
    try {
        addImgProperty(req.params.id,`http://localhost:3001//img/media/`+`${req.params.id}.jpg`)
        await writeFile(path.join(mediasFileImgPath,`${req.params.id}.jpg`),req.file.buffer)
        res.status(201).send("uploaded")
    } catch (error) {
        next(error)
    }
})

router.get("/",async(req,res,next)=>{
    try {
        const media = await getMedia()
        res.send(media)
    } catch (error) {
        console.log(error)
        next(error)
    }
})

router.post("/",
[
    check("Title").exists().withMessage("Titile is required"),
    check("Year").exists().withMessage("Year is required"),
    check("Type").exists().withMessage("Movie is required"),
    check("Poster").exists().withMessage("Poster is required"),
],
async(req,res,next)=>{
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            const error = new Error()
            error.message = errors
            error.httpStatusCode = 400
            next(error)
        }else{
            const media = await getMedia()
            const newMedia = {
                ...req.body,
                imdbID :uniqid(),
            }
            media.push(newMedia)
            await writeMedia(media)
            res.status(201).send({imdbID:req.body.imdbID})
        }
        
    } catch (error) {
        next(error)
    }
})

router.put(
    "/:id",
[
    check("Title").exists().withMessage("Titile is required"),
    check("Year").exists().withMessage("Year is required"),
    check("Type").exists().withMessage("Movie is required"),
    check("Poster").exists().withMessage("Poster is required"),
], async(req,res,next)=>{
    try {
        
            const validatedData = matchedData(req)
            const media = await getMedia()
            const mediaIndex = media.findIndex(media =>media.imdbID === req.params.id)

            if(mediaIndex !== -1){
                const editedMedia = [
                    ...media.slice(0,mediaIndex),
                    {...media[mediaIndex],...validatedData},
                    ...media.slice(mediaIndex+1)
                ]
                await writeMedia(editedMedia)
                res.send(editedMedia)
            }else{
                console.log(error)
                const err = new Error()
                next(err)
            }
        
    } catch (error) {
        next(error)
    }
})

router.delete("/:id",async(req,res,next)=>{
    try {
        const media = await getMedia()
        const newMedia = media.find(media=>media.imdbID!==req.params.id)
        await writeMedia(newMedia)
        res.status(204).send("its deleted")
        
        
    } catch (error) {
        console.log(error)
        next(error)
    }
})

router.post(
    "/:id/reviews",
    [
        check("rate").exists().withMessage("rate is required"),
        check("comment").exists().withMessage("comment is required"),
       
    ],
    async(req,res,next)=>{
        try {
            const errors = validationResult(req);
      
            if (errors.isEmpty()) {
              const media = await getMedia()
              console.log("sdasdsada",media)
              const singleMedia = media.find((media) => media.imdbID === req.params.id)
              if (singleMedia) {
                if (singleMedia.hasOwnProperty("reviews")) {
                  singleMedia.reviews.push({
                    ...req.body,
                    _id: uniqid(),
                    createdAt: new Date(),
                    elementId:req.params.id,
                  });
                } else {
                  singleMedia.reviews = [];
                  singleMedia.reviews.push({
                    ...req.body,
                    _id: uniqid(),
                    createdAt: new Date(),
                    elementId:req.params.id,
                  })
                }
      
                await writeMedia(media);
      
                res.status(201).send(singleMedia.comments);
              } else {
                const err = new Error();
                err.message = "Book ID not found";
                err.httpStatusCode = 404;
                next(err);
              }
            } else {
              const err = new Error();
              err.message = validationErrors;
              err.httpStatusCode = 400;
              next(err);
            }
          } catch (error) {
            console.log(error);
            next(error);
          }
    }
    )
    router.delete("/:id/reviews/:reviewsId",async(req,res,next)=>{
        try {
            const media = await getMedia()
            const mediaIndex = media.findIndex((media) => media.imdbID === req.params.id)
    console.log(mediaIndex);
    if (mediaIndex !== -1) {
      media[mediaIndex].reviews = media[mediaIndex].reviews.filter(
        (review) => review._id !== req.params.reviewsId
      );
      console.log(media[mediaIndex],"what is happening");
      await writeMedia(media);
      res.status(204).send("okeeej");
    } else {
    }
        } catch (error) {
            next(error)
        }
    })

module.exports = router