const fs = require('fs');
const { dirname } = require('path');

const db = require('../database/models');

const Product = db.Product;
const CategoryProduct = db.CategoryProduct;
const DetailProduct = db.DetailProduct;
const Attribute = db.Attribute;

const path = require('path');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

const productController = {
    add: async(req,res)=> {
         const categories = await CategoryProduct.findAll();
            res.render("productAdd", { categories, details : [], imagePath: null, errors: [], old: null});
    },
    create: async(req,res) => {
        let errors = validationResult(req);

        let imagePath;

        if(req.session.imagePath){
        imagePath = req.session.imagePath;
        }

        console.log(imagePath);

        console.log(errors);
        if(errors.isEmpty()){
        try {
            const product = await Product.create({
              name: req.body.name,
              description: req.body.description,
              price: parseFloat(req.body.price),
              img: imagePath? imagePath : 'cover-list.png',
              categoryId: +req.body.categoryId,
            });
        
            const categoryProduct = product.categoryId;
        
            const attributesProduct = await Attribute.findAll({
              where: {
                categoryId: categoryProduct,
              },
            });
        
            await Promise.all(
              attributesProduct.map(async (attribute) => {
                await DetailProduct.create({
                  productId: +product.id,
                  attributeId: +attribute.id,
                  value: req.body[attribute.name]
                });
              })
            );

            delete req.session.imagePath;
        
            return res.redirect('/home');
          } catch (error) {
            console.error('Error al crear el producto:', error);
            return res.status(500).send('Error interno al crear el producto');
          }
        } else {
            const categories = await CategoryProduct.findAll();
            return res.render("productAdd", { categories, details : [], errors: errors.mapped(), old: req.body, imagePath: req.session.imagePath? '/images/' + imagePath : null,});
            
        }
    },
    edit: async(req, res) => {
        const idProduct = req.params.id;

        try {
        const product = await Product.findByPk(idProduct, {
            include: [{association: 'category'}]
        });

        const details = await DetailProduct.findAll({
            where:{
                productId : idProduct
            },
            include: [{ model: Attribute }]
        })

        console.log(product.id + 'HOLAAAAAA');
        res.render("productEdit", { product , details } );
        }catch(error){
            console.error('Error al obtener detalles del producto:', error);
            res.status(500).send('Error interno al obtener detalles del producto');
        }
    },
    update: async(req,res)=>{
        try{        
            
        const idProduct = +req.params.id;

        const original = await Product.findByPk(idProduct);
        const imageProduct = original.img;
        const categoryProduct = original.categoryId;

        const product = await Product.update({
              name: req.body.name,
              description: req.body.description,
              price: parseFloat(req.body.price),
              img: req.file? req.file.filename : imageProduct,
              categoryId: +categoryProduct,
        },{
            where:{
                id: idProduct
            }
        })

        const attributesProduct = await Attribute.findAll({
            where: {
                categoryId: categoryProduct
            }
        });

        await Promise.all(
            attributesProduct.map(async (attribute) => {
                await DetailProduct.update({
                    value: req.body[attribute.name]
                },{
                    where:{
                        productId: idProduct,
                        attributeId: attribute.id
                    }
                })
            })
        );

        res.redirect(`/product/detail/${idProduct}`);

        } catch (error) {
            console.error('Error al actualizar el producto:', error);
            return res.status(500).send('Error interno al actualizar el producto');
        }
    },
    delete: async(req,res)=>{

        const idProduct= +req.params.id;
        const productImg = await Product.findByPk(idProduct).img;

        await DetailProduct.destroy({
            where: {
                productId: idProduct
            }
        }); 

        await Product.destroy({
            where:{
                id: idProduct
            }
        });

        let imagen = path.join(__dirname, '../../public/images/' + productImg)
        if(fs.existsSync(imagen)){
            fs.unlinkSync(imagen)
        }

        return res.redirect('/product/all'); 
    },
    detail: async(req,res)=> {

        const idProduct = req.params.id;

        const product = await Product.findByPk(idProduct,{
            include: [{association: 'category'}]
        });

        const attributesProduct = await DetailProduct.findAll({
            where: {
                productId : idProduct
            },
            include: [{ model: Attribute }]
        });

        res.render("productDetail",{ product, attributes: attributesProduct});
    },
    list: async(req, res) => {
        const rowCount = await Product.count();
        const itemsPerPage = 6;
        console.log(rowCount);
        const pagesCount = rowCount%itemsPerPage!=0? rowCount/itemsPerPage + 1 : rowCount/itemsPerPage
        console.log(pagesCount);
        
        let page = +req.query.page? +req.query.page == 0? 1 : +req.query.page > pagesCount? pagesCount : +req.query.page : 1;
        const offset = (page - 1) * itemsPerPage;

        const products = await Product.findAll({
            limit: itemsPerPage,
            offset: offset,
            include: [{ association: 'category'}]
        });

        const categories = await CategoryProduct.findAll();

        return res.render('productsList', { products, categories, currentPage: page });
    },
    search: async(req, res) => {
        const searchedProduct = req.query.searched;
        const categories = await CategoryProduct.findAll();

        const productsFound = await Product.findAll({
            where: {
                [Op.or]:{
                    name: {
                        [Op.like]: '%' + searchedProduct + '%'
                    },
                    description: {
                        [Op.like]: '%' + searchedProduct + '%'
                    }
                } 
            },
            include: [{ association: 'category'}]
        }); 

         return res.render('productsList', { products : productsFound, categories});
    },
    filter: async(req, res) => {

        const categoryFilter = req.query.categoryFilter;
        const priceFilter = req.query.priceFilter;
        const discountFilter = req.query.discountFilter;

        let whereCondition = {};

        if(categoryFilter !== ''){
            whereCondition.categoryId = categoryFilter;
        }

        if(priceFilter != 100000){
            whereCondition.price ={
                [Op.between]: [priceFilter <= 500? priceFilter : priceFilter - 500, priceFilter <= 99.500? priceFilter + 500: priceFilter]
            };
        }

        if(discountFilter != 0){
            whereCondition.discount = discountFilter;
        }

        const categories = await CategoryProduct.findAll();

        const productsFound = await Product.findAll({
            where: {
                [Op.or]: whereCondition
            },
            include: [{ association: 'category'}]
        }); 

         return res.render('productsList', { products : productsFound, categories});
    }
}

module.exports = productController;