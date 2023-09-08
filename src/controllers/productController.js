const fs = require('fs');
let products = require('../data/products.json');
const { dirname } = require('path');


const productController = {
    detalle: (req,res)=> {
        const { id } =req.params;

        const product = products.find(p =>p.id == id)
        res.render("productDetail",{product});
    },
    add: (req,res)=> {
        res.render("productAdd");
    },
    process:(req,res)=>{
        const editedProduct={
            id: req.body.id,
        name: req.body.name,
        descripcion: req.body.descripcion,
        viñedo: req.body.viñedo,
        edad: req.body.edad,
        altitud: req.body.altitud,
        variedad: req.body.variedad,
        barriles:req.body.barriles,
        guardado:req.body.guardado,
        priceUnity:req.body.priceUnity,
        priceSix:req.body.priceSix,
        afrutado:req.body.afrutado,
        nada:req.body.nada,
        seco:req.body.seco,
        amable:req.body.amable,
        aterciopelado:req.body.aterciopelado,
        liviano:req.body.liviano,
        delicado:req.body.delicado,
        img:req.body.img,
        }

        const idProduct= req.params.id;
        products.find((p)=> p.id == idProduct? p=editedProduct : null);

        const productsJSON= JSON.stringify(products);

        fs.writeFileSync('../data/products.json', productsJSON);

        res.redirect('/product/detail/:idProduct');
    },
    deleteProduct:(req,res)=>{
        const idProduct=  parseInt(req.params.id);
        products  = products.filter((p)=> p.id !== idProduct);

        fs.writeFileSync(path.join(__dirname, '../data/products.json'),JSON.stringify(products));

        res.redirect('/home');
    }
}

module.exports = productController;