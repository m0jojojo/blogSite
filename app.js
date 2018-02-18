var express           =require("express"),
	app               =express(),
 	bodyParser        =require("body-parser"),
 	mongoose          =require("mongoose"),
 	methodOverride    =require("method-override"),
 	expressSanitizer  =require("express-sanitizer");

mongoose.connect("mongodb://localhost/blog_app");
app.set("view engine","ejs");

//for custom stylesheets
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));

//it overrides the HTTP verb with the value of the parameter "_method" to make the specified request
app.use(methodOverride("_method"));

//it removes all the script tags from the input by the user
//it should be used after bodyParser
app.use(expressSanitizer()); 

//MONGOOSE/MODEL/CONFIG
var blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: {type: Date, default: Date.now}
});

//compiling schema into model,so that we can use functions to interact with mongoDB
//it also creates a collection named "blogs"(makes plural) in "blog_app" DB
var Blog= mongoose.model("Blog",blogSchema);

//===============
//RESTful ROUTES
//===============

//ROOT Route
app.get("/",function(req,res){
	res.redirect("/blogs");
});

//INDEX Route
app.get("/blogs",function(req,res){
	Blog.find({},function(err,blogs){
		if(err){
			console.log("ERROR");
		}
		else{
			res.render("index",{blogs:blogs});
		}
	});
});

//NEW Route
app.get("/blogs/new",function(req,res){
	res.render("new");
});

//CREATE Route
app.post("/blogs",function(req,res){
	//create blog and save to database

	//sanitizing before creation
	req.body.blog.body=req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog,function(err,neBlog){
		if(err){
			res.render("new");
		}
		//redirect to INDEX
		else{
			res.redirect("/blogs"); 
		}
	});
	
});

//SHOW Route
app.get("/blogs/:id",function(req,res){
	Blog.findById(req.params.id,function(err,foundBlog){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.render("show",{blog:foundBlog});
		}
	});
});

//EDIT Route
app.get("/blogs/:id/edit",function(req,res){
	Blog.findById(req.params.id,function(err,foundBlog){
		if(err){
			 res.redirect("/blogs");
		}
		else{
			res.render("edit",{blog:foundBlog});
		}
	});
});

//UPDATE Route
app.put("/blogs/:id",function(req,res){
	//sanitizing before updating
	req.body.blog.body=req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id,req.body.blog,function(err,updatedBlog){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.redirect("/blogs/"+req.params.id);
		}
	});
});

//DESTROY Route
app.delete("/blogs/:id",function(req,res){
	Blog.findByIdAndRemove(req.params.id,function(err){
		if(err){
			res.redirect("/blogs");
		}
		else{
			res.redirect("/blogs");
		}
	});
});

//local server
app.listen(2323,function(){
	console.log("Server Started!!");
})