var express = require('express');
var models=require('../models');
var util=require('../util');
var auth=require('../middleware/auth');

var router = express.Router();

//注册
router.get('/reg',auth.checkNotLogin,function(req, res, next) {
  res.render('user/reg', { title: '注册' });
});

router.post('/reg',auth.checkNotLogin,function(req, res, next) {
  var user=req.body;
  if(user.password != user.repassword){
    res.redirect('back')
  }else{
      req.body.password=util.md5(req.body.password);
      //增加一个用户头像
      req.body.avatar='https://secure.gravatar.com/avatar/'+util.md5(req.body.email)+'?s=64';
    models.User.create(req.body,function (err,doc) {
      if(err){
        req.flash('error','用户注册失败');
        res.redirect('/users/login')
      }else {
        console.log(doc);
        req.flash('success','用户注册成功');
        res.redirect('/users/login')
      }

    })
  }

});
//登陆
router.get('/login',auth.checkNotLogin,function(req, res, next) {
  res.render('user/login', { title: '登陆' });
});

router.post('/login',auth.checkNotLogin,function(req, res, next) {
  req.body.password=util.md5(req.body.password);
  models.User.findOne({username:req.body.username,password:req.body.password},function (err,doc) {
    if(err){
      console.log(err);
      req.flash('error','用户登陆失败');
      res.redirect('back')
    }else{
      if(doc){//如果有值表示找到了对应用户，表示登陆成功了
        //登陆成功把查询到的用户赋值给session的user属性
        req.session.user=doc;
        req.flash('success','用户登陆成功!');
        res.redirect('/')
      }else{//找不到登录失败
        req.flash('error','用户登陆失败');
        res.redirect('back')
      }

    }
  })
});

//退出
router.get('/logout',auth.checkLogin,function(req, res, next) {
  req.session.user=null;
  req.flash('success','用户退出成功');
  res.redirect('/')
});

module.exports = router;
