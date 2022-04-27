const autherModel = require("../model/authorModel")
const blogsModel = require("../model/blogsModel")
const moment = require('moment')

let createBlog = async function (req, res) {
    try {
        let data = req.body
        let id = data.authorId

        if (!id) return res.status(400).send({ status: false, msg: "authorId is required" })
        let findAuthor = await autherModel.findById(id)
        if (!findAuthor) return res.status(404).send({ msg: "authorId invalid" })

        let blog = await blogsModel.create(data)
        res.status(201).send({ status: true, data: blog })
    } catch (err) {
        console.log(err.message)
        res.status(500).send({ error: err.message })
    }
}
const getBlogs = async function (req, res) {

    try {

        let data = req.query;
        let filter = { $in: [{ isDeleted: false, isPublished: true, ...data }] };
        // console.log(filter);
        let blogsPresent = await blogsModel.find(filter)

        if (blogsPresent.length === 0) {
            res.status(404).send({ msg: "No blogs is present" })
        } else {
            res.status(200).send({ status: true, data: blogsPresent })
        }

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}

const putBlogs = async function (req, res) {
    try {
        let data = req.body
        let id = req.params.blogId

        if (!id) return res.status(400).send({ status: false, msg: "blogid is required" })
        let findblog = await blogsModel.findById(id)
        if (!findblog) return res.status(404).send({ msg: "blogid invalid" })
        if (findblog.isDeleted == true) return res.status(404).send({ msg: "Blog is already deleted " })
        if (findblog.isDeleted == false) {
            let updatedBlog = await blogsModel.findOneAndUpdate({ _id: id },
               {
                $set: {
                    title: data.title,
                    body: data.body,
                    category: data.category,
                    publishedAt: moment().format(),
                    isPublished: true
                },
                $push: {
                    tags: req.body.tags,
                    subcategory: req.body.subcategory
                }
              }
            , { new: true, upsert: true })
            return res.status(200).send(updatedBlog)
        }
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}
let deleted = async function (req,res){
    let id = req.params.blogId
    if(!id) return res.status(404).send({msg: "blog id is required"})
    let idvalidation = await blogsModel.findById(id)
    if(!idvalidation) return res.status(404).send({msg: "invalid blog id"})
    if (idvalidation.isDeleted==true) return res.status(404).send({msg : " blog is allready deleted"}) 
   if(idvalidation.isDeleted==false){
       let deletion = await blogsModel.findOneAndUpdate({_id:id},{isDeleted:true})
       return res.status(200).send({msg: "blog is deleted successfully"}) 
   }
}


module.exports.createBlog = createBlog
module.exports.getBlogs = getBlogs
module.exports.putBlogs = putBlogs
module.exports.deleted = deleted