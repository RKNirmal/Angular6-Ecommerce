'use strict'
const express = require('express')
const router = express.Router()
const product = require('./models/product') //product model schema
const mongo = require('mongodb').MongoClient
//const { isUser, isAdmin } = require('./middleware/verifyToken')

router.get('/:category(products|fruit|vegetable)', async(req, res) => {
    //function to render the fetched product to page
    function renderResult(res, products) {
        console.log(products.length) //no.of products after filtering with the requested category
        res.render('welcome.html', { products }, function(err, result) {
            if (!err) {
                res.end(result)
            } else {
                res.end('Oops ! An error occurred.')
                console.log(err)
            }
        })
    }
    //function to filter based on category received from req.params.category
    function filter(category) {
        if (category === 'products') {
            product.find({}, (err, products) => {
                if (err) {
                    res.end(err)
                }
                //console.log(products)
                renderResult(res, products) //calls the below function
            })
        } else {
            product.find({ productCategory: category }, (err, products) => {
                if (err) {
                    res.end(err)
                }
                //console.log(products)
                renderResult(res, products) //calls the below function
            })
        }
    }
    try {
        console.log(req.params.category) //logs the requested category to console
        let category = req.params.category
        console.log(
            `category name: "${category}" received from POST req to GET req`
        )
        filter(category)
    } catch (err) {
        console.log(err)
    }
})

router.post('/product', async(req, res) => {
    try {
        mongo.connect(process.env.DB_CONNECTION, function(err) {
            if (err) throw err
            let category = req.body.category //get the category from the request
            console.log('this is the category name:' + category)
            res.redirect('/' + category) //redirect to get request
        })
    } catch (err) {
        console.log(err)
    }
})

//fetch product api
router.get('/fetch-product', (req, res) => {
    product.find({}, (err, items) => {
      console.log(items)
        if (err) {
            console.log(err)
            res.status(500).send('An error occurred', err)
        } else {
          res.json({items}).data
    }
})
})

function saveImage(obj, imgEncoded) {
    // CHECKING FOR IMAGE IS ALREADY ENCODED OR NOT
    const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']
    if (imgEncoded == null) return

    // ENCODING IMAGE BY JSON PARSE
    // The JSON.parse() method parses a JSON string
    const img = JSON.parse(imgEncoded)
        //console.log('JSON parse: ' + img)

    // CHECKING FOR JSON ENCODED IMAGE NOT NULL
    // AND HAVE VALID IMAGE TYPES WITH IMAGE MIME TYPES
    if (img != null && imageMimeTypes.includes(img.type)) {
        // SETTING IMAGE AS BINARY DATA
        obj.productImg = new Buffer.from(img.data, 'base64')
    }
}

router.post('/create-product', async(req, res) => {
    //obj to get all required fields in product schema to create a product in mongodb
    let obj = {
            productName: req.body.name,
            productDesc: req.body.description,
            productPrice: req.body.price,
            productCategory: req.body.category,
            productImg: {
                type: Buffer,
                //required: true
            }
        }
        //saving image as base64-buffer in mongodb itself
    let img = req.body.img
    saveImage(obj, img)
        //create the product with all details saved in object "obj" variable as async function
    try {
        product.create(obj, async(err, item) => {
            if (err) {
                console.log(err)
            } else {
                console.log(`product created with the following details: ${item}`)
                    //redirect once successfully product got created in database
                res.redirect('fetch-product')
            }
        })
    } catch (err) {
        //error handling
        console.log(err)
    }
})

module.exports = router