var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var authenticate = require('../authenticate');
const cors = require('./cors');
const Favorites = require('../models/favorites');

var router = express.Router();
router.use(bodyParser.json());

router.route('/')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.get(cors.cors, authenticate.verifyUser, function (req, res, next) {
    
    Favorites.findOne( { "postedBy" : req.user.id } )
    .populate('postedBy dishes')
    .exec(function(err,favorite){
        if (err) return next(err);
        res.json(favorite);
    });
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    
    var dishId = req.body.idDish;
    var userId = req.user.id;
        
    Favorites.findOne( { "postedBy" : req.user.id }, function(err,favorite){
        if (err) throw err;
        if(! favorite){
            favorite = {
                postedBy : userId,
                dishes: [dishId]
            };
            Favorites.create(favorite, function(err, favorite){
                if (err) return next(err);
                res.json(favorite);
            });
        } else {            
            if(favorite.dishes.indexOf(dishId) < 0){
                favorite.dishes.push(dishId);
                favorite.save(function(err, favorite){
                    if (err) return next(err);
                    res.json(favorite);
                });
            } else {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'application/json');
                res.json({"message": "Dish already in favorites"});
            }
        }
    });
})
.delete( authenticate.verifyUser , function (req, res, next) {
    Favorites.remove( { "postedBy": req.user.id }, function (err, resp) {
        if (err) throw err;
        res.json(resp);
    });
});

router.route('/:dishId')
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    var dishId = req.params.dishId;
    var userId = req.user.id;
        
    Favorites.findOne( { "postedBy" : req.user.id }, function(err,favorite){
        if (err) throw err;
        if(! favorite){
            favorite = {
                postedBy : userId,
                dishes: [dishId]
            };
            Favorites.create(favorite, function(err, favorite){
                if (err) return next(err);
                res.json(favorite);
            });
        } else {            
            if(favorite.dishes.indexOf(dishId) < 0){
                favorite.dishes.push(dishId);
                favorite.save(function(err, favorite){
                    if (err) return next(err);
                    res.json(favorite);
                });
            } else {
                res.statusCode = 403;
                res.setHeader('Content-Type', 'application/json');
                res.json({"message": "Dish already in favorites"});
            }
        }
    });
})
.delete( authenticate.verifyUser , function (req, res, next) {

    Favorites.find({'postedBy': req.user.id }, function (err, favorites) {
        if (err) return err;
        var favorite = favorites ? favorites[0] : null;

        if (favorite) {
            for (var i = (favorite.dishes.length - 1); i >= 0; i--) {
                if (favorite.dishes[i] == req.params.dishId) {
                    favorite.dishes.remove(req.params.dishId);
                }
            }
            favorite.save(function (err, favorite) {
                if (err) throw err;
                res.json(favorite);
            });
        } else {
            res.json(favorite);
        }
    });
});

module.exports = router;