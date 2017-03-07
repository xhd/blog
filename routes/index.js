var express = require('express');
var markdown=require('markdown').markdown;
var models=require('../models');
var router = express.Router();

/* GET home page. */
/*
* 分页需传参 当前页码 每页的条数
* 结果 当页的数据 一共有多少页
* */
router.get('/', function(req, res, next) {
    //user 字符串对象
    //先查找，然后把user字符串转成user对象
    var keywords=req.query.keywords;
    var pageNum=parseInt(req.query.pageNum)||1;//当前页码
    var pageSize=req.query.pageSize||2;//一页多少条

    console.log(keywords);
    if(!/^\s+$/.test(keywords)){
        req.session.keywords=keywords;
    }
        keywords=req.session.keywords;
     var reg=new RegExp(keywords,'i');
     var queryObj={$or:[{title:reg},{content:reg}]};

    models.Article.find(queryObj).skip((pageNum-1)*pageSize).limit(pageSize).populate('user').exec(function (err,articles) {
        articles.forEach(function (article) {
            article.content=markdown.toHTML(article.content)
        });
        //取得这个条件有多少条符合的数据
        models.Article.count(queryObj,function (err,count) {
            res.render('index', {
                articles: articles,
                totalPage:Math.ceil(count/pageSize),
                pageNum:pageNum,
                keywords:keywords,
                pageSize:pageSize
            });
        });


    })
});

module.exports = router;
